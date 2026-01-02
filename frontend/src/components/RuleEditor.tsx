import Editor, { type Monaco } from "@monaco-editor/react";
import { DSL_LANGUAGE_ID, languageDef, themeDef } from "../utils/dslLanguage";

export const RuleEditor = ({
  code,
  onSave,
}: {
  code: string;
  onSave: (val: string) => void;
}) => {
  const handleEditorWillMount = (monaco: Monaco) => {
    if (
      !monaco.languages
        .getLanguages()
        .some((lang) => lang.id === DSL_LANGUAGE_ID)
    ) {
      monaco.languages.register({ id: DSL_LANGUAGE_ID });
      monaco.languages.setMonarchTokensProvider(
        DSL_LANGUAGE_ID,
        languageDef as any
      );

      monaco.editor.defineTheme("life-surface-theme", themeDef);
    }
  };

  return (
    <div
      style={{
        height: "400px",
        border: "1px solid #333",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Editor
        height="100%"
        language={DSL_LANGUAGE_ID}
        theme="life-surface-theme"
        value={code}
        beforeMount={handleEditorWillMount}
        options={{
          fontSize: 15,
          fontFamily: "'Fira Code', monospace",
          minimap: { enabled: false },
          lineNumbers: "on",
          padding: { top: 20 },
          automaticLayout: true, 
        }}
        onChange={(value) => onSave(value || "")}
      />
    </div>
  );
};
