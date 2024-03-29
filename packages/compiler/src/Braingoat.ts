import { AST } from "./AST";
import { Emitter } from "./Emitter";
import { LineType, Tokenizer, TokenType } from "./Tokenizer";
import { CompileError, SyntaxError } from "./utils/errors";

export enum ErrorType {
  SyntaxError = "SyntaxError",
  CompileError = "CompileError",
}

export interface BraingoatOptions {
  debug?: boolean;
}

export class Braingoat {
  code: string[];
  bfCode: string;
  debug: boolean;

  constructor(code: string, options: BraingoatOptions = {}) {
    this.code = code.split("\n");
    this.bfCode = "";
    this.debug = options.debug ?? false;
  }

  compile() {
    const tokens = Tokenizer.tokenize(this.code);
    this.log("TOKENS", tokens);
    const ast = AST.parse(tokens, this);
    this.log("AST", ast);
    const emitter = new Emitter(ast, this).emit();
    this.bfCode = emitter.code;

    return this;
  }

  throwError(type: ErrorType, message: string, token?: TokenType | LineType): never {
    if (!token) token = { startLine: 0, startCol: 0, endLine: 0, endCol: 0 };
    let source;
    if ("source" in token) {
      source = token.source as LineType;
    } else {
      source = token;
    }

    let stack = "";
    stack += `${this.code[source.startLine - 2] || ""}\n`;
    stack += `${this.code[source.startLine - 1] || ""}\n`;
    stack += `${" ".repeat(source.startCol)}${"^".repeat(source.endCol - source.startCol)} L${source.startLine}:${source.startCol
      }-${source.endCol}\n`;
    stack += `${" ".repeat(source.startCol)}${type}: ${message}`;

    if (type == ErrorType.SyntaxError) {
      const error = new SyntaxError(message, stack, source);
      throw error;
    }

    if (type == ErrorType.CompileError) {
      const error = new CompileError(message, stack, source);
      throw error;
    }

    throw new Error(stack);
  }

  log(...args: any[]): void {
    if (this.debug) {
      console.log(...args)
    }
  }
}
