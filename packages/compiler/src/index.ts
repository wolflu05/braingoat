import { Braingoat } from "./Braingoat";
try {
  const bg = new Braingoat(`
  Int a = 1
  Int b = 1
  
  IntList<3> k = [10,20,30]
  k[(a + b)] = 42

  print(k[(a+(b-1))])
  `).compile();
  // k[1] = 5
  // b = (a + b)
  // Int a = (1 + (i * j)  )
  console.log(bg.bfCode);
} catch (err) {
  console.log((err as Error).stack);
}
