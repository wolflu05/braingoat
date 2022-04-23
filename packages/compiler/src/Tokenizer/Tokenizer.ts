import { generateSplitRegex } from "../utils";
import { OPERATOR_MAP } from "../AST";

export type LineType = {
  startLine: number;
  endLine: number;
  startCol: number;
  endCol: number;
};

export type TokenType = {
  value: string;
  source: LineType;
};

export class Tokenizer {
  static tokenize(code: string[]) {
    const tokens: TokenType[] = [];

    const splitters = [
      " ",
      "(",
      ")",
      "{",
      "}",
      "[",
      "]",
      ",",
      "<",
      ">",
      "=",
      "/*",
      "*/",
      "\n",
      "\r",
      "\n\r",
      ...Object.keys(OPERATOR_MAP),
    ].sort((a, b) => b.length - a.length);

    for (const [lineNum, line] of Object.entries(code)) {
      const re = generateSplitRegex(splitters);
      let m, p;
      while (((p = re.lastIndex), (m = re.exec(line)))) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === re.lastIndex) {
          re.lastIndex++;
        }

        // token between match
        tokens.push({
          value: line.substring(p, m.index),
          source: {
            startLine: +lineNum + 1,
            endLine: +lineNum + 1,
            startCol: p,
            endCol: m.index,
          },
        });

        // actual matched token
        tokens.push({
          value: m[0],
          source: {
            startLine: +lineNum + 1,
            endLine: +lineNum + 1,
            startCol: m.index,
            endCol: m.index + m[0].length,
          },
        });
      }

      // last token in line
      tokens.push({
        value: line.substring(p),
        source: {
          startLine: +lineNum + 1,
          endLine: +lineNum + 1,
          startCol: p,
          endCol: line.length,
        },
      });
    }

    return tokens.filter((token) => !["", " ", "\n", "\r", "\n\r"].includes(token.value));
  }
}
