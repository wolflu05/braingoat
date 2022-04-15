import { ErrorType } from "../Braingoat";
import { AST } from "../Components/AST";
import { Emitter } from "../Components/Emitter";
import { LineType, TokenType } from "../Components/Tokenizer";
import { Int } from "../DataTypes/Int";

export const print = (emitter: Emitter, args: TokenType[], block: AST[], source: LineType) => {
  if (args.length !== 1) {
    emitter.braingoat.throwError(ErrorType.CompileError, `print expected only 1 argument, got ${args.length}`, source);
  }

  const variable = emitter.getVariable(args[0].value, args[0].source);

  if (variable instanceof Int) {
    emitter.codeBuilder`${variable}.`;
  } else {
    emitter.braingoat.throwError(ErrorType.CompileError, "Unsupported DataType for print", args[0].source);
  }
};
