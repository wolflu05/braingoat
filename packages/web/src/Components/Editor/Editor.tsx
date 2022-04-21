import { editor, MarkerSeverity } from "monaco-editor";
import MonacoEditor, { BeforeMount, Monaco, OnChange, OnMount } from "@monaco-editor/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { BRAINGOAT_FORMAT, BRAINGOAT_THEME, TESTING_CODE } from "./language";

interface EditorProps {
  onChange: OnChange;
}

const Editor = forwardRef(({ onChange }: EditorProps, ref) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<Monaco>();

  const handleEditorWillMount: BeforeMount = useCallback((monaco) => {
    monaco.languages.register({ id: "braingoat" });
    monaco.languages.setMonarchTokensProvider("braingoat", BRAINGOAT_FORMAT);
    monaco.editor.defineTheme("braingoat-dark", BRAINGOAT_THEME);
  }, []);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);

  useImperativeHandle(ref, () => ({
    setError(error: any) {
      console.log(error);
      if (!monacoRef.current || !editorRef.current) return;
      const editor = editorRef.current.getModel();
      if (!editor) return;

      if (!error.source) return;

      monacoRef.current.editor.setModelMarkers(editor, "Test", [
        {
          startLineNumber: error.source.line + 1,
          startColumn: error.source.col + 1,
          endLineNumber: error.source.line + 1,
          endColumn: error.source.col + 6,
          message: error.message,
          severity: MarkerSeverity.Error,
        },
      ]);
    },
  }));

  return (
    <div>
      <MonacoEditor
        height="60vh"
        defaultLanguage="braingoat"
        theme="braingoat-dark"
        defaultValue={TESTING_CODE}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorMount}
        onChange={onChange}
      />
    </div>
  );
});

export default Editor;
