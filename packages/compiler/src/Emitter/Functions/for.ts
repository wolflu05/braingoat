import { ErrorType } from "../../Braingoat";
import {
  AST,
  blockType,
  EXPRESSION_OPERATOR_TYPE,
  EXPRESSION_OPTIONS,
  TOKEN_TYPES,
  VALUE_LITERAL_OPTIONS,
  VARIABLE_LITERAL_OPTIONS,
} from "../../AST";
import { Emitter } from "..";
import { LineType } from "../../Tokenizer";
import { Int } from "../DataTypes/Int";
import { ListType } from "../AbstractDataTypes/ListType";

export const forFunc = (emitter: Emitter, args: AST[], blocks: blockType[], source: LineType) => {
  if (blocks.length !== 1) {
    emitter.braingoat.throwError(ErrorType.CompileError, `for expected 1 block, got ${blocks.length}`, source);
  }

  if (args.length !== 2) {
    emitter.braingoat.throwError(ErrorType.CompileError, `for expected 2 arguments, got ${args.length}`, source);
  }

  const [elArg, listArg] = args;

  if (elArg.type !== TOKEN_TYPES.VARIABLE_LITERAL || listArg.type !== TOKEN_TYPES.VARIABLE_LITERAL) {
    emitter.braingoat.throwError(ErrorType.CompileError, `for expected two variables as parameter`, args[0].source);
  }

  const elArgTokenOptions = elArg.tokenOptions as VARIABLE_LITERAL_OPTIONS;
  const listArgTokenOptions = listArg.tokenOptions as VARIABLE_LITERAL_OPTIONS;
  const elArgVar = emitter.getVariable(elArgTokenOptions.name, args[0].source);
  const listArgVar = emitter.getVariable(listArgTokenOptions.name, args[0].source);

  if (!(listArgVar instanceof ListType)) {
    emitter.braingoat.throwError(
      ErrorType.CompileError,
      `for expected ListType as second parameter, got ${listArgVar.constructor.name}`,
      args[0].source,
    );
  }

  if (!(elArgVar instanceof listArgVar.base)) {
    emitter.braingoat.throwError(
      ErrorType.CompileError,
      `first parameter expected to be of type ${listArgVar.base.constructor.name}`,
    );
  }

  const idxName = `.${Math.random().toString(36)}`;
  const idx = new Int(emitter, idxName, null, args[0].source);
  const shouldLoop = new Int(emitter, null, null, args[0].source);
  const expression = new AST(
    TOKEN_TYPES.EXPRESSION,
    {
      op: EXPRESSION_OPERATOR_TYPE.LT,
      leftNode: new AST(
        TOKEN_TYPES.VARIABLE_LITERAL,
        { name: idxName, index: null } as VARIABLE_LITERAL_OPTIONS,
        args[0].source,
      ),
      rightNode: new AST(
        TOKEN_TYPES.VALUE_LITERAL,
        { type: "NUMBER", value: listArgVar.length } as VALUE_LITERAL_OPTIONS,
        args[0].source,
      ),
    } as EXPRESSION_OPTIONS,
    args[0].source,
  );
  const emitExpression = () => {
    emitter.emitExpression(shouldLoop, expression);
  };

  emitter.codeBuilder`
    ${emitExpression}${shouldLoop}[
      ${() => {
        const tmpEL = listArgVar.getItem(idx);
        elArgVar.set(tmpEL);
        tmpEL.destroy();

        emitter.emit(blocks[0].block);
      }}

      ${idx}+
      ${emitExpression}${shouldLoop}
    ]
  `;

  idx.destroy();
  shouldLoop.destroy();
};
