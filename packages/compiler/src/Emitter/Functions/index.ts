import { ifFunc } from "./if";
import { print } from "./print";
import { printN } from "./printN";
import { input } from "./input";
import { inputN } from "./inputN";
import { whileFunc } from "./while";

export const Functions = {
  print,
  printN,
  input,
  inputN,
  while: whileFunc,
  if: ifFunc,
};
