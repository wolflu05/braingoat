import { ErrorType } from "../Braingoat";
import { Emitter } from "../Components/Emitter";
import { LineType } from "../Components/Tokenizer";

export type memoryPositionType = [number, number];

export abstract class BasicDataType {
  emitter: Emitter;
  name: string | null;
  position: memoryPositionType;
  source: LineType;

  constructor(emitter: Emitter, name: string | null, source: LineType) {
    this.emitter = emitter;
    this.position = [0, 0];
    this.source = source;

    if (this.emitter.memoryAllocation.some((x) => x.name === name) && name !== null) {
      this.emitter.braingoat.throwError(ErrorType.CompileError, `Redeclaration of variable ${name}`, source);
    }

    this.name = name;
  }

  toString() {
    return this.name;
  }
}
