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
  variableOptions: TokenType | null;
};

export type FUNCTION_CALL_OPTIONS = {
  functionName: string;
  parameters: AST[];
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
      value: AST[];
    };
export type VARIABLE_LITERAL_OPTIONS = {
  name: string;
  index: AST | null;
};

export type ASSIGNMENT_OPTIONS = {
  variableName: string;
  value: AST;
  index: AST | null;
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

      const operatorStr = tokens[exprIndex[1]].value as keyof typeof OPERATOR_MAP;
      const op = OPERATOR_MAP[operatorStr];
      const leftNode = this.parseExpression(tokens, braingoat, exprIndex[0]);
      const rightNode = this.parseExpression(tokens, braingoat, exprIndex[2]);

      if (!op) {
        braingoat.throwError(ErrorType.SyntaxError, `Invalid operator ${operatorStr}`, tokens[exprIndex[1]]);
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

    // INT Value literal
    if (!Number.isNaN(+token.value)) {
      return [new AST(TOKEN_TYPES.VALUE_LITERAL, { type: "INT", value: +token.value }, token.source), startIndex + 1];
    }

    // Array Value literal
    if (token.value === "[") {
      let k = startIndex + 1;
      const values: AST[] = [];
      while (k < tokens.length) {
        if (tokens[k]?.value === ",") {
          braingoat.throwError(ErrorType.SyntaxError, `Unexpected token , expected list item`, tokens[k]);
        }

        const nextIndex = findIndexAt(
          k + 1,
          tokens,
          (t) => (t as TokenType).value === "," || (t as TokenType).value === "]",
        );

        if (nextIndex === -1) {
          braingoat.throwError(ErrorType.SyntaxError, `Expected ]`, tokens[tokens.length - 1]);
        }

        const expression = this.parseExpression(tokens.slice(k, nextIndex), braingoat, 0);
        if (!expression) {
          braingoat.throwError(ErrorType.SyntaxError, `Invalid value`, tokens[k]);
        }
        values.push(expression[0]);

        k += expression[1] + 1;

        if (tokens[nextIndex].value === "]") {
          break;
        }
      }

      return [new AST(TOKEN_TYPES.VALUE_LITERAL, { type: "INTLIST", value: values }, token.source), k];
    }

    // Variable literal
    if (isValidVariableName(token.value)) {
      let idxExpression = null;
      let endIdx = startIndex + 1;

      // check for array item getting
      if (tokens[startIndex + 1]?.value === "[") {
        const idxExpr = this.parseExpression(tokens, braingoat, startIndex + 2);
        if (!idxExpr) {
          braingoat.throwError(ErrorType.SyntaxError, "Invalid expression at index", tokens[startIndex + 1]);
        }

        idxExpression = idxExpr[0];
        endIdx = idxExpr[1] + 1;
      }

      return [new AST(TOKEN_TYPES.VARIABLE_LITERAL, { name: token.value, index: idxExpression }, token.source), endIdx];
    }

    return null;
  }

  static parse(tokens: TokenType[], braingoat: Braingoat) {
    const tree: AST[] = [];

    for (let i = 0; i < tokens.length; ) {
      let nextIndex = i;

      // DECLARATION
      if (tokens[i + 2]?.value === "=" || tokens[i + 5]?.value === "=") {
        let hasOpt = tokens[i + 2].value !== "=";
        if (hasOpt) {
          if (tokens[i + 1]?.value !== "<") {
            braingoat.throwError(ErrorType.SyntaxError, `Expected < got ${tokens[i + 1]?.value}`, tokens[i + 1]);
          }
          if (tokens[i + 3]?.value !== ">") {
            braingoat.throwError(ErrorType.SyntaxError, `Expected > got ${tokens[i + 3]?.value}`, tokens[i + 3]);
          }
        }

        const expression = this.parseExpression(tokens, braingoat, hasOpt ? i + 6 : i + 3);
        if (!expression) {
          braingoat.throwError(ErrorType.SyntaxError, "Invalid expression", tokens[hasOpt ? i + 6 : i + 3]);
        }

        tree.push(
          new AST(
            TOKEN_TYPES.DECLARATION,
            {
              variableName: tokens[hasOpt ? i + 4 : i + 1].value,
              type: tokens[i].value,
              value: expression[0],
              variableOptions: hasOpt ? tokens[i + 2] : null,
            },
            tokens[i].source,
          ),
        );
        nextIndex = expression[1];
      }

      // ASSIGNMENT
      else if (tokens[i + 1]?.value === "=" || tokens[i + 1]?.value === "[") {
        let hasIdx = tokens[i + 1].value === "[";
        let idxExpression = null;
        let endIdx = i + 2;
        if (hasIdx) {
          const idxExpr = this.parseExpression(tokens, braingoat, i + 2);
          if (!idxExpr) {
            braingoat.throwError(ErrorType.SyntaxError, "Invalid expression at index", tokens[i + 1]);
          }

          idxExpression = idxExpr[0];
          endIdx = idxExpr[1] + 2;
        }

        const expression = this.parseExpression(tokens, braingoat, endIdx);
        if (!expression) {
          braingoat.throwError(ErrorType.SyntaxError, "Invalid expression", tokens[endIdx]);
        }

        tree.push(
          new AST(
            TOKEN_TYPES.ASSIGNMENT,
            {
              variableName: tokens[i].value,
              value: expression[0],
              index: idxExpression,
            },
            tokens[i].source,
          ),
        );
        nextIndex = expression[1];
      }

      // FUNCTION_CALL
      else if (tokens[i + 1]?.value === "(") {
        // arguments parsing
        let k = i + 2;
        const params: AST[] = [];

        while (k < tokens.length) {
          if (tokens[k]?.value === ",") {
            braingoat.throwError(ErrorType.SyntaxError, `Unexpected token , expected argument`, tokens[k]);
          }

          const stack = [];
          let nextIndex = k + 2;

          for (; nextIndex < tokens.length; nextIndex++) {
            if (tokens[nextIndex].value === "(") {
              stack.push("(");
            } else if (tokens[nextIndex].value === ")") {
              stack.pop();
            }

            if (stack.length === 0) break;

            if (tokens[nextIndex].value === ",") break;
          }

          if (nextIndex === -1) {
            braingoat.throwError(ErrorType.SyntaxError, `Expected )`, tokens[tokens.length - 1]);
          }

          const expression = this.parseExpression(tokens.slice(k, nextIndex + 1), braingoat, 0);
          if (!expression) {
            braingoat.throwError(ErrorType.SyntaxError, `Invalid argument`, tokens[k]);
          }
          params.push(expression[0]);

          k += expression[1] + 1;

          if (tokens[nextIndex].value === ")") {
            break;
          }
        }

        let endTokenIndex = k;

        // block function parsing
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
              parameters: params,
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
