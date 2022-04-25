import * as programs from "@braingoat/integration/src/programs";
import { RefObject, useEffect, useState } from "react";
import { EditorHandle } from "../Editor/Editor";

interface ExampleSelectorProps {
  editor: RefObject<EditorHandle>;
}

export const ExampleSelector = ({ editor }: ExampleSelectorProps) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (value in programs) {
      const program = programs[value as keyof typeof programs];
      if (!program) return;

      editor.current?.setValue(program.braingoat);
    }
  }, [editor, value]);

  return (
    <div>
      Example program:
      <select name="programs" value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="">Nothing selected</option>
        {Object.entries(programs).map(([name, program]) => (
          <option key={name} value={name}>
            {program.name}
          </option>
        ))}
      </select>
    </div>
  );
};
