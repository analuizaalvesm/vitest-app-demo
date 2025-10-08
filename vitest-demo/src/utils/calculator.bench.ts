// @vitest-environment node
// @vitest-ignore

import { bench } from "vitest";
import { Calculator } from "./index";

const calculator = Calculator();

bench("add 1 million numbers", () => {
  let sum = 0;
  for (let i = 0; i < 1_000_000; i++) {
    sum = calculator.add(sum, i);
  }
});

bench("multiply 100k numbers", () => {
  let product = 1;
  for (let i = 1; i < 100_000; i++) {
    product = calculator.multiply(product, i);
  }
});

bench("divide 100k numbers", () => {
  let value = 1_000_000;
  for (let i = 1; i < 100_000; i++) {
    value = calculator.divide(value, i);
  }
});

bench("power 10k times", () => {
  let result = 2;
  for (let i = 1; i < 10_000; i++) {
    result = calculator.power(result, 1.0001);
  }
});
