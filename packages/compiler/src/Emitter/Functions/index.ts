import { ifFunc } from "./if";
import { print } from "./print";
import { printN } from "./printN";
import { input } from "./input";
import { inputN } from "./inputN";
import { whileFunc } from "./while";
import { forFunc } from "./for";

export const Functions = {
  print,
  printN,
  input,
  inputN,
  while: whileFunc,
  for: forFunc,
  if: ifFunc,
};
