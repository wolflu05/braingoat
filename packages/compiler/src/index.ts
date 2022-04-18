import { Braingoat } from "./Braingoat";
// IntList k = [1, 2, 3]

try {
  const bg = new Braingoat(`
  Int j = 100
  Int i = 200
  Int b = 0

  b = (i * j)

  print(b)
  `).compile();
  // b = (a + b)
  // Int a = (1 + (i * j)  )
  console.log(bg.bfCode);
} catch (err) {
  console.log((err as Error).stack);
}
