import { ErrorType } from "../Braingoat";
import { Emitter } from "../Components/Emitter";
import { LineType, TokenType } from "../Components/Tokenizer";
import { BasicDataType, memoryPositionType } from "../Types/BasicDataType";
import { Int } from "./Int";

const TMP_CELLS = 4;
export class IntList extends BasicDataType {
  length: number | any;
  array: Int[];
  tmpCells: Int[];

  constructor(
    emitter: Emitter,
    name: string | null,
    variableOptions: TokenType | null,
    source: LineType,
    addToMemory = true,
    position?: memoryPositionType,
  ) {
    super(emitter, name, variableOptions, source);

    if (!this.variableOptions) {
      this.emitter.braingoat.throwError(
        ErrorType.CompileError,
        `IntList expected length as variable options`,
        this.source,
      );
    }

    if (Number.isNaN(+this.variableOptions.value)) {
      this.emitter.braingoat.throwError(
        ErrorType.CompileError,
        `${this.variableOptions.value} is no valid length`,
        this.variableOptions.source,
      );
    }

    this.length = +this.variableOptions.value;
    this.array = [];
    this.tmpCells = [];
    this.allocate(addToMemory, position);
  }

  allocate(addToMemory: boolean, position?: memoryPositionType) {
    if (!position) {
      this.position = this.emitter.getNextNEmpty(this.length + TMP_CELLS);
    } else {
      this.position = position;
    }

    if (addToMemory) this.emitter.memoryAllocation.push(this);

    let tmpOffset = this.position[0];
    for (let i = tmpOffset; i < tmpOffset + TMP_CELLS; i++) {
      this.tmpCells.push(new Int(this.emitter, null, null, this.source, false, [i, i]));
    }

    let arrayOffset = this.position[0] + this.tmpCells.length;
    for (let i = arrayOffset; i < arrayOffset + this.length; i++) {
      this.array.push(new Int(this.emitter, null, null, this.source, false, [i, i]));
    }
  }

  reset() {
    for (const int of this.array) {
      int.reset();
    }
  }

  resetTmpCells() {
    for (const int of this.tmpCells) {
      int.reset();
    }
  }

  destroy() {
    this.reset();
    const idx = this.emitter.memoryAllocation.findIndex((v) => v === this);

    if (idx !== -1) {
      this.emitter.memoryAllocation.splice(idx, 1);
    }
  }

  getItem(idxVariable: Int | number) {
    if (idxVariable instanceof Int) {
      this.resetTmpCells();

      this.tmpCells[1].set(idxVariable);
      this.tmpCells[2].set(idxVariable);

      this.emitter.codeBuilder`
      ${this.tmpCells[1]}+  
      ${this.tmpCells[2]}+
      ${this.tmpCells[0]}
        >>[
          -
          [>+<-]
          <[>+<-]
          >>>[<<<+>>>-]
        <]

        <<[>>+>+<<<-]
        >>>[<<<+>>>-]

        <<[  
            -
            <[>>>+<<<-]
            >[<+>-]
            >[<+>-]
        <<]<
      `;

      return this.tmpCells[2].clone();
    } else {
      if (idxVariable >= this.length) {
        this.emitter.braingoat.throwError(
          ErrorType.CompileError,
          `Cannot set ${this.name} with length ${this.length} at ${idxVariable}`,
          this.source,
        );
      }

      return this.array[idxVariable].clone();
    }
  }

  setItem(idxVariable: Int | number, value: Int | number) {
    if (idxVariable instanceof Int) {
      this.resetTmpCells();

      this.tmpCells[0].set(value);
      this.tmpCells[1].set(idxVariable);
      this.tmpCells[2].set(idxVariable);

      this.emitter.codeBuilder`
      ${this.tmpCells[1]}+  
      ${this.tmpCells[2]}+
      ${this.tmpCells[0]}
        >>[ -
          [>+<-]
          <[>+<-]
          <[>+<-]
          >>>>[<<<<+>>>>-]
        <]
        
        <<<[-]
        >[<+>-]

        >[  -
            [<+>-]
            <<[>>>>+<<<<-]
        >]<
      `;
    } else {
      if (idxVariable >= this.length) {
        this.emitter.braingoat.throwError(
          ErrorType.CompileError,
          `Cannot set ${this.name} with length ${this.length} at ${idxVariable}`,
          this.source,
        );
      }

      this.array[idxVariable].set(value);
    }
  }
}
