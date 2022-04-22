import { ErrorType } from "../../Braingoat";
import { LineType, TokenType } from "../../Tokenizer";
import { Int } from "../DataTypes/Int";
import { Emitter } from "../Emitter";
import { BasicDataType, memoryPositionType } from "./BasicDataType";

export type listIndexType = Int | number;

export abstract class ListType extends BasicDataType {
  length: number | any;
  array: BasicDataType[];

  constructor(
    emitter: Emitter,
    name: string | null,
    variableOptions: TokenType | null,
    source: LineType,
    addToMemory = true,
    position?: memoryPositionType,
  ) {
    super(emitter, name, variableOptions, source, addToMemory, position);

    if (!this.variableOptions) {
      this.emitter.braingoat.throwError(
        ErrorType.CompileError,
        `IntList expected length as variable options`,
        this.source,
      );
    }

    if (Number.isNaN(+this.variableOptions.value)) {
      this.emitter.braingoat.throwError(
        ErrorType.CompileError,
        `${this.variableOptions.value} is no valid length`,
        this.variableOptions.source,
      );
    }

    this.length = +this.variableOptions.value;
    this.array = [];
  }

  getItem(idxVariable: listIndexType): BasicDataType {
    this.throwNotImplemented("getItem");
  }

  setItem(idxVariable: listIndexType, value: BasicDataType | any) {
    this.throwNotImplemented("getItem");
  }
}
