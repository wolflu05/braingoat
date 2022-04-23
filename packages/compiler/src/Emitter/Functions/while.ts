import { ErrorType } from "../../Braingoat";
import { AST } from "../../AST";
import { Emitter } from "..";
import { LineType } from "../../Tokenizer";
import { Int } from "../DataTypes/Int";

export const whileFunc = (emitter: Emitter, args: AST[], block: AST[], source: LineType) => {
  if (args.length !== 1) {
    emitter.braingoat.throwError(ErrorType.CompileError, `while expected only 1 argument, got ${args.length}`, source);
  }

  const variable = new Int(emitter, null, null, args[0].source);

  emitter.codeBuilder`
    ${() => {
      emitter.emitExpression(variable, args[0]);
    }}
    ${variable}[
      ${() => {
        emitter.emit(block);
      }}
      ${() => {
        emitter.emitExpression(variable, args[0]);
      }}
    ${variable}]
  `;

  variable.destroy();
};
