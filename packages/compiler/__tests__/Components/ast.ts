import { Braingoat } from "../../src/Braingoat";
import { AST } from "../../src/AST";
import { TokenType } from "../../src/Tokenizer";

const astCases: Array<[string, TokenType[], string, boolean]> = [
  ["empty token list", [], "", true],
  [
    "tokenize two variables",
    [
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "i", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 5 } },
      { value: "=", source: { startLine: 0, startCol: 6, endLine: 0, endCol: 7 } },
      { value: "0", source: { startLine: 0, startCol: 8, endLine: 0, endCol: 9 } },
      { value: "int", source: { startLine: 1, startCol: 0, endLine: 1, endCol: 3 } },
      { value: "j", source: { startLine: 1, startCol: 4, endLine: 1, endCol: 5 } },
      { value: "=", source: { startLine: 1, startCol: 6, endLine: 1, endCol: 7 } },
      { value: "1", source: { startLine: 1, startCol: 8, endLine: 1, endCol: 9 } },
    ],
    "abc i = 0\nint j = 1",
    true,
  ],
  [
    "should parse functions",
    [
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "(", source: { startLine: 0, startCol: 3, endLine: 0, endCol: 4 } },
      { value: ")", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 5 } },
    ],
    "abc()",
    true,
  ],
  [
    "should parse functions with parameter",
    [
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "(", source: { startLine: 0, startCol: 3, endLine: 0, endCol: 4 } },
      { value: "1", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 5 } },
      { value: ")", source: { startLine: 0, startCol: 5, endLine: 0, endCol: 6 } },
    ],
    "abc(1)",
    true,
  ],
  [
    "should parse functions with parameters",
    [
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "(", source: { startLine: 0, startCol: 3, endLine: 0, endCol: 4 } },
      { value: "x1", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 6 } },
      { value: ",", source: { startLine: 0, startCol: 6, endLine: 0, endCol: 7 } },
      { value: "1", source: { startLine: 0, startCol: 7, endLine: 0, endCol: 8 } },
      { value: ",", source: { startLine: 0, startCol: 8, endLine: 0, endCol: 9 } },
      { value: "2", source: { startLine: 0, startCol: 9, endLine: 0, endCol: 10 } },
      { value: ",", source: { startLine: 0, startCol: 10, endLine: 0, endCol: 11 } },
      { value: "3", source: { startLine: 0, startCol: 11, endLine: 0, endCol: 12 } },
      { value: ")", source: { startLine: 0, startCol: 12, endLine: 0, endCol: 13 } },
    ],
    "abc(x1,1,2,3)",
    true,
  ],
  [
    "should parse functions with block",
    [
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "(", source: { startLine: 0, startCol: 3, endLine: 0, endCol: 4 } },
      { value: ")", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 5 } },
      { value: "{", source: { startLine: 0, startCol: 6, endLine: 0, endCol: 7 } },
      { value: "}", source: { startLine: 1, startCol: 0, endLine: 1, endCol: 1 } },
    ],
    "abc() {\n}",
    true,
  ],
  [
    "should parse functions with parameter and block",
    [
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "(", source: { startLine: 0, startCol: 3, endLine: 0, endCol: 4 } },
      { value: "1", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 5 } },
      { value: ")", source: { startLine: 0, startCol: 5, endLine: 0, endCol: 6 } },
      { value: "{", source: { startLine: 0, startCol: 7, endLine: 0, endCol: 8 } },
      { value: "}", source: { startLine: 2, startCol: 0, endLine: 2, endCol: 1 } },
    ],
    "abc(1) {\n\n}",
    true,
  ],
  [
    "should parse functions with parameters and block",
    [
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "(", source: { startLine: 0, startCol: 3, endLine: 0, endCol: 4 } },
      { value: "x1", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 5 } },
      { value: ",", source: { startLine: 0, startCol: 6, endLine: 0, endCol: 7 } },
      { value: "1", source: { startLine: 0, startCol: 7, endLine: 0, endCol: 8 } },
      { value: ",", source: { startLine: 0, startCol: 8, endLine: 0, endCol: 9 } },
      { value: "2", source: { startLine: 0, startCol: 9, endLine: 0, endCol: 10 } },
      { value: ",", source: { startLine: 0, startCol: 10, endLine: 0, endCol: 11 } },
      { value: "3", source: { startLine: 0, startCol: 11, endLine: 0, endCol: 12 } },
      { value: ")", source: { startLine: 0, startCol: 12, endLine: 0, endCol: 13 } },
      { value: "{", source: { startLine: 0, startCol: 14, endLine: 0, endCol: 15 } },
      { value: "abc", source: { startLine: 1, startCol: 2, endLine: 1, endCol: 4 } },
      { value: "(", source: { startLine: 1, startCol: 4, endLine: 1, endCol: 5 } },
      { value: ")", source: { startLine: 1, startCol: 5, endLine: 1, endCol: 6 } },
      { value: "{", source: { startLine: 1, startCol: 0, endLine: 1, endCol: 1 } },
      { value: "}", source: { startLine: 1, startCol: 6, endLine: 1, endCol: 7 } },
      { value: "}", source: { startLine: 2, startCol: 0, endLine: 2, endCol: 3 } },
    ],
    "abc(x1,1,2,3) {\n  abc(){}\n}",
    true,
  ],
  [
    "should parse functions with parameters and nested blocks",
    [
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "(", source: { startLine: 0, startCol: 3, endLine: 0, endCol: 4 } },
      { value: "x1", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 6 } },
      { value: ",", source: { startLine: 0, startCol: 6, endLine: 0, endCol: 7 } },
      { value: "1", source: { startLine: 0, startCol: 7, endLine: 0, endCol: 8 } },
      { value: ",", source: { startLine: 0, startCol: 8, endLine: 0, endCol: 9 } },
      { value: "2", source: { startLine: 0, startCol: 9, endLine: 0, endCol: 10 } },
      { value: ",", source: { startLine: 0, startCol: 10, endLine: 0, endCol: 11 } },
      { value: "3", source: { startLine: 0, startCol: 11, endLine: 0, endCol: 12 } },
      { value: ")", source: { startLine: 0, startCol: 12, endLine: 0, endCol: 13 } },
      { value: "{", source: { startLine: 0, startCol: 14, endLine: 0, endCol: 15 } },
      { value: "abc", source: { startLine: 1, startCol: 7, endLine: 1, endCol: 10 } },
      { value: "(", source: { startLine: 1, startCol: 10, endLine: 1, endCol: 11 } },
      { value: ")", source: { startLine: 1, startCol: 11, endLine: 1, endCol: 12 } },
      { value: "{", source: { startLine: 1, startCol: 13, endLine: 1, endCol: 14 } },
      { value: "def", source: { startLine: 2, startCol: 9, endLine: 2, endCol: 12 } },
      { value: "(", source: { startLine: 2, startCol: 12, endLine: 2, endCol: 13 } },
      { value: "1", source: { startLine: 2, startCol: 13, endLine: 2, endCol: 14 } },
      { value: ",", source: { startLine: 2, startCol: 14, endLine: 2, endCol: 15 } },
      { value: "2", source: { startLine: 2, startCol: 15, endLine: 2, endCol: 16 } },
      { value: ")", source: { startLine: 2, startCol: 16, endLine: 2, endCol: 17 } },
      { value: "{", source: { startLine: 2, startCol: 18, endLine: 2, endCol: 19 } },
      { value: "abc", source: { startLine: 3, startCol: 11, endLine: 3, endCol: 14 } },
      { value: "(", source: { startLine: 3, startCol: 14, endLine: 3, endCol: 15 } },
      { value: ")", source: { startLine: 3, startCol: 15, endLine: 3, endCol: 16 } },
      { value: "}", source: { startLine: 4, startCol: 9, endLine: 4, endCol: 10 } },
      { value: "}", source: { startLine: 5, startCol: 7, endLine: 5, endCol: 8 } },
      { value: "}", source: { startLine: 6, startCol: 5, endLine: 6, endCol: 6 } },
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
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "(", source: { startLine: 0, startCol: 3, endLine: 0, endCol: 4 } },
      { value: "x1", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 6 } },
      { value: ",", source: { startLine: 0, startCol: 6, endLine: 0, endCol: 7 } },
      { value: "1", source: { startLine: 0, startCol: 7, endLine: 0, endCol: 8 } },
      { value: ",", source: { startLine: 0, startCol: 8, endLine: 0, endCol: 9 } },
      { value: "2", source: { startLine: 0, startCol: 9, endLine: 0, endCol: 10 } },
      { value: ",", source: { startLine: 0, startCol: 10, endLine: 0, endCol: 11 } },
      { value: "3", source: { startLine: 0, startCol: 11, endLine: 0, endCol: 12 } },
    ],
    "abc(x1,1,2,3",
    false,
  ],
  [
    "Function call without ending block }",
    [
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "(", source: { startLine: 0, startCol: 3, endLine: 0, endCol: 4 } },
      { value: "1", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 5 } },
      { value: ",", source: { startLine: 0, startCol: 5, endLine: 0, endCol: 6 } },
      { value: "2", source: { startLine: 0, startCol: 6, endLine: 0, endCol: 7 } },
      { value: ",", source: { startLine: 0, startCol: 7, endLine: 0, endCol: 8 } },
      { value: "3", source: { startLine: 0, startCol: 8, endLine: 0, endCol: 9 } },
      { value: ")", source: { startLine: 0, startCol: 9, endLine: 0, endCol: 11 } },
      { value: "{", source: { startLine: 0, startCol: 11, endLine: 0, endCol: 12 } },
    ],
    "abc(1,2,3) {",
    false,
  ],
  [
    "Function call with more {",
    [
      { value: "abc", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 3 } },
      { value: "(", source: { startLine: 0, startCol: 3, endLine: 0, endCol: 4 } },
      { value: "1", source: { startLine: 0, startCol: 4, endLine: 0, endCol: 5 } },
      { value: ",", source: { startLine: 0, startCol: 5, endLine: 0, endCol: 6 } },
      { value: "2", source: { startLine: 0, startCol: 6, endLine: 0, endCol: 7 } },
      { value: ",", source: { startLine: 0, startCol: 7, endLine: 0, endCol: 8 } },
      { value: "3", source: { startLine: 0, startCol: 8, endLine: 0, endCol: 9 } },
      { value: ")", source: { startLine: 0, startCol: 9, endLine: 0, endCol: 11 } },
      { value: "{", source: { startLine: 0, startCol: 11, endLine: 0, endCol: 12 } },
      { value: "{", source: { startLine: 0, startCol: 12, endLine: 0, endCol: 13 } },
      { value: "}", source: { startLine: 0, startCol: 13, endLine: 0, endCol: 14 } },
    ],
    "abc(1,2,3) {{}",
    false,
  ],
  ["Unprocessed keyword", [{ value: "{", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 1 } }], "{", false],
  [
    "Unprocessed word keyword",
    [{ value: "hello", source: { startLine: 0, startCol: 0, endLine: 0, endCol: 5 } }],
    "hello",
    false,
  ],
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
