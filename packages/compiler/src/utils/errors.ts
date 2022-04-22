import { LineType } from "../Tokenizer";

export class BraingoatError extends Error {
  source: LineType;

  constructor(message: string, stack: string, source: LineType) {
    super(message);
    this.stack = stack;
    this.source = source;
  }
}

export class SyntaxError extends BraingoatError {
  constructor(message: string, stack: string, source: LineType) {
    super(message, stack, source);
    this.name = "SyntaxError";
  }
}

export class CompileError extends BraingoatError {
  constructor(message: string, stack: string, source: LineType) {
    super(message, stack, source);
    this.name = "CompileError";
  }
}
