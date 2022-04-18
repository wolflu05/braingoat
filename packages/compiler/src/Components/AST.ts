import { Braingoat, ErrorType } from "../Braingoat";
import { findIndexAt, isValidVariableName } from "../utils";
import { LineType, TokenType } from "./Tokenizer";

export enum TOKEN_TYPES {
  DECLARATION = "DECLARATION",
  FUNCTION_CALL = "FUNCTION_CALL",
  EXPRESSION = "EXPRESSION",
  VALUE_LITERAL = "VALUE_LITERAL",
  ASSIGNMENT = "ASSIGNMENT",
  VARIABLE_LITERAL = "VARIABLE_LITERAL",
}

export type DECLARATION_OPTIONS = {
  variableName: string;
  type: string;
  value: AST;
};

export type FUNCTION_CALL_OPTIONS = {
  functionName: string;
  parameters: TokenType[];
  block: AST[];
};

export enum EXPRESSION_OPERATOR_TYPE {
  ADD = "ADD",
  SUBTRACT = "SUBTRACT",
  MULTIPLY = "MULTIPLY",
  DIVIDE = "DIVIDE",
  POWER = "POWER",
  EQ = "EQ",
  NEQ = "NEQ",
}
export const OPERATOR_MAP = {
  "+": EXPRESSION_OPERATOR_TYPE.ADD,
  "-": EXPRESSION_OPERATOR_TYPE.SUBTRACT,
  "*": EXPRESSION_OPERATOR_TYPE.MULTIPLY,
  "/": EXPRESSION_OPERATOR_TYPE.DIVIDE,
  "^": EXPRESSION_OPERATOR_TYPE.POWER,
  "==": EXPRESSION_OPERATOR_TYPE.EQ,
  "!=": EXPRESSION_OPERATOR_TYPE.NEQ,
};
export type EXPRESSION_OPTIONS = {
  op: EXPRESSION_OPERATOR_TYPE;
  leftNode: AST;
  rightNode: AST;
};

export type VALUE_LITERAL_OPTIONS =
  | {
      type: "INT";
      value: number;
    }
  | {
      type: "INTLIST";
      value: number[];
    };
export type VARIABLE_LITERAL_OPTIONS = {
  name: string;
};

export type ASSIGNMENT_OPTIONS = {
  variableName: string;
  value: AST;
};

export type TOKEN_OPTIONS =
  | DECLARATION_OPTIONS
  | FUNCTION_CALL_OPTIONS
  | EXPRESSION_OPTIONS
  | VALUE_LITERAL_OPTIONS
  | VARIABLE_LITERAL_OPTIONS
  | ASSIGNMENT_OPTIONS;

export class AST {
  type: TOKEN_TYPES;
  tokenOptions: TOKEN_OPTIONS;
  source: LineType;

  constructor(type: TOKEN_TYPES, tokenOptions: TOKEN_OPTIONS, source: LineType) {
    this.type = type;
    this.tokenOptions = tokenOptions;
    this.source = source;
  }

  static parseExpression(tokens: TokenType[], braingoat: Braingoat, startIndex = 0): [AST, number] | null {
    const token = tokens[startIndex];
    if (!token) {
      return null;
    }

    if (token.value === "(") {
      const exprIndex = [];
      const stack = [];
      let k = startIndex;

      for (; k < tokens.length; k++) {
        if (stack.length === 1) {
          exprIndex.push(k);
        }

        if (tokens[k].value === "(") {
          stack.push("(");
        } else if (tokens[k].value === ")") {
          stack.pop();
        }

        if (stack.length === 0) break;
      }

      if (stack.length !== 0) {
        braingoat.throwError(ErrorType.SyntaxError, "Expected )", tokens[k - 1]);
      }

      if (exprIndex.length !== 4) {
        braingoat.throwError(
          ErrorType.SyntaxError,
          "Invalid length expression, expressions can only have two operants wrapped in brackets",
          tokens[k - 1],
        );
      }

      const op = OPERATOR_MAP[tokens[exprIndex[1]].value as keyof typeof OPERATOR_MAP];
      const leftNode = this.parseExpression(tokens, braingoat, exprIndex[0]);
      const rightNode = this.parseExpression(tokens, braingoat, exprIndex[2]);

      if (!op) {
        braingoat.throwError(
          ErrorType.SyntaxError,
          `Invalid operator ${tokens[exprIndex[1]].value}`,
          tokens[exprIndex[1]],
        );
      }
      if (!leftNode) {
        braingoat.throwError(ErrorType.SyntaxError, "Expected left-side operant", tokens[exprIndex[1] - 1]);
      }
      if (!rightNode) {
        braingoat.throwError(ErrorType.SyntaxError, "Expected right-side operant", tokens[exprIndex[1]]);
      }

      return [
        new AST(
          TOKEN_TYPES.EXPRESSION,
          {
            op,
            leftNode: leftNode?.[0] || null,
            rightNode: rightNode?.[0] || null,
          },
          tokens[exprIndex[1]].source,
        ),
        k + 1,
      ];
    }

    if (!Number.isNaN(+token.value)) {
      return [new AST(TOKEN_TYPES.VALUE_LITERAL, { type: "INT", value: +token.value }, token.source), startIndex + 1];
    }

    if (isValidVariableName(token.value)) {
      return [new AST(TOKEN_TYPES.VARIABLE_LITERAL, { name: token.value }, token.source), startIndex + 1];
    }

    return null;
  }

  static parse(tokens: TokenType[], braingoat: Braingoat) {
    const tree: AST[] = [];

    for (let i = 0; i < tokens.length; ) {
      let nextIndex = i;

      // DECLARATION
      if (tokens[i + 2]?.value === "=") {
        const expression = this.parseExpression(tokens, braingoat, i + 3);
        if (!expression) {
          braingoat.throwError(ErrorType.SyntaxError, "Invalid expression", tokens[i + 3]);
        }

        tree.push(
          new AST(
            TOKEN_TYPES.DECLARATION,
            {
              variableName: tokens[i + 1].value,
              type: tokens[i].value,
              value: expression[0],
            },
            tokens[i].source,
          ),
        );
        nextIndex = expression[1];
      }

      // ASSIGNMENT
      else if (tokens[i + 1]?.value === "=") {
        const expression = this.parseExpression(tokens, braingoat, i + 2);
        if (!expression) {
          braingoat.throwError(ErrorType.SyntaxError, "Invalid expression", tokens[i + 2]);
        }

        tree.push(
          new AST(
            TOKEN_TYPES.ASSIGNMENT,
            {
              variableName: tokens[i].value,
              value: expression[0],
            },
            tokens[i].source,
          ),
        );
        nextIndex = expression[1];
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
