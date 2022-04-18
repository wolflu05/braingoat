import { Emitter } from "../Components/Emitter";
import { LineType } from "../Components/Tokenizer";
import { BasicDataType } from "../Types/BasicDataType";

export class IntList extends BasicDataType {
  constructor(emitter: Emitter, name: string | null, source: LineType, addToMemory = false) {
    super(emitter, name, source);

    this.position = this.emitter.getNextNEmpty(1);

    if (addToMemory) this.emitter.memoryAllocation.push(this);
  }

  reset() {
    this.emitter.codeBuilder`$}[-]`;
  }

  destroy() {
    this.reset();
    const idx = this.emitter.memoryAllocation.findIndex((v) => v === this);

    if (idx !== -1) {
      this.emitter.memoryAllocation.splice(idx, 1);
    }
  }
}
