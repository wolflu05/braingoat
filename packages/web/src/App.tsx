import { OnChange } from "@monaco-editor/react";
import { useCallback, useRef, useState } from "react";
import Editor, { EditorHandle } from "./Components/Editor/Editor";
import Layout from "./Components/Layout/Layout";
import { Braingoat } from "@braingoat/compiler";

function App() {
  const [code, setCode] = useState("");
  const [compiledCode, setCompiledCode] = useState("");
  const editor = useRef<EditorHandle>(null);

  const handleChange = useCallback<OnChange>((value) => {
    if (!value) return;

    setCode(value);
  }, []);

  const handleCompile = useCallback(() => {
    const braingoat = new Braingoat(code);
    console.log(braingoat);
    try {
      braingoat.compile();
      setCompiledCode(braingoat.bfCode);
      editor.current?.clearError();
    } catch (error: any) {
      editor.current?.setError(error);
      setCompiledCode(error?.stack || error);
    }
  }, [code]);

  return (
    <Layout>
      <Editor onChange={handleChange} ref={editor} />
      <button onClick={handleCompile}>Compile</button>
      <textarea value={compiledCode} rows={15} cols={150}></textarea>
    </Layout>
  );
}

export default App;
