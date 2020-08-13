const testData = require("./data");
const { ethiopicToGregorian, gregorianToEthiopic } = require("../src/index");

describe("Zemen", () => {
  const table = testData.map(({ gc, ee }) => [gc, ee]);
  it.each(table)(
    "Correctly converts geregorian date to ethiopic date  %o",
    (gc, ee) => {
      expect(gregorianToEthiopic(gc)).toEqual(ee);
    }
  );
  it.each(table)(
    "Correctly converts ethiopic date to geregorian date  %o",
    (gc, ee) => {
      expect(ethiopicToGregorian(ee)).toEqual(gc);
    }
  );
});
