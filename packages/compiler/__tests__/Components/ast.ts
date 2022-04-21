import { Braingoat } from "../../src/Braingoat";
import { AST } from "../../src/Components/AST";
import { TokenType } from "../../src/Components/Tokenizer";

const astCases: Array<[string, TokenType[], string, boolean]> = [
  ["empty token list", [], "", true],
  [
    "tokenize two variables",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "i", source: { line: 0, col: 4 } },
      { value: "=", source: { line: 0, col: 6 } },
      { value: "0", source: { line: 0, col: 8 } },
      { value: "int", source: { line: 1, col: 0 } },
      { value: "j", source: { line: 1, col: 4 } },
      { value: "=", source: { line: 1, col: 6 } },
      { value: "1", source: { line: 1, col: 8 } },
    ],
    "abc i = 0\nint j = 1",
    true,
  ],
  [
    "should parse functions",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "(", source: { line: 0, col: 3 } },
      { value: ")", source: { line: 0, col: 4 } },
    ],
    "abc()",
    true,
  ],
  [
    "should parse functions with parameter",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "(", source: { line: 0, col: 3 } },
      { value: "1", source: { line: 0, col: 4 } },
      { value: ")", source: { line: 0, col: 5 } },
    ],
    "abc(1)",
    true,
  ],
  [
    "should parse functions with parameters",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "(", source: { line: 0, col: 3 } },
      { value: "x1", source: { line: 0, col: 4 } },
      { value: ",", source: { line: 0, col: 6 } },
      { value: "1", source: { line: 0, col: 7 } },
      { value: ",", source: { line: 0, col: 8 } },
      { value: "2", source: { line: 0, col: 9 } },
      { value: ",", source: { line: 0, col: 10 } },
      { value: "3", source: { line: 0, col: 11 } },
      { value: ")", source: { line: 0, col: 12 } },
    ],
    "abc(x1,1,2,3)",
    true,
  ],
  [
    "should parse functions with block",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "(", source: { line: 0, col: 3 } },
      { value: ")", source: { line: 0, col: 4 } },
      { value: "{", source: { line: 0, col: 6 } },
      { value: "}", source: { line: 1, col: 0 } },
    ],
    "abc() {\n}",
    true,
  ],
  [
    "should parse functions with parameter and block",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "(", source: { line: 0, col: 3 } },
      { value: "1", source: { line: 0, col: 4 } },
      { value: ")", source: { line: 0, col: 5 } },
      { value: "{", source: { line: 0, col: 7 } },
      { value: "}", source: { line: 2, col: 0 } },
    ],
    "abc(1) {\n\n}",
    true,
  ],
  [
    "should parse functions with parameters and block",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "(", source: { line: 0, col: 3 } },
      { value: "x1", source: { line: 0, col: 4 } },
      { value: ",", source: { line: 0, col: 6 } },
      { value: "1", source: { line: 0, col: 7 } },
      { value: ",", source: { line: 0, col: 8 } },
      { value: "2", source: { line: 0, col: 9 } },
      { value: ",", source: { line: 0, col: 10 } },
      { value: "3", source: { line: 0, col: 11 } },
      { value: ")", source: { line: 0, col: 12 } },
      { value: "{", source: { line: 0, col: 14 } },
      { value: "abc", source: { line: 1, col: 2 } },
      { value: "(", source: { line: 1, col: 4 } },
      { value: ")", source: { line: 1, col: 5 } },
      { value: "{", source: { line: 1, col: 0 } },
      { value: "}", source: { line: 1, col: 6 } },
      { value: "}", source: { line: 2, col: 0 } },
    ],
    "abc(x1,1,2,3) {\n  abc(){}\n}",
    true,
  ],
  [
    "should parse functions with parameters and nested blocks",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "(", source: { line: 0, col: 3 } },
      { value: "x1", source: { line: 0, col: 4 } },
      { value: ",", source: { line: 0, col: 6 } },
      { value: "1", source: { line: 0, col: 7 } },
      { value: ",", source: { line: 0, col: 8 } },
      { value: "2", source: { line: 0, col: 9 } },
      { value: ",", source: { line: 0, col: 10 } },
      { value: "3", source: { line: 0, col: 11 } },
      { value: ")", source: { line: 0, col: 12 } },
      { value: "{", source: { line: 0, col: 14 } },
      { value: "abc", source: { line: 1, col: 7 } },
      { value: "(", source: { line: 1, col: 10 } },
      { value: ")", source: { line: 1, col: 11 } },
      { value: "{", source: { line: 1, col: 13 } },
      { value: "def", source: { line: 2, col: 9 } },
      { value: "(", source: { line: 2, col: 12 } },
      { value: "1", source: { line: 2, col: 13 } },
      { value: ",", source: { line: 2, col: 14 } },
      { value: "2", source: { line: 2, col: 15 } },
      { value: ")", source: { line: 2, col: 16 } },
      { value: "{", source: { line: 2, col: 18 } },
      { value: "abc", source: { line: 3, col: 11 } },
      { value: "(", source: { line: 3, col: 14 } },
      { value: ")", source: { line: 3, col: 15 } },
      { value: "}", source: { line: 4, col: 9 } },
      { value: "}", source: { line: 5, col: 7 } },
      { value: "}", source: { line: 6, col: 5 } },
    ],
    `abc(x1,1,2,3) {
      abc() {
        def(1,2) {
          abc()
        }
      }
    }`,
    true,
  ],
  [
    "Function call without ending )",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "(", source: { line: 0, col: 3 } },
      { value: "x1", source: { line: 0, col: 4 } },
      { value: ",", source: { line: 0, col: 6 } },
      { value: "1", source: { line: 0, col: 7 } },
      { value: ",", source: { line: 0, col: 8 } },
      { value: "2", source: { line: 0, col: 9 } },
      { value: ",", source: { line: 0, col: 10 } },
      { value: "3", source: { line: 0, col: 11 } },
    ],
    "abc(x1,1,2,3",
    false,
  ],
  [
    "Function call without ending block }",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "(", source: { line: 0, col: 3 } },
      { value: "1", source: { line: 0, col: 4 } },
      { value: ",", source: { line: 0, col: 5 } },
      { value: "2", source: { line: 0, col: 6 } },
      { value: ",", source: { line: 0, col: 7 } },
      { value: "3", source: { line: 0, col: 8 } },
      { value: ")", source: { line: 0, col: 9 } },
      { value: "{", source: { line: 0, col: 11 } },
    ],
    "abc(1,2,3) {",
    false,
  ],
  [
    "Function call with more {",
    [
      { value: "abc", source: { line: 0, col: 0 } },
      { value: "(", source: { line: 0, col: 3 } },
      { value: "1", source: { line: 0, col: 4 } },
      { value: ",", source: { line: 0, col: 5 } },
      { value: "2", source: { line: 0, col: 6 } },
      { value: ",", source: { line: 0, col: 7 } },
      { value: "3", source: { line: 0, col: 8 } },
      { value: ")", source: { line: 0, col: 9 } },
      { value: "{", source: { line: 0, col: 11 } },
      { value: "{", source: { line: 0, col: 12 } },
      { value: "}", source: { line: 0, col: 13 } },
    ],
    "abc(1,2,3) {{}",
    false,
  ],
  ["Unprocessed keyword", [{ value: "{", source: { line: 0, col: 0 } }], "{", false],
  ["Unprocessed word keyword", [{ value: "hello", source: { line: 0, col: 0 } }], "hello", false],
];

describe("tokenize", () => {
  for (const [name, tokens, code, shouldBeValid] of astCases) {
    test(name, () => {
      const braingoat = new Braingoat(code);

      if (shouldBeValid) {
        const ast = AST.parse(tokens, braingoat);
        expect(ast).toMatchSnapshot();
      } else {
        const testReachFn = jest.fn();

        try {
          AST.parse(tokens, braingoat);
          testReachFn();
        } catch (error) {
          expect((error as Error).stack).toMatchSnapshot();
        }
        expect(testReachFn).not.toHaveBeenCalled();
      }
    });
  }
});
