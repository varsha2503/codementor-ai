import Editor, { type OnMount } from "@monaco-editor/react";

const onMount: OnMount = (editor, monaco) => {
  monaco.editor.defineTheme("codementor", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#121710",
      "editor.lineHighlightBackground": "#1b241a",
      "editorLineNumber.foreground": "#6d7c6e",
    },
  });
  monaco.editor.setTheme("codementor");
  editor.focus();
};

export function CodeEditor({
  value,
  onChange,
  language = "cpp",
}: {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}) {
  return (
    <Editor
      language={language}
      theme="vs-dark"
      value={value}
      onChange={(next) => onChange(next ?? "")}
      onMount={onMount}
      options={{
        fontSize: 14,
        fontFamily: "IBM Plex Mono, ui-monospace, monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 12 },
      }}
    />
  );
}
