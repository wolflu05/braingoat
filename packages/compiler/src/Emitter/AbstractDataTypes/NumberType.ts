import { BasicDataType } from "./BasicDataType";

export abstract class NumberType extends BasicDataType {
  set(variable: NumberType | number) {
    this.throwNotImplemented("set");
  }

  // math
  add(variable: NumberType) {
    this.throwNotImplemented("add");
  }

  subtract(variable: NumberType) {
    this.throwNotImplemented("subtract");
  }

  multiply(variable: NumberType) {
    this.throwNotImplemented("multiply");
  }

  divide(variable: NumberType) {
    this.throwNotImplemented("divide");
  }

  power(variable: NumberType) {
    this.throwNotImplemented("power");
  }

  // compare operations
  eq(variable: NumberType) {
    this.throwNotImplemented("eq");
  }

  neq(variable: NumberType) {
    this.throwNotImplemented("neq");
  }

  lt(variable: NumberType) {
    this.throwNotImplemented("lt");
  }

  lte(variable: NumberType) {
    this.throwNotImplemented("lte");
  }

  gt(variable: NumberType) {
    this.throwNotImplemented("gt");
  }

  gte(variable: NumberType) {
    this.throwNotImplemented("gte");
  }
}
