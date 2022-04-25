import { OnChange } from "@monaco-editor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { EditorHandle } from "./Components/Editor/Editor";
import Layout from "./Components/Layout/Layout";
import { Braingoat } from "@braingoat/compiler";
import useDebounce from "./hooks/useDebounce";
import { TESTING_CODE } from "./Components/Editor/language";
import { ExampleSelector } from "./Components/ExampleSelector/ExampleSelector";

function App() {
  const [loaded, setLoaded] = useState(false);
  const [editorValue, setEditorValue] = useState("");
  const [compiledCode, setCompiledCode] = useState("");
  const [message, setMessage] = useState("");
  const editor = useRef<EditorHandle>(null);
  const debouncedEditorValue = useDebounce(editorValue, 1000);

  useEffect(() => {
    // url hash param
    if (window.location.hash) {
      const encoded = window.location.href.split("#")[1];
      const code = Buffer.from(decodeURIComponent(encoded), "base64").toString("utf-8");
      setEditorValue(code);
    }

    // local storage
    else {
      const code = localStorage.getItem("code");

      if (code) {
        setEditorValue(Buffer.from(code, "base64").toString("utf-8"));
      } else {
        setEditorValue(TESTING_CODE);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (debouncedEditorValue) {
      localStorage.setItem("code", Buffer.from(debouncedEditorValue, "utf-8").toString("base64"));
    }
  }, [debouncedEditorValue]);

  const handleChange = useCallback<OnChange>((value) => {
    if (!value) return;

    setEditorValue(value);
  }, []);

  const handleCompile = useCallback(() => {
    const braingoat = new Braingoat(editorValue);
    console.log(braingoat);
    try {
      braingoat.compile();
      setCompiledCode(braingoat.bfCode);
      editor.current?.clearError();
    } catch (error: any) {
      editor.current?.setError(error);
      setCompiledCode(error?.stack || error);
    }
  }, [editorValue]);

  const handleShare = useCallback(() => {
    const baseUrl = window.location.href.split("#")[0];
    const encoded = encodeURIComponent(Buffer.from(editorValue, "utf-8").toString("base64"));

    navigator.clipboard.writeText(`${baseUrl}#${encoded}`);
    setMessage("Copied to clipboard");
    setTimeout(() => setMessage(""), 1500);
  }, [editorValue]);

  if (!loaded) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <ExampleSelector editor={editor} />
      <Editor onChange={handleChange} ref={editor} defaultValue={editorValue} />
      <div>
        <button onClick={handleCompile}>Compile</button>
        <button onClick={handleShare}>Share</button>
        <span>{message}</span>
      </div>
      <textarea defaultValue={compiledCode} rows={15} cols={150}></textarea>
    </Layout>
  );
}

export default App;
