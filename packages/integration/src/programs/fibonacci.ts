import { IExample } from "../types";

export const fibonacci: IExample = {
  name: "Fibonacci",
  braingoat: `Int n = 0
inputN(n)

Int fib = 0
Int last = 1
Int tmp = 0

Int i = 0
while((i < n)) {
  tmp = fib
  fib = (fib + last)
  last = tmp
  i = (i + 1)
}

printN(fib)
`,
  testCases: [
    { name: "Fibonacci of 0", input: "0", output: "0" },
    { name: "Fibonacci of 1", input: "1", output: "1" },
    { name: "Fibonacci of 2", input: "2", output: "1" },
    { name: "Fibonacci of 5", input: "5", output: "5" },
    { name: "Fibonacci of 6", input: "6", output: "8" },
    { name: "Fibonacci of 10", input: "10", output: "55" },
    { name: "Fibonacci of 12", input: "12", output: "144" },
    { name: "Fibonacci of 13", input: "13", output: "233" },
  ],
};
