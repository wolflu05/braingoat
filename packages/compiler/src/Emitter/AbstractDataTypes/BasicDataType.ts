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

  constructor(emitter: Emitter, name: string | null, variableOptions: TokenType | null, source: LineType) {
    this.emitter = emitter;
    this.position = [0, 0];
    this.source = source;
    this.variableOptions = variableOptions;

    if (this.emitter.memoryAllocation.some((x) => x.name === name) && name !== null) {
      this.emitter.braingoat.throwError(ErrorType.CompileError, `Redeclaration of variable ${name}`, source);
    }

    this.name = name;
  }

  toString() {
    return this.name;
  }
}
