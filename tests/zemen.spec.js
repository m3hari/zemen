const testData = require("./data");
const { toGC, toEE } = require("../src/index.ts");

describe("Zemen", () => {
  const table = testData.map(({ gc, ee }) => [gc, ee]);
  it.each(table)(
    "Correctly converts geregorian date to ethiopic date  %o",
    (gc, ee) => {
      expect(toEE(gc)).toEqual(ee);
    }
  );
  it.each(table)(
    "Correctly converts ethiopic date to geregorian date  %o",
    (gc, ee) => {
      expect(toGC(ee)).toEqual(gc);
    }
  );
});
