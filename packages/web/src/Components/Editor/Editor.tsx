import { editor, MarkerSeverity } from "monaco-editor";
import MonacoEditor, { BeforeMount, Monaco, OnChange, OnMount } from "@monaco-editor/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import {
  BRAINGOAT_COMPLETION,
  BRAINGOAT_FORMAT,
  BRAINGOAT_LANGUAGE_CONFIGURATION,
  BRAINGOAT_THEME,
  TESTING_CODE,
} from "./language";

interface EditorProps {
  onChange: OnChange;
}

const Editor = forwardRef(({ onChange }: EditorProps, ref) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<Monaco>();
  const modelRef = useRef<editor.ITextModel | null>();

  const handleEditorWillMount: BeforeMount = useCallback((monaco) => {
    monaco.languages.register({ id: "braingoat" });
    monaco.languages.setMonarchTokensProvider("braingoat", BRAINGOAT_FORMAT);
    monaco.languages.setLanguageConfiguration("braingoat", BRAINGOAT_LANGUAGE_CONFIGURATION);
    monaco.languages.registerCompletionItemProvider("braingoat", BRAINGOAT_COMPLETION);
    monaco.editor.defineTheme("braingoat-dark", BRAINGOAT_THEME);
  }, []);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    modelRef.current = editor.getModel();
  }, []);

  useImperativeHandle(ref, () => ({
    setError(error: any) {
      console.log(error);
      if (!monacoRef.current || !editorRef.current || !modelRef.current) return;
      if (!error.source) return;

      monacoRef.current.editor.setModelMarkers(modelRef.current, "braingoat", [
        {
          startLineNumber: error.source.startLine,
          startColumn: error.source.startCol + 1,
          endLineNumber: error.source.endLine,
          endColumn: error.source + 1,
          message: error.message,
          severity: MarkerSeverity.Error,
        },
      ]);
    },
    clearError() {
      if (!monacoRef.current || !modelRef.current) return;
      monacoRef.current.editor.setModelMarkers(modelRef.current, "braingoat", []);
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
