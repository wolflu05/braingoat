import { ErrorType } from "../../Braingoat";
import { Emitter } from "..";
import { LineType, TokenType } from "../../Tokenizer";

export type memoryPositionType = [number, number];

export abstract class BasicDataType {
  emitter: Emitter;
  name: string | null;
  variableOptions: TokenType | null;
  position: memoryPositionType;
  source: LineType;
  addToMemory: boolean;

  constructor(
    emitter: Emitter,
    name: string | null,
    variableOptions: TokenType | null,
    source: LineType,
    addToMemory = true,
    position?: memoryPositionType,
  ) {
    this.emitter = emitter;
    this.position = position || [0, 0];
    this.source = source;
    this.variableOptions = variableOptions;
    this.addToMemory = addToMemory;

    if (this.emitter.memoryAllocation.some((x) => x.name === name) && name !== null) {
      this.emitter.braingoat.throwError(ErrorType.CompileError, `Redeclaration of variable ${name}`, source);
    }

    this.name = name;
  }

  toString() {
    return this.name;
  }

  throwNotImplemented(name: string): never {
    this.emitter.braingoat.throwError(
      ErrorType.CompileError,
      `${name} is not implemented on ${this.constructor.name}.`,
    );
  }

  getPosition(): number {
    this.throwNotImplemented("getPosition");
  }

  allocate(addToMemory: boolean, position?: memoryPositionType) {
    this.throwNotImplemented("allocate");
  }

  reset() {
    this.throwNotImplemented("reset");
  }

  clone() {
    this.throwNotImplemented("clone");
  }

  destroy() {
    this.throwNotImplemented("destroy");
  }

  set(variable: BasicDataType | any) {
    this.throwNotImplemented("set");
  }

  print() {
    this.throwNotImplemented("print");
  }
}
