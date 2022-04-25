export interface ITestCase {
  name: string;
  input: string;
  output: string;
}

export interface IExample {
  name: string;
  braingoat: string;
  testCases: ITestCase[];
}
