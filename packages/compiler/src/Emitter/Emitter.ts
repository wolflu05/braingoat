import { Braingoat, ErrorType } from "../Braingoat";
import { DataTypes } from "./DataTypes";
import { Functions } from "./Functions";
import { BasicDataType, memoryPositionType } from "./AbstractDataTypes/BasicDataType";
import { createDataType, isValidVariableName } from "../utils";
import { COMMANDS, VALID_CHARS } from "../utils/commands";
import {
  ASSIGNMENT_OPTIONS,
  AST,
  blockType,
  DECLARATION_OPTIONS,
  EXPRESSION_OPERATOR_TYPE,
  EXPRESSION_OPTIONS,
  FUNCTION_CALL_OPTIONS,
  TOKEN_TYPES,
  VALUE_LITERAL_OPTIONS,
  VARIABLE_LITERAL_OPTIONS,
} from "../AST";
import { LineType, TokenType } from "../Tokenizer";
import { NumberType } from "./AbstractDataTypes/NumberType";
import { listIndexType, ListType } from "./AbstractDataTypes/ListType";
import { Int } from "./DataTypes/Int";

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

      // Number
      if (variable instanceof NumberType && tokenOptions.type === "NUMBER") {
        variable.set(tokenOptions.value);
      }

      // List
      else if (variable instanceof ListType && tokenOptions.type === "LIST") {
        if (variable.length !== tokenOptions.value.length) {
          this.braingoat.throwError(
            ErrorType.CompileError,
            `${variable.name} has a length of ${variable.length} which could not be assigned to an list with length of ${tokenOptions.value.length}`,
            expression.source,
          );
        }

        const valueVar = new DataTypes.Int(this, null, null, expression.source);
        for (const [idx, value] of Object.entries(tokenOptions.value)) {
          this.emitExpression(valueVar, value);
          variable.setItem(+idx, valueVar);
        }
        valueVar.destroy();
      }

      // No valid combination
      else {
        this.braingoat.throwError(
          ErrorType.CompileError,
          `${tokenOptions.type} cannot be assigned to ${variable.constructor.name}`,
          expression.source,
        );
      }
    }

    // VARIABLE_LITERAL
    else if (expression.type === TOKEN_TYPES.VARIABLE_LITERAL) {
      const tokenOptions = expression.tokenOptions as VARIABLE_LITERAL_OPTIONS;
      const variableLiteral = this.getVariable(tokenOptions.name, expression.source);

      // Number
      if (
        variable instanceof NumberType &&
        variableLiteral instanceof NumberType &&
        variableLiteral.constructor === variable.constructor
      ) {
        variable.set(variableLiteral);
      }

      // List
      else if (
        variable instanceof ListType &&
        variableLiteral instanceof ListType &&
        variableLiteral.constructor === variable.constructor
      ) {
        variable.set(variableLiteral);
      }

      // Get LIST by Index
      else if (variable instanceof DataTypes.Int && tokenOptions.index) {
        let idxVar: listIndexType;
        if (
          tokenOptions.index.type === TOKEN_TYPES.VALUE_LITERAL &&
          !Number.isNaN(+(tokenOptions.index.tokenOptions as VALUE_LITERAL_OPTIONS).value)
        ) {
          idxVar = +(tokenOptions.index.tokenOptions as VALUE_LITERAL_OPTIONS).value;
        } else {
          idxVar = new DataTypes.Int(this, null, null, tokenOptions.index.source);
          this.emitExpression(idxVar, tokenOptions.index);
        }

        const variableByIdx = this.getVariable(tokenOptions.name, expression.source, idxVar);
        if (!(variableByIdx instanceof DataTypes.Int)) {
          this.braingoat.throwError(
            ErrorType.CompileError,
            `${variableByIdx.constructor.name} is no Int and cannot be used as index`,
            expression.source,
          );
        }
        variable.set(variableByIdx);
        variableByIdx.destroy();
        if (idxVar instanceof DataTypes.Int) idxVar.destroy();
      }

      // No valid combination
      else {
        this.braingoat.throwError(
          ErrorType.CompileError,
          `${variableLiteral.constructor.name} cannot be assigned to ${variable.constructor.name}`,
          expression.source,
        );
      }
    }

    // EXPRESSION
    else if (expression.type === TOKEN_TYPES.EXPRESSION) {
      const tokenOptions = expression.tokenOptions as EXPRESSION_OPTIONS;

      if (variable instanceof NumberType) {
        const leftVar = createDataType(variable, this, null, null, expression.source);
        const rightVar = createDataType(variable, this, null, null, expression.source);
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
        } else if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.LT) {
          leftVar.lt(rightVar);
        } else if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.LTE) {
          leftVar.lte(rightVar);
        } else if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.GT) {
          leftVar.gt(rightVar);
        } else if (tokenOptions.op === EXPRESSION_OPERATOR_TYPE.GTE) {
          leftVar.gte(rightVar);
        }

        variable.set(leftVar);
        leftVar.destroy();
        rightVar.destroy();
      }

      // No valid combination
      else {
        this.braingoat.throwError(
          ErrorType.CompileError,
          `cannot assign expression result to ${variable.toRef()}`,
          expression.source,
        );
      }
    }
  }

  emit(ast?: AST[]) {
    for (const node of ast || this.ast) {
      // VARIABLE DECLARATION
      if (node.type === TOKEN_TYPES.DECLARATION) {
        const { type, variableName, value, variableOptions } = node.tokenOptions as DECLARATION_OPTIONS;
        if (!isValidVariableName(variableName)) {
          this.braingoat.throwError(ErrorType.CompileError, `${variableName} is no valid variable name`, node.source);
        }

        const variable = this.registerVariable(type, variableName, variableOptions, node.source);
        this.emitExpression(variable, value);
      }

      // VARIABLE ASSIGNMENT
      if (node.type === TOKEN_TYPES.ASSIGNMENT) {
        const { variableName, value, index } = node.tokenOptions as ASSIGNMENT_OPTIONS;
        const variable = this.getVariable(variableName, node.source);

        if (index && variable instanceof ListType) {
          let idxVar: listIndexType;
          if (
            index.type === TOKEN_TYPES.VALUE_LITERAL &&
            !Number.isNaN(+(index.tokenOptions as VALUE_LITERAL_OPTIONS).value)
          ) {
            idxVar = +(index.tokenOptions as VALUE_LITERAL_OPTIONS).value;
          } else {
            idxVar = new DataTypes.Int(this, null, null, index.source);
            this.emitExpression(idxVar, index);
          }

          const valueVar = new DataTypes.Int(this, null, null, node.source);
          this.emitExpression(valueVar, value);
          variable.setItem(idxVar, valueVar);

          if (idxVar instanceof DataTypes.Int) idxVar.destroy();
          valueVar.destroy();
        } else {
          this.emitExpression(variable, value);
        }
      }

      // FUNCTION CALL
      else if (node.type === TOKEN_TYPES.FUNCTION_CALL) {
        const { functionName, parameters, blocks } = node.tokenOptions as FUNCTION_CALL_OPTIONS;
        this.callFunction(functionName, parameters, blocks, node.source);
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

  registerVariable(type: string, name: string, variableOptions: TokenType | null, source: LineType) {
    if (!(type in DataTypes)) {
      this.braingoat.throwError(ErrorType.CompileError, `${type} is no valid data type`, source);
    }

    const variable = new DataTypes[type as keyof typeof DataTypes](this, name, variableOptions, source, false);
    this.memoryAllocation.push(variable);
    return variable;
  }

  getVariable(name: string | BasicDataType, source: LineType, index?: listIndexType): BasicDataType | never {
    if (name instanceof BasicDataType) {
      return name;
    }

    const variable = this.memoryAllocation.find((x) => x.name === name);

    if (variable === undefined) {
      this.braingoat.throwError(ErrorType.CompileError, `Variable ${name} is not defined`, source);
    }

    if (index !== undefined && variable instanceof ListType) {
      return variable.getItem(index);
    }

    return variable;
  }

  callFunction(name: string, args: AST[], block: blockType[], source: LineType) {
    if (!(name in Functions)) {
      this.braingoat.throwError(ErrorType.CompileError, `${name} is no valid function`, source);
    }

    Functions[name as keyof typeof Functions](this, args, block, source);
  }

  // util functions
  codeBuilder(code: TemplateStringsArray, ...variables: ReadonlyArray<string | number | BasicDataType | Function>) {
    code.forEach((c, i) => {
      this.addCode(c);

      if (variables[i]) {
        const variable = variables[i];

        if (typeof variable === "string") {
          this.addCode(variable);
        } else if (typeof variable === "number") {
          this.addCode(this.movePointerTo(variable, false));
        } else if (variable instanceof BasicDataType) {
          this.addCode(this.movePointerTo(variable.getPosition(), false));
        } else if (typeof variable === "function") {
          this.addCode(variable());
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

  withIntArray(length: number, source: LineType, func: (variables: Array<Int>) => void) {
    const pos = this.getNextNEmpty(length);
    const variables = Array.from({ length: length }).map(
      (_, i) => new Int(this, null, null, source, true, [pos[0] + i, pos[0] + i]),
    );

    func(variables);

    variables.map((v) => v.destroy());
  }
}
