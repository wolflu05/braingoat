import { ErrorType } from "../Braingoat";
import { Emitter } from "../Components/Emitter";
import { LineType } from "../Components/Tokenizer";
import { BasicDataType } from "../Types/BasicDataType";

export type IntCast = number | string | Int;

export class Int extends BasicDataType {
  constructor(emitter: Emitter, name: string | null, value: string, source: LineType, addToMemory = false) {
    super(emitter, name, source);

    this.position = emitter.getNextNEmpty(1);
    if (addToMemory) this.emitter.memoryAllocation.push(this);

    this.set(value, false);
  }

  set(variable: IntCast, reset = true) {
    const castedVar = this.cast(variable);

    if (reset) this.reset();

    if (castedVar instanceof Int) {
      const tmp = castedVar.clone();
      this.emitter.codeBuilder`${tmp}[${this}+${tmp}-]`;
      tmp.destroy();
    } else {
      this.emitter.codeBuilder`${this}${"+".repeat(variable as number)}`;
    }
  }

  reset() {
    this.emitter.codeBuilder`${this}[-]`;
  }

  clone() {
    const tmp = new Int(this.emitter, null, "0", this.source, true);
    const newVariable = new Int(this.emitter, null, "0", this.source, true);

    // move value of this cell to tmp and newVariable
    this.emitter.codeBuilder`${this}[${tmp}+${newVariable}+${this}-]`;

    // move back tmp to to this cell
    this.emitter.codeBuilder`${tmp}[${this}+${tmp}-]`;

    // destroy tmp variable to free memory
    tmp.destroy();

    return newVariable;
  }

  cast(variable: IntCast): number | Int {
    if (typeof variable === "number") {
      return variable;
    }

    if (variable instanceof Int) {
      return variable;
    }

    if (typeof variable === "string") {
      const num = variable.match(/^\d+/);
      if (num) {
        return +num[0];
      }

      const foundVariable = this.emitter.getVariable(variable, this.source);
      if (!(foundVariable instanceof Int)) {
        this.emitter.braingoat.throwError(ErrorType.CompileError, `Cannot cast ${foundVariable} to Int`, this.source);
      }

      return foundVariable;
    }

    this.emitter.braingoat.throwError(ErrorType.CompileError, `Cannot find variable ${variable}`, this.source);
  }

  destroy() {
    this.reset();
    const idx = this.emitter.memoryAllocation.findIndex((v) => v === this);

    if (idx !== -1) {
      this.emitter.memoryAllocation.splice(idx, 1);
    }
  }
}
