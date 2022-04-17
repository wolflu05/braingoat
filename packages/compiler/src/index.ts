import { Braingoat } from "./Braingoat";

try {
  const bg = new Braingoat(`
int i = 4
int j = 4

neq(i, j)
print(i)
print(j)
`).compile();

  console.log(bg.bfCode);
} catch (err) {
  console.log((err as Error).stack);
}
