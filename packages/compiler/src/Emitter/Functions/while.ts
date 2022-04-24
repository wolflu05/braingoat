import { ErrorType } from "../../Braingoat";
import { AST, blockType } from "../../AST";
import { Emitter } from "..";
import { LineType } from "../../Tokenizer";
import { Int } from "../DataTypes/Int";

export const whileFunc = (emitter: Emitter, args: AST[], blocks: blockType[], source: LineType) => {
  if (blocks.length !== 1) {
    emitter.braingoat.throwError(ErrorType.CompileError, `while expected 1 block, got ${blocks.length}`, source);
  }

  if (args.length !== 1) {
    emitter.braingoat.throwError(ErrorType.CompileError, `while expected 1 argument, got ${args.length}`, source);
  }

  const variable = new Int(emitter, null, null, args[0].source);
  const emitExpression = () => {
    emitter.emitExpression(variable, args[0]);
  };

  emitter.codeBuilder`
    ${emitExpression}${variable}[
      ${() => {
        emitter.emit(blocks[0].block);
      }}
    ${emitExpression}${variable}]
  `;

  variable.destroy();
};
