import { Braingoat, ErrorType } from "../Braingoat";
import { findIndexAt } from "../utils";
import { LineType, TokenType } from "./Tokenizer";

export enum TOKEN_TYPES {
  DECLARATION = "DECLARATION",
  FUNCTION_CALL = "FUNCTION_CALL",
}

export type DECLARATION_OPTIONS = {
  variableName: string;
  type: string;
  value: string;
};

export type FUNCTION_CALL_OPTIONS = {
  functionName: string;
  parameters: TokenType[];
  block: AST[];
};

export type TOKEN_OPTIONS = DECLARATION_OPTIONS | FUNCTION_CALL_OPTIONS;

export class AST {
  type: TOKEN_TYPES;
  tokenOptions: TOKEN_OPTIONS;
  source: LineType;

  constructor(type: TOKEN_TYPES, tokenOptions: TOKEN_OPTIONS, source: LineType) {
    this.type = type;
    this.tokenOptions = tokenOptions;
    this.source = source;
  }

  static parse(tokens: TokenType[], braingoat: Braingoat) {
    const tree: AST[] = [];

    for (let i = 0; i < tokens.length; ) {
      let nextIndex = i;

      // DECLARATION
      if (tokens[i + 2]?.value === "=") {
        tree.push(
          new AST(
            TOKEN_TYPES.DECLARATION,
            {
              type: tokens[i].value,
              variableName: tokens[i + 1].value,
              value: tokens[i + 3].value,
            },
            tokens[i].source,
          ),
        );
        nextIndex += 4;
      }

      // FUNCTION_CALL
      else if (tokens[i + 1]?.value === "(") {
        const endTokenIndex = findIndexAt(i + 1, tokens, (t) => t.value === ")");
        if (endTokenIndex === -1) {
          braingoat.throwError(ErrorType.SyntaxError, "Expected )", tokens[i + 1]);
        }

        const params = tokens.slice(i + 2, endTokenIndex);
        const wrongIdx = params.findIndex((v, i) => ((i + 1) % 2 === 0 ? v.value !== "," : false));

        if (wrongIdx !== -1) {
          braingoat.throwError(ErrorType.SyntaxError, `Expected ,`, params[wrongIdx]);
        }

        // check for block function
        let block: TokenType[] = [];
        if (tokens[endTokenIndex + 1]?.value === "{" && tokens.length > endTokenIndex + 2) {
          const stack = [];
          let k = endTokenIndex + 1;

          for (; k < tokens.length; k++) {
            if (tokens[k].value === "{") {
              stack.push("{");
            } else if (tokens[k].value === "}") {
              stack.pop();
            }

            if (stack.length === 0) break;
            block.push(tokens[k]);
          }
          if (stack.length !== 0) {
            braingoat.throwError(ErrorType.SyntaxError, "Expected }", tokens[k - 1]);
          }

          nextIndex = k + 1;
        } else {
          nextIndex = endTokenIndex + 1;
        }

        tree.push(
          new AST(
            TOKEN_TYPES.FUNCTION_CALL,
            {
              functionName: tokens[i].value,
              parameters: params.filter((x) => x.value !== ","),
              block: AST.parse(block.slice(1), braingoat),
            },
            tokens[i].source,
          ),
        );
      }

      // UNPROCESSED KEYWORD
      else {
        braingoat.throwError(ErrorType.SyntaxError, "Unprocessed keyword", tokens[i]);
      }

      if (i === nextIndex) {
        nextIndex++;
      }
      i = nextIndex;
    }

    return tree;
  }
}
