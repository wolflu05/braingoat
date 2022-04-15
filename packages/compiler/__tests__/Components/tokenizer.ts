import { Tokenizer } from "../../src/Components/Tokenizer";

describe("tokenize", () => {
  test("tokenize single variable", () => {
    const input = ["int i=0"];
    const tokens = Tokenizer.tokenize(input);
    expect(tokens).toMatchSnapshot();
  });

  test("removes whitespace", () => {
    const input = ["int i       =    ", " 0"];
    const tokens = Tokenizer.tokenize(input);
    expect(tokens).toMatchSnapshot();
  });

  test("work with a single token", () => {
    const input = ["int"];
    const tokens = Tokenizer.tokenize(input);
    expect(tokens).toMatchSnapshot();
  });

  test("function call", () => {
    const input = ["add(a, b, c)"];
    const tokens = Tokenizer.tokenize(input);
    expect(tokens).toMatchSnapshot();
  });

  test("function block call", () => {
    const input = `add(a, b, c) {
                      b()
                   }`.split("\n");
    const tokens = Tokenizer.tokenize(input);
    expect(tokens).toMatchSnapshot();
  });

  test("work with long list of tokens", () => {
    const input = `add(a, b, c) {
                      b()
                      d()
                      while(a,v,b) {
                        while(a,v,c) {
                          while(a,v,c) {
                            while(a,v,c) {
                              hans = a
                              b= 1
                            }
                          }
                        }
                      }
                   }`.split("\n");
    const tokens = Tokenizer.tokenize(input);
    expect(tokens).toMatchSnapshot();
  });
});
