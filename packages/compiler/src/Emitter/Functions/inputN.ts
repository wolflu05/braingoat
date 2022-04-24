import { ErrorType } from "../../Braingoat";
import { AST, blockType, TOKEN_TYPES, VARIABLE_LITERAL_OPTIONS } from "../../AST";
import { Emitter } from "..";
import { LineType } from "../../Tokenizer";
import { Int } from "../DataTypes/Int";
import { ListType } from "../AbstractDataTypes/ListType";

export const inputN = (emitter: Emitter, args: AST[], blocks: blockType[], source: LineType) => {
  if (blocks.length !== 0) {
    emitter.braingoat.throwError(
      ErrorType.CompileError,
      `inputN expected no block statement, got ${blocks.length}`,
      source,
    );
  }

  if (args.length !== 1) {
    emitter.braingoat.throwError(ErrorType.CompileError, `inputN expected 1 argument, got ${args.length}`, source);
  }

  if (args[0].type === TOKEN_TYPES.VARIABLE_LITERAL) {
    const tokenOptions = args[0].tokenOptions as VARIABLE_LITERAL_OPTIONS;
    const parameterVar = emitter.getVariable(tokenOptions.name, args[0].source);

    if (parameterVar instanceof ListType && tokenOptions.index) {
      const tmp = new Int(emitter, null, null, args[0].source);
      tmp.inputN();
      const idx = new Int(emitter, null, null, args[0].source);
      emitter.emitExpression(idx, tokenOptions.index);

      parameterVar.setItem(idx, tmp);
      tmp.destroy();
      idx.destroy();
    } else {
      parameterVar.inputN();
    }
  } else {
    emitter.braingoat.throwError(
      ErrorType.CompileError,
      `inputN can only be used with a variable as parameter`,
      args[0].source,
    );
  }
};
