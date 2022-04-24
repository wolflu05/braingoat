import { ErrorType } from "../../Braingoat";
import { AST, blockType, TOKEN_TYPES, VARIABLE_LITERAL_OPTIONS } from "../../AST";
import { Emitter } from "..";
import { LineType } from "../../Tokenizer";
import { Int } from "../DataTypes/Int";
import { NumberType } from "../AbstractDataTypes/NumberType";

export const printN = (emitter: Emitter, args: AST[], blocks: blockType[], source: LineType) => {
  if (blocks.length !== 0) {
    emitter.braingoat.throwError(
      ErrorType.CompileError,
      `printN expected no block statement, got ${blocks.length}`,
      source,
    );
  }

  if (args.length !== 1) {
    emitter.braingoat.throwError(ErrorType.CompileError, `printN expected 1 argument, got ${args.length}`, source);
  }

  if (args[0].type === TOKEN_TYPES.VARIABLE_LITERAL) {
    const tokenOptions = args[0].tokenOptions as VARIABLE_LITERAL_OPTIONS;
    const parameterVar = emitter.getVariable(tokenOptions.name, args[0].source);

    if (parameterVar && !tokenOptions.index) {
      if (!(parameterVar instanceof NumberType)) {
        emitter.braingoat.throwError(
          ErrorType.CompileError,
          `printN expected NumberType, got ${parameterVar.constructor.name}`,
          args[0].source,
        );
      }

      return parameterVar.printN();
    }
  }

  const variable = new Int(emitter, null, null, args[0].source);
  emitter.emitExpression(variable, args[0]);

  variable.printN();

  variable.destroy();
};
