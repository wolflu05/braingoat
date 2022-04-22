import { ErrorType } from "../../Braingoat";
import { AST } from "../../AST";
import { Emitter } from "..";
import { LineType } from "../../Tokenizer";
import { Int } from "../DataTypes/Int";

export const print = (emitter: Emitter, args: AST[], block: AST[], source: LineType) => {
  if (block.length !== 0) {
    emitter.braingoat.throwError(ErrorType.CompileError, `print expected no block statement`, source);
  }

  if (args.length !== 1) {
    emitter.braingoat.throwError(ErrorType.CompileError, `print expected only 1 argument, got ${args.length}`, source);
  }

  const variable = new Int(emitter, null, null, args[0].source);
  emitter.emitExpression(variable, args[0]);

  emitter.codeBuilder`${variable}.`;

  variable.destroy();
};
