import { Emitter } from "..";
import { LineType, TokenType } from "../../Tokenizer";
import { memoryPositionType } from "../AbstractDataTypes/BasicDataType";
import { NumberType } from "../AbstractDataTypes/NumberType";

export type IntCast = number | string | Int;

export class Int extends NumberType {
  constructor(
    emitter: Emitter,
    name: string | null,
    variableOptions: TokenType | null,
    source: LineType,
    addToMemory = true,
    position?: memoryPositionType,
  ) {
    super(emitter, name, variableOptions, source);

    this.allocate(addToMemory, position);
  }

  allocate(addToMemory: boolean, position?: memoryPositionType) {
    if (!position) {
      this.position = this.emitter.getNextNEmpty(1);
    } else {
      this.position = position;
    }

    if (addToMemory) this.emitter.memoryAllocation.push(this);
  }

  getPosition() {
    return this.position[0];
  }

  reset() {
    this.emitter.codeBuilder`${this}[-]`;
  }

  clone() {
    const tmp = new Int(this.emitter, null, null, this.source);
    const newVariable = new Int(this.emitter, null, null, this.source);

    // move value of this cell to tmp and newVariable
    this.emitter.codeBuilder`${this}[${tmp}+${newVariable}+${this}-]`;

    // move back tmp to to this cell
    this.emitter.codeBuilder`${tmp}[${this}+${tmp}-]`;

    // destroy tmp variable to free memory
    tmp.destroy();

    return newVariable;
  }

  destroy() {
    this.reset();
    const idx = this.emitter.memoryAllocation.findIndex((v) => v === this);

    if (idx !== -1) {
      this.emitter.memoryAllocation.splice(idx, 1);
    }
  }

  set(variable: Int | number) {
    this.reset();

    if (variable instanceof Int) {
      this.add(variable);
    } else {
      this.emitter.codeBuilder`${this}${"+".repeat(variable)}`;
    }
  }

  print() {
    this.emitter.codeBuilder`${this}.`;
  }

  printN() {
    this.emitter.withIntArray(10, this.source, ([x]) => {
      x.set(this);

      this.emitter.codeBuilder`
        ${x} >>++++++++++<<[->+>-[>+>>]>[+[-<+>]>+>>]<<<<<<]>>[-]>>>++++++++++<[->-[>+>>]>[+[-
        <+>]>+>>]<<<<<]>[-]>>[>++++++[-<++++++++>]<.<<+>+>[-]]<[<[->-<]++++++[->++++++++
        <]>.[-]]<<++++++[-<++++++++>]<.[-]<<[-<+>]<
      `;
    });
  }

  // math operations
  add(variable: Int) {
    const tmp = variable.clone();
    this.emitter.codeBuilder`${tmp}[${this}+${tmp}-]`;
    tmp.destroy();
  }

  subtract(variable: Int) {
    const tmp = variable.clone();
    this.emitter.codeBuilder`${tmp}[${this}-${tmp}-]`;
    tmp.destroy();
  }

  multiply(variable: Int) {
    const x = this;
    const y = variable;
    const tmp0 = new Int(this.emitter, null, null, this.source);
    const tmp1 = new Int(this.emitter, null, null, this.source);

    this.emitter.codeBuilder`
      ${x}[${tmp1}+${x}-]
      ${tmp1}[
        ${y}[${x}+${tmp0}+${y}-]
        ${tmp0}[${y}+${tmp0}-]
      ${tmp1}-]
    `;
  }

  divide(variable: Int) {
    const x = this;
    const y = variable;
    const tmp0 = new Int(this.emitter, null, null, this.source);
    const tmp1 = new Int(this.emitter, null, null, this.source);
    const tmp2 = new Int(this.emitter, null, null, this.source);
    const tmp3 = new Int(this.emitter, null, null, this.source);

    this.emitter.codeBuilder`
      ${x}[${tmp0}+${x}-]
      ${tmp0}[
      ${y}[${tmp1}+${tmp2}+${y}-]
      ${tmp2}[${y}+${tmp2}-]
      ${tmp1}[
        ${tmp2}+
        ${tmp0}-[${tmp2}[-]${tmp3}+${tmp0}-]
        ${tmp3}[${tmp0}+${tmp3}-]
        ${tmp2}[
        ${tmp1}-
        [${x}-${tmp1}[-]]+
        ${tmp2}-]
      ${tmp1}-]
      ${x}+
      ${tmp0}]
    `;
  }

  power(variable: Int) {
    const x = this;
    const y = variable.clone();
    const tmp0 = new Int(this.emitter, null, null, this.source);
    const tmp1 = new Int(this.emitter, null, null, this.source);
    const tmp2 = new Int(this.emitter, null, null, this.source);

    this.emitter.codeBuilder`
      ${x}[${tmp0}+${x}-]
      ${x}+
      ${y}[
        ${x}[${tmp2}+${x}-]
        ${tmp2}[
          ${tmp0}[${x}+${tmp1}+${tmp0}-]
          ${tmp1}[${tmp0}+${tmp1}-]
        ${tmp2}-]
      ${y}-]
    `;
  }

  // compare operations
  eq(variable: Int) {
    const x = this;
    const y = variable.clone();
    this.emitter.codeBuilder`${x}[-${y}-${x}]+${y}[${x}-${y}[-]]`;
  }

  neq(variable: Int) {
    const x = this;
    const y = variable.clone();
    this.emitter.codeBuilder`${x}[${y}-${x}-]${y}[[-]${x}+${y}]`;
  }

  lt(variable: Int) {
    this.emitter.withIntArray(5, this.source, ([x, y, tmp0, tmp1]) => {
      x.set(this);
      y.set(variable);

      this.emitter.codeBuilder`
        ${tmp0}[-]
        ${tmp1}[-] >[-]+ >[-] <<
        ${y}[${tmp0}+ ${tmp1}+ ${y}-]
        ${tmp0}[${y}+ ${tmp0}-]
        ${x}[${tmp0}+ ${x}-]+
        ${tmp1}[>-]> [< ${x}- ${tmp0}[-] ${tmp1}>->]<+<
        ${tmp0}[${tmp1}- [>-]> [< ${x}- ${tmp0}[-]+ ${tmp1}>->]<+< ${tmp0}-]
      `;

      this.set(x);
    });
  }

  lte(variable: Int) {
    this.emitter.withIntArray(5, this.source, ([x, y, tmp0, tmp1]) => {
      x.set(this);
      y.set(variable);

      this.emitter.codeBuilder`
        ${tmp0}[-]
        ${tmp1}[-] >[-]+ >[-] <<
        ${y}[${tmp0}+ ${tmp1}+ ${y}-]
        ${tmp1}[${y}+ ${tmp1}-]
        ${x}[${tmp1}+ ${x}-]
        ${tmp1}[>-]> [< ${x}+ ${tmp0}[-] ${tmp1}>->]<+<
        ${tmp0}[${tmp1}- [>-]> [< ${x}+ ${tmp0}[-]+ ${tmp1}>->]<+< ${tmp0}-]
      `;

      this.set(x);
    });
  }

  gt(variable: Int) {
    const x = variable.clone();
    x.lt(this);
    this.set(x);
    x.destroy();
  }

  gte(variable: Int) {
    const x = variable.clone();
    x.lte(this);
    this.set(x);
    x.destroy();
  }
}
