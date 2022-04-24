import { OPERATOR_MAP } from "@braingoat/compiler/src/AST";
import { DataTypes } from "@braingoat/compiler/src/Emitter/DataTypes";
import { Functions } from "@braingoat/compiler/src/Emitter/Functions";
import { languages, editor } from "monaco-editor";

export const BRAINGOAT_FORMAT: languages.IMonarchLanguage = {
  defaultToken: "invalid",
  tokenPostfix: ".js",

  keywords: ["if", "else", "while", "for"],
  functions: Object.keys(Functions),
  typeKeywords: Object.keys(DataTypes),
  operators: Object.keys(OPERATOR_MAP),

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
      { include: "@comment" },
      { include: "@whitespace" },

      // delimiters and operators
      [
        /@symbols/,
        {
          cases: {
            "@operators": "operators",
            "@default": "",
          },
        },
      ],
      [/[[\]]/, "brackets.index"],
      [/<.*>/, "brackets.variableOptions"],
      [/[()]/, "brackets.expression"],
      [/[{}]/, "brackets.block"],

      // numbers
      [/\d+/, "number"],
    ],

    // https://stackoverflow.com/questions/66278203/how-to-set-multiline-rule-in-monaco-editor
    comment: [[/\/\*/, { token: "comment", next: "@commentClosing" }]],
    commentClosing: [
      [/[^*/]+/, { token: "comment" }],
      [/\*\//, { token: "comment", next: "@pop" }],
    ],

    whitespace: [[/[ \t\r\n]+/, ""]],
  },
};

export const BRAINGOAT_LANGUAGE_CONFIGURATION: languages.LanguageConfiguration = {
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "<", close: ">" },
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
  ],
};

export const BRAINGOAT_THEME: editor.IStandaloneThemeData = {
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
    { token: "comment", foreground: "#7A88CF" },
  ],
  colors: {
    "editor.foreground": "#eeeeee",
    "editor.background": "#222436",
  },
};

export const BRAINGOAT_COMPLETION: languages.CompletionItemProvider = {
  provideCompletionItems(model, position) {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    return {
      suggestions: [
        {
          label: "comment",
          kind: languages.CompletionItemKind.Keyword,
          // eslint-disable-next-line no-template-curly-in-string
          insertText: "/* ${1:comment} */",
          insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: "Int",
          kind: languages.CompletionItemKind.Keyword,
          // eslint-disable-next-line no-template-curly-in-string
          insertText: "Int ${1:name} = ${2:value}",
          insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: "IntList",
          kind: languages.CompletionItemKind.Keyword,
          // eslint-disable-next-line no-template-curly-in-string
          insertText: "IntList<${1:len}> ${2:name} = [${3:values}]",
          insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: "print",
          kind: languages.CompletionItemKind.Keyword,
          // eslint-disable-next-line no-template-curly-in-string
          insertText: "print(${1:expression})",
          insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: "while",
          kind: languages.CompletionItemKind.Keyword,
          // eslint-disable-next-line no-template-curly-in-string
          insertText: "while(${1:expression}) {\n  ${2:code}\n}\n",
          insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: "if",
          kind: languages.CompletionItemKind.Keyword,
          // eslint-disable-next-line no-template-curly-in-string
          insertText: "if(${1:expression}) {\n  ${2:code}\n}\n",
          insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
        {
          label: "ifelse",
          kind: languages.CompletionItemKind.Keyword,
          // eslint-disable-next-line no-template-curly-in-string
          insertText: "if(${1:expression}) {\n  ${2:code}\n} else {\n  ${3:code}\n}\n",
          insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        },
      ],
    };
  },
};

export const BRAINGOAT_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  tabSize: 2,
};

export const TESTING_CODE = `
Int a = 234
Int b = 324

/* This is a very cool list */
IntList<3> l = [1,(a + (b * 1)),3]

Int c = (a *b)
c = ((a *b) ^ (3 + a))
c = (a == b)
c = (b != a)

print(c)
`;
