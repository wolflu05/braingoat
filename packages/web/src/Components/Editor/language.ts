import monaco from "monaco-editor";

export const BRAINGOAT_FORMAT: monaco.languages.IMonarchLanguage = {
  defaultToken: "invalid",
  tokenPostfix: ".js",

  keywords: ["if", "else"],
  functions: ["print", "input"],
  typeKeywords: ["Int", "IntList"],
  operators: ["+", "-", "*", "/", "^", "==", "!="],

  symbols: /[=><!~?:&|+\-*/^%]+/,

  tokenizer: {
    root: [{ include: "common" }],

    common: [
      // identifiers and keywords
      [
        /[a-zA-Z_$][\w$]*/,
        {
          cases: {
            "@typeKeywords": "typeKeyword",
            "@keywords": "keyword",
            "@functions": "functions",
            "@default": "identifier",
          },
        },
      ],

      // whitespace
      { include: "@whitespace" },

      // delimiters and operators
      [/[[\]]/, "brackets.index"],
      [/[<>]/, "brackets.variableOptions"],
      [/[()]/, "brackets.expression"],
      [/[{}]/, "brackets.block"],
      [
        /@symbols/,
        {
          cases: {
            "@operators": "operators",
            "@default": "",
          },
        },
      ],

      // numbers
      [/\d+/, "number"],
    ],

    whitespace: [
      [/[ \t\r\n]+/, ""],
      // [/\/\*\*(?!\/)/, "comment.doc", "@jsdoc"],
      // [/\/\*/, "comment", "@comment"],
      // [/\/\/.*$/, "comment"],
    ],

    // comment: [
    //   [/[^/*]+/, "comment"],
    //   [/\*\//, "comment", "@pop"],
    //   [/[/*]/, "comment"],
    // ],
  },
};

export const BRAINGOAT_THEME: monaco.editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: false,
  rules: [
    { token: "number", foreground: "#FF966C" },
    { token: "keyword", foreground: "#FC7B7B" },
    { token: "typeKeyword", foreground: "#86E1FC" },
    { token: "functions", foreground: "#C099FF" },
    { token: "operators", foreground: "#82AAFF" },
    { token: "brackets.index", foreground: "#A9B8E8" },
    { token: "brackets.variableOptions", foreground: "#FF966C" },
    { token: "brackets.expression", foreground: "#C3E88D" },
    { token: "brackets.block", foreground: "#FFC777" },
  ],
  colors: {
    "editor.foreground": "#eeeeee",
    "editor.background": "#222436",
  },
};

export const TESTING_CODE = `
Int a = 234
Int b = 324

IntList<3> l = [1,(a + (b * 1)),3]

Int c = (a *b)
c = ((a *b) ^ (3 + a))
c = (a == b)
c = (b != a)

print(c)

if(a) {
  input(d, (a != (b +1)))
} else {
  print(a, (a * b))
}
`;
