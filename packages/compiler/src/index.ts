import { Braingoat } from "./Braingoat";

try {
  const bg = new Braingoat(`
int i = 0
print(i) {
  print(i) {
    print(i)
  }
}
`).compile();

  console.log(bg.bfCode);
} catch (err) {
  console.log((err as Error).stack);
}
