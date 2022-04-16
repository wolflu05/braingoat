import { Braingoat, ErrorType } from "../Braingoat";
import { DataTypes } from "../DataTypes";
import { Int } from "../DataTypes/Int";
import { Functions } from "../Functions";
import { BasicDataType, memoryPositionType } from "../Types/BasicDataType";
import { COMMANDS, VALID_CHARS } from "../utils/commands";
import { AST, DECLARATION_OPTIONS, FUNCTION_CALL_OPTIONS, TOKEN_TYPES } from "./AST";
import { LineType, TokenType } from "./Tokenizer";

export class Emitter {
  memoryAllocation: BasicDataType[];
  currentMemoryAddress: number;
  code: string;
  ast: AST[];
  braingoat: Braingoat;

  constructor(ast: AST[], braingoat: Braingoat) {
    this.memoryAllocation = [];
    this.currentMemoryAddress = 0;
    this.code = "";
    this.ast = ast;
    this.braingoat = braingoat;
  }

  emit() {
    for (const node of this.ast) {
      // VARIABLE DECLARATION
      if (node.type === TOKEN_TYPES.DECLARATION) {
        const { type, variableName, value } = node.tokenOptions as DECLARATION_OPTIONS;
        this.registerVariable(type, variableName, value, node.source);
      }

      // FUNCTION CALL
      else if (node.type === TOKEN_TYPES.FUNCTION_CALL) {
        const { functionName, parameters, block } = node.tokenOptions as FUNCTION_CALL_OPTIONS;
        this.callFunction(functionName, parameters, block, node.source);
      }
    }

    return this;
  }

  movePointerTo(address: number, addToCode = true) {
    let res = "";

    while (this.currentMemoryAddress !== address) {
      if (this.currentMemoryAddress < address) {
        res += COMMANDS.MOVE_POINTER_RIGHT;
        this.currentMemoryAddress++;
      } else {
        res += COMMANDS.MOVE_POINTER_LEFT;
        this.currentMemoryAddress--;
      }
    }

    if (addToCode) this.addCode(res);

    return res;
  }

  getNextNEmpty(length: number): memoryPositionType {
    let pos = this.memoryAllocation
      .sort((a, b) => a.position[0] - b.position[0])
      .findIndex((_, i, l) => {
        if (!l[i + 1]) return true;
        return l[i + 1].position[0] - l[i].position[1] - 1 >= length;
      });

    if (pos === -1) {
      pos = 0;
    } else {
      pos = this.memoryAllocation[pos].position[1] + 1;
    }

    return [pos, pos + length - 1];
  }

  registerVariable(type: string, name: string, value: string, source: LineType) {
    if (!(type in DataTypes)) {
      this.braingoat.throwError(ErrorType.CompileError, `${type} is no valid data type`, source);
    }

    this.memoryAllocation.push(new DataTypes[type as keyof typeof DataTypes](this, name, value, source));
  }

  getVariable(name: string | BasicDataType, source: LineType): BasicDataType | never {
    if (name instanceof BasicDataType) {
      return name;
    }

    const variable = this.memoryAllocation.find((x) => x.name === name);

    if (variable === undefined) {
      this.braingoat.throwError(ErrorType.CompileError, `Variable ${name} is not defined`, source);
    }

    return variable;
  }

  callFunction(name: string, args: TokenType[], block: AST[], source: LineType) {
    if (!(name in Functions)) {
      this.braingoat.throwError(ErrorType.CompileError, `${name} is no valid function`, source);
    }

    Functions[name as keyof typeof Functions](this, args, block, source);
  }

  codeBuilder(code: TemplateStringsArray, ...variables: ReadonlyArray<string | number | Int | Function>) {
    code.forEach((c, i) => {
      this.addCode(c);

      if (variables[i]) {
        if (typeof variables[i] === "string") {
          this.addCode(variables[i] as string);
        } else if (typeof variables[i] === "number") {
          this.addCode(this.movePointerTo(variables[i] as number, false));
        } else if (variables[i] instanceof Int) {
          this.addCode(this.movePointerTo((variables[i] as Int).position[0], false));
        } else if (typeof variables[i] === "function") {
          this.addCode((variables[i] as Function)());
        }
      }
    });
  }

  addCode(...code: string[]) {
    this.code += code
      .join("")
      .split("")
      .filter((x) => VALID_CHARS.includes(x))
      .join("");
  }
}
