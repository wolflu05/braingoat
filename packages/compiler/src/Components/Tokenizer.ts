import { generateSplitRegex } from "../utils";

export type LineType = {
  line: number;
  col: number;
};

export type TokenType = {
  value: string;
  source: LineType;
};

export class Tokenizer {
  static tokenize(code: string[]) {
    const tokens: TokenType[] = [];
    const splitters = [" ", "(", ")", "{", "}", "[", "]", ",", "=", "/\\/"];

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
          source: { line: +lineNum, col: p },
        });

        // actual matched token
        tokens.push({
          value: line.substring(m.index, m.index + 1),
          source: { line: +lineNum, col: m.index },
        });
      }

      // last token in line
      tokens.push({
        value: line.substring(p),
        source: { line: +lineNum, col: p },
      });
    }

    return tokens.filter((token) => !["", " ", "\n"].includes(token.value));
  }
}
