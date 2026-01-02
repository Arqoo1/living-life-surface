
export const DSL_LANGUAGE_ID = "life-surface-dsl";

export const languageDef = {
  keywords: ["when", "set", "if", "and", "or"],
  operators: [">=", "<=", "==", ">", "<", "="],

  tokenizer: {
    root: [
      // Keywords
      [
        /[a-z_$][\w$]*/,
        {
          cases: {
            "@keywords": "keyword",
            "@default": "identifier",
          },
        },
      ],

      // Time patterns (22:00)
      [/\d{2}:\d{2}/, "number.time"],

      // Hex Colors (#06040b)
      [/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/, "string.color"],

      // UI Properties (ui.bg)
      [/ui\.[a-zA-Z-]+/, "type.property"],

      // Operators
      [/[>=|<=|==|>|<|=]/, "operator"],

      // Brackets
      [/[{}()\[\]]/, "@brackets"],
    ],
  },
};

export const themeDef = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [
    { token: "keyword", foreground: "C586C0", fontStyle: "bold" }, // Purple
    { token: "type.property", foreground: "9CDCFE" }, // Light Blue
    { token: "string.color", foreground: "CE9178" }, // Orange/Peach
    { token: "number.time", foreground: "B5CEA8" }, // Green
    { token: "operator", foreground: "D4D4D4" },
  ],
  colors: {
    "editor.background": "#121212",
  },
};
