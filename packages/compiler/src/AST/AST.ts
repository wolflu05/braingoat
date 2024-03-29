import { Braingoat, ErrorType } from "../Braingoat";
import { findIndexAt, findMatchingBracket, isValidVariableName } from "../utils";
import { LineType, TokenType } from "../Tokenizer";

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

export type blockType = { name: string; block: AST[] };
export type FUNCTION_CALL_OPTIONS = {
  functionName: string;
  parameters: AST[];
  blocks: blockType[];
};

export enum EXPRESSION_OPERATOR_TYPE {
  ADD = "ADD",
  SUBTRACT = "SUBTRACT",
  MULTIPLY = "MULTIPLY",
  DIVIDE = "DIVIDE",
  POWER = "POWER",
  EQ = "EQ",
  NEQ = "NEQ",
  LT = "LT",
  LTE = "LTE",
  GT = "GT",
  GTE = "GTE",
}
export const OPERATOR_MAP = {
  "+": EXPRESSION_OPERATOR_TYPE.ADD,
  "-": EXPRESSION_OPERATOR_TYPE.SUBTRACT,
  "*": EXPRESSION_OPERATOR_TYPE.MULTIPLY,
  "/": EXPRESSION_OPERATOR_TYPE.DIVIDE,
  "^": EXPRESSION_OPERATOR_TYPE.POWER,
  "==": EXPRESSION_OPERATOR_TYPE.EQ,
  "!=": EXPRESSION_OPERATOR_TYPE.NEQ,
  "<": EXPRESSION_OPERATOR_TYPE.LT,
  "<=": EXPRESSION_OPERATOR_TYPE.LTE,
  ">": EXPRESSION_OPERATOR_TYPE.GT,
  ">=": EXPRESSION_OPERATOR_TYPE.GTE,
};
export type EXPRESSION_OPTIONS = {
  op: EXPRESSION_OPERATOR_TYPE;
  leftNode: AST;
  rightNode: AST;
};

export type VALUE_LITERAL_OPTIONS =
  | {
    type: "NUMBER";
    value: number;
  }
  | {
    type: "LIST";
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

      for (; k < tokens.length;) {
        let nextIndex = k + 1;
        if (stack.length === 1) {
          let endingIdx = k;
          if (tokens[k + 1]?.value === "[") {
            endingIdx = findMatchingBracket(tokens, braingoat, { startIndex: k + 1, bracketMap: { "[": "]" } });
            nextIndex = endingIdx + 1;
          }
          exprIndex.push(k);
        }

        if (tokens[k].value === "(") {
          stack.push("(");
        } else if (tokens[k].value === ")") {
          stack.pop();
        }

        if (stack.length === 0) break;

        k = nextIndex;
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

    // NUMBER Value literal
    if (!Number.isNaN(+token.value)) {
      return [
        new AST(TOKEN_TYPES.VALUE_LITERAL, { type: "NUMBER", value: +token.value }, token.source),
        startIndex + 1,
      ];
    }

    // Array Value literal
    if (token.value === "[") {
      let k = startIndex + 1;
      const values: AST[] = [];
      while (k < tokens.length) {
        if (tokens[k]?.value === ",") {
          braingoat.throwError(ErrorType.SyntaxError, `Unexpected token , expected list item`, tokens[k]);
        }

        const nextIndex = findIndexAt(k + 1, tokens, (t) => t.value === "," || t.value === "]");

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

      return [new AST(TOKEN_TYPES.VALUE_LITERAL, { type: "LIST", value: values }, token.source), k];
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

    for (let i = 0; i < tokens.length;) {
      let nextIndex = i;

      // COMMENTS
      if (tokens[i].value === "/*") {
        const endingIndex = findIndexAt(i + 1, tokens, (t) => t.value === "*/");
        if (endingIndex === -1) {
          braingoat.throwError(ErrorType.SyntaxError, "Expected */", tokens[tokens.length - 1]);
        }
        nextIndex = endingIndex + 1;

        braingoat.log(
          tokens.map((x) => x.value),
          nextIndex,
        );
      }

      // DECLARATION
      else if (
        tokens[i + 2]?.value === "=" ||
        (tokens[i + 1]?.value === "<" && tokens[i + 3]?.value === ">" && tokens[i + 5]?.value === "=")
      ) {
        const hasOpt = tokens[i + 2].value !== "=";

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

        const endingBracket = findMatchingBracket(tokens, braingoat, { startIndex: i + 1, bracketMap: { "(": ")" } });

        while (k < endingBracket) {
          if (tokens[k]?.value === ",") {
            braingoat.throwError(ErrorType.SyntaxError, `Unexpected token , expected argument`, tokens[k]);
          }

          const nextArg = findMatchingBracket(tokens, braingoat, {
            startIndex: k,
            bracketMap: { "(": ")" },
            stop: (x) => x.value === ",",
            endIndex: endingBracket - 1,
          });

          const expression = this.parseExpression(tokens.slice(k, nextArg + 1), braingoat, 0);
          if (!expression) {
            braingoat.throwError(ErrorType.SyntaxError, `Invalid argument`, tokens[k]);
          }
          params.push(expression[0]);

          k = nextArg + 1;
        }

        nextIndex = k + 1;

        const blocks: blockType[] = [];
        let lastName = "default";
        while (tokens[nextIndex]?.value === "{") {
          const endingIndex = findMatchingBracket(tokens, braingoat, {
            startIndex: nextIndex,
            bracketMap: { "{": "}" },
          });

          blocks.push({
            name: lastName,
            block: AST.parse(tokens.slice(nextIndex + 1, endingIndex), braingoat),
          });

          if (tokens[endingIndex + 2]?.value === "{") {
            lastName = tokens[endingIndex + 1].value;
            nextIndex = endingIndex + 2;
          } else {
            nextIndex = endingIndex + 1;
          }
        }

        tree.push(
          new AST(
            TOKEN_TYPES.FUNCTION_CALL,
            {
              functionName: tokens[i].value,
              parameters: params,
              blocks: blocks,
            },
            tokens[i].source,
          ),
        );
      }

      // UNPROCESSED KEYWORD
      else {
        braingoat.throwError(ErrorType.SyntaxError, `Unprocessed keyword "${tokens[i].value}"`, tokens[i]);
      }

      if (i === nextIndex) {
        nextIndex++;
      }
      i = nextIndex;
    }

    return tree;
  }
}
