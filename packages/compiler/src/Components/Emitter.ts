import { Braingoat, ErrorType } from "../Braingoat";
import { DataTypes } from "../DataTypes";
import { Int } from "../DataTypes/Int";
import { Functions } from "../Functions";
import { BasicDataType, memoryPositionType } from "../Types/BasicDataType";
import { isValidVariableName } from "../utils";
import { COMMANDS, VALID_CHARS } from "../utils/commands";
import {
  ASSIGNMENT_OPTIONS,
  AST,
  DECLARATION_OPTIONS,
  EXPRESSION_OPERATOR_TYPE,
  EXPRESSION_OPTIONS,
  FUNCTION_CALL_OPTIONS,
  TOKEN_TYPES,
  VALUE_LITERAL_OPTIONS,
  VARIABLE_LITERAL_OPTIONS,
} from "./AST";
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

  emitExpression(variable: BasicDataType, expression: AST) {
    // VALUE_LITERAL
    if (expression.type === TOKEN_TYPES.VALUE_LITERAL) {
      const tokenOptions = expression.tokenOptions as VALUE_LITERAL_OPTIONS;

      // INT
      if (variable instanceof DataTypes.Int && tokenOptions.type === "INT") {
        variable.set(tokenOptions.value);
      }

      // INTLIST
      else if (variable instanceof DataTypes.IntList && tokenOptions.type === "INTLIST") {
        // variable.set()
      }

      // No valid combination
      else {
        this.braingoat.throwError(
          ErrorType.CompileError,
          `${tokenOptions.type} cannot assigned to ${typeof variable}`,
          expression.source,
        );
      }
    }

    // VARIABLE_LITERAL
    else if (expression.type === TOKEN_TYPES.VARIABLE_LITERAL) {
      const tokenOptions = expression.tokenOptions as VARIABLE_LITERAL_OPTIONS;
      const variableLiteral = this.getVariable(tokenOptions.name, expression.source);

      // INT
      if (variable instanceof DataTypes.Int && variableLiteral instanceof DataTypes.Int) {
        variable.set(variableLiteral);
      }

      // INTLIST
      else if (variable instanceof DataTypes.IntList && variableLiteral instanceof DataTypes.IntList) {
        // variable.set()
      }

      // No valid combination
      else {
        this.braingoat.throwError(
          ErrorType.CompileError,
          `${typeof variableLiteral} cannot assigned to ${typeof variable}`,
          expression.source,
        );
      }
    }

    // EXPRESSION
    else if (expression.type === TOKEN_TYPES.EXPRESSION) {
      const tokenOptions = expression.tokenOptions as EXPRESSION_OPTIONS;

      if (variable instanceof DataTypes.Int) {
        const leftVar = new Int(this, null, expression.source);
        const rightVar = new Int(this, null, expression.source);
        this.emitExpression(leftVar, tokenOptions.leftNode);
        this.emitExpression(rightVar, tokenOptions.rightNode);

        if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.ADD) {
          leftVar.add(rightVar);
        } else if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.SUBTRACT) {
          leftVar.subtract(rightVar);
        } else if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.MULTIPLY) {
          leftVar.multiply(rightVar);
        } else if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.DIVIDE) {
          leftVar.divide(rightVar);
        } else if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.POWER) {
          leftVar.power(rightVar);
        } else if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.EQ) {
          leftVar.eq(rightVar);
        } else if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.NEQ) {
          leftVar.neq(rightVar);
        }

        variable.set(leftVar);
        leftVar.destroy();
        rightVar.destroy();
      }

      // No valid combination
      else {
        this.braingoat.throwError(
          ErrorType.CompileError,
          `cannot assign expression result to ${typeof variable}`,
          expression.source,
        );
      }
    }
  }

  emit() {
    for (const node of this.ast) {
      // VARIABLE DECLARATION
      if (node.type === TOKEN_TYPES.DECLARATION) {
        const { type, variableName, value } = node.tokenOptions as DECLARATION_OPTIONS;
        if (!isValidVariableName(variableName)) {
          this.braingoat.throwError(ErrorType.CompileError, `${variableName} is no valid variable name`, node.source);
        }

        const variable = this.registerVariable(type, variableName, node.source);
        this.emitExpression(variable, value);
      }

      // VARIABLE ASSIGNMENT
      if (node.type === TOKEN_TYPES.ASSIGNMENT) {
        const { variableName, value } = node.tokenOptions as ASSIGNMENT_OPTIONS;
        const variable = this.getVariable(variableName, node.source);
        this.emitExpression(variable, value);
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

  registerVariable(type: string, name: string, source: LineType) {
    if (!(type in DataTypes)) {
      this.braingoat.throwError(ErrorType.CompileError, `${type} is no valid data type`, source);
    }

    const variable = new DataTypes[type as keyof typeof DataTypes](this, name, source, false);
    this.memoryAllocation.push(variable);
    return variable;
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
