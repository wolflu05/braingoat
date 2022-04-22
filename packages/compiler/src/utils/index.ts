import { Braingoat, ErrorType } from "../Braingoat";
import { TokenType } from "../Tokenizer";

export const escapeRegexStr = (str: string) => str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

export const generateSplitRegex = (delimiters: string[]) =>
  new RegExp(`(${delimiters.map((x) => escapeRegexStr(x)).join("|")})`, "g");

export const splitByChars = (str: string, delimiters: string[]) => {
  const splitted = str.split(generateSplitRegex(delimiters));

  if (splitted[splitted.length - 1] === "") {
    return splitted.slice(0, -1);
  }

  return splitted;
};

export const findIndexAt = (idx: number, arr: any[], func: (item: any) => boolean) => {
  for (let i = idx; i < arr.length; i++) {
    if (func(arr[i])) {
      return i;
    }
  }

  return -1;
};

export const isValidVariableName = (name: string) => /^[a-zA-Z_]\w*$/.test(name);

export const findMatchingBracket = (
  tokens: TokenType[],
  braingoat: Braingoat,
  {
    startIndex = 0,
    endIndex = Infinity,
    bracketMap = { "(": ")", "{": "}", "[": "]", "<": ">" },
    stop = () => false,
  }: {
    startIndex?: number;
    endIndex?: number;
    bracketMap?: Record<string, string>;
    stop?: (token: TokenType) => boolean;
  } = {},
) => {
  const stack: string[] = [];
  let hasPushed = false;

  let i = startIndex;
  for (; i < tokens.length && i <= endIndex; i++) {
    if (Object.keys(bracketMap).includes(tokens[i].value)) {
      stack.push(tokens[i].value);
      hasPushed = true;
    } else if (Object.values(bracketMap).includes(tokens[i].value)) {
      const opening = stack.pop();
      if (!opening) {
        braingoat.throwError(ErrorType.SyntaxError, `Unexpected token ${tokens[i].value}`, tokens[i]);
      }

      const expectedClosing = bracketMap[opening];
      if (tokens[i].value !== expectedClosing) {
        braingoat.throwError(
          ErrorType.SyntaxError,
          `Unexpected bracket, got ${tokens[i].value} expected ${expectedClosing}`,
          tokens[i],
        );
      }
    }

    if (!hasPushed && stop(tokens[i])) return i;

    if (hasPushed && stack.length === 0) {
      return i;
    }
  }

  if (stack.length !== 0) {
    braingoat.throwError(
      ErrorType.SyntaxError,
      `Expected tokens ${stack.map((x) => bracketMap[x]).join("")}`,
      tokens[i],
    );
  }

  return i - 1;
};
