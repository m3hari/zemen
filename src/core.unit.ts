import {
  copticFromFixed,
  geregorianFromFixed,
  fixedFromCoptic,
  ethiopicFromFixed,
  fixedFromEthiopic,
  fixedFromGeregorian,
} from "./core";

const testData = {
  rd: 708842,
  coptic: { year: 1658, month: 1, day: 19 },
  ethiopic: { year: 1934, month: 1, day: 19 },
  gregorian: { year: 1941, month: 9, day: 29 },
};

describe("core", () => {
  describe("fixed to date", () => {
    it("should correctly change fixed dates to coptic", () => {
      expect(copticFromFixed(testData.rd)).toEqual(testData.coptic);
    });

    it("should correctly change fixed dates to ethiopic", () => {
      expect(ethiopicFromFixed(testData.rd)).toEqual(testData.ethiopic);
    });
    it("should correctly change fixed dates to gregorian", () => {
      expect(geregorianFromFixed(testData.rd)).toEqual(testData.gregorian);
    });
  });

  describe("date to fixed", () => {
    it("should correctly change fixed dates to coptic", () => {
      expect(fixedFromCoptic(testData.coptic)).toEqual(testData.rd);
    });
    it("should correctly change fixed dates to ethiopic", () => {
      expect(fixedFromEthiopic(testData.ethiopic)).toEqual(testData.rd);
    });
    it("should correctly change fixed dates to gregorian", () => {
      expect(fixedFromGeregorian(testData.gregorian)).toEqual(testData.rd);
    });
  });
});
