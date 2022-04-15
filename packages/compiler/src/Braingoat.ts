import { AST } from "./Components/AST";
import { Emitter } from "./Components/Emitter";
import { LineType, Tokenizer, TokenType } from "./Components/Tokenizer";
import { CompileError, SyntaxError } from "./utils/errors";

export enum ErrorType {
  SyntaxError = "SyntaxError",
  CompileError = "CompileError",
}

export class Braingoat {
  code: string[];
  bfCode: string;

  constructor(code: string) {
    this.code = code.split("\n");
    this.bfCode = "";
  }

  compile() {
    const tokens = Tokenizer.tokenize(this.code);
    const ast = AST.parse(tokens, this);
    const emitter = new Emitter(ast, this).emit();
    this.bfCode = emitter.code;

    return this;
  }

  throwError(type: ErrorType, message: string, token: TokenType | LineType): never {
    let source;
    if ("source" in token) {
      source = token.source as LineType;
    } else {
      source = token;
    }

    let stack = "";
    stack += `${this.code[source.line - 1] || ""}\n`;
    stack += `${this.code[source.line]}\n`;
    stack += `${" ".repeat(source.col)}^ L${source.line}:${source.col + 1}\n`;
    stack += `${" ".repeat(source.col)}${type}: ${message}`;

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
}
