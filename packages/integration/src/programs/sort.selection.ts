import { IExample } from "../types";

export const selectionSort: IExample = {
  name: "Selection sort",
  braingoat: `IntList<20> list = [4,2,4,2,6,9,5,3,6,8,1,6,3,5,8,9,6,3,2,4]

Int p_index = 0

Int tmp = 0
Int j = 0 
Int i = 1

while ((j < 20)) {
  i = j
  p_index = (j + 1)
  while((i < 20)) {
    if((list[i] < list[p_index])) {
      p_index = i
    }
    i = (i + 1)
  }
  tmp = list[j]
  list[j] = list[p_index]
  list[p_index] = tmp
  j = (j + 1)
}

printN(list)
`,
  testCases: [
    {
      name: "Selection sort 20 numbers in list",
      input: "",
      output: "12223334445566668899",
    },
  ],
};
