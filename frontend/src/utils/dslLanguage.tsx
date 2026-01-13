export const DSL_LANGUAGE_ID = "life-surface-dsl";

export const languageDef = {
  keywords: ["when", "set", "if", "and", "or"],
  operators: [">=", "<=", "==", ">", "<", "="],

  tokenizer: {
    root: [
      // 1. Hex Colors
      [/'#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})'/, "string.color"],
      [/"#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})"/, "string.color"],
      [/#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/, "string.color"],

      // 2. Keywords & Identifiers
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],

      // 3. Time patterns 
      [/\d{2}:\d{2}/, "number.time"],

      // 4. UI Properties 
      [/ui\.[a-zA-Z-]+/, "type.property"],

      // 5. Operators
      [/[>=|<=|==|>|<|=]/, "operator"],

      // 6. Brackets
      [/[{}()\[\]]/, "@brackets"],
    ],
  },
};

export const themeDef = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "keyword", foreground: "C586C0", fontStyle: "bold" }, 
    { token: "type.property", foreground: "9CDCFE" },
    { token: "string.color", foreground: "CE9178" }, 
    { token: "number.time", foreground: "B5CEA8" }, 
    { token: "operator", foreground: "D4D4D4" },
  ],
  colors: {
    "editor.background": "#121212",
  },
};
