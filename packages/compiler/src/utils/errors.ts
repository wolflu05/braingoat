import { LineType } from "../Components/Tokenizer";

export class SyntaxError extends Error {
  source: LineType;

  constructor(message: string, stack: string, source: LineType) {
    super(message);
    this.name = "SyntaxError";
    this.stack = stack;
    this.source = source;
  }
}

export class CompileError extends Error {
  source: LineType;

  constructor(message: string, stack: string, source: LineType) {
    super(message);
    this.name = "CompileError";
    this.stack = stack;
    this.source = source;
  }
}
