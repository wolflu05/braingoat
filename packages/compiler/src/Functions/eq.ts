import { ErrorType } from "../Braingoat";
import { AST } from "../Components/AST";
import { Emitter } from "../Components/Emitter";
import { LineType, TokenType } from "../Components/Tokenizer";
import { Int } from "../DataTypes/Int";

export const eq = (emitter: Emitter, args: TokenType[], block: AST[], source: LineType) => {
  if (block.length !== 0) {
    emitter.braingoat.throwError(ErrorType.CompileError, `eq expected no block statement`, source);
  }

  if (args.length !== 2) {
    emitter.braingoat.throwError(ErrorType.CompileError, `eq expected only 2 arguments, got ${args.length}`, source);
  }

  const a = emitter.getVariable(args[0].value, args[0].source);
  const b = emitter.getVariable(args[1].value, args[1].source);

  if (!(a instanceof Int) || !(b instanceof Int)) {
    emitter.braingoat.throwError(ErrorType.CompileError, `eq arguments expected to be of type Int`, source);
  }

  a.eq(b);
};
