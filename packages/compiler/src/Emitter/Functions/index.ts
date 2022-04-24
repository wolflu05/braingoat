import { ifFunc } from "./if";
import { print } from "./print";
import { printN } from "./printN";
import { whileFunc } from "./while";

export const Functions = {
  print,
  printN,
  while: whileFunc,
  if: ifFunc,
};
