import { ErrorType } from "../../Braingoat";
import { AST, blockType } from "../../AST";
import { Emitter } from "..";
import { LineType } from "../../Tokenizer";
import { Int } from "../DataTypes/Int";

export const ifFunc = (emitter: Emitter, args: AST[], blocks: blockType[], source: LineType) => {
  if (blocks.length < 1 || blocks.length > 2) {
    emitter.braingoat.throwError(ErrorType.CompileError, `if expected 1 or 2 blocks, got ${blocks.length}`, source);
  }

  if (blocks.length === 2 && blocks[1].name !== "else") {
    emitter.braingoat.throwError(
      ErrorType.CompileError,
      `if expected second block named else, got ${blocks[1].name}`,
      source,
    );
  }

  if (args.length !== 1) {
    emitter.braingoat.throwError(ErrorType.CompileError, `if expected 1 argument, got ${args.length}`, source);
  }

  // only if
  if (blocks.length === 1) {
    const variable = new Int(emitter, null, null, args[0].source);
    const emitExpression = () => {
      emitter.emitExpression(variable, args[0]);
    };

    emitter.codeBuilder`
      ${emitExpression}${variable}[
        ${() => {
          emitter.emit(blocks[0].block);
        }}

        ${variable}[-]
      ]
    `;

    variable.destroy();
  }

  // if/else
  else {
    emitter.withIntArray(3, args[0].source, ([x, tmp0]) => {
      emitter.emitExpression(x, args[0]);

      emitter.codeBuilder`
        ${tmp0}+
        ${x}[
          ${() => {
            emitter.emit(blocks[0].block);
          }}

          ${x}>-]>
        [<
          ${() => {
            emitter.emit(blocks[1].block);
          }}

          ${x}>->]<<
      `;
    });
  }
};
