import {
  copticFromRd,
  geregorianFromRd,
  rdFromCoptic,
  ethiopicFromRd,
  rdFromEthiopic,
  rdFromGeregorian,
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
      expect(copticFromRd(testData.rd)).toEqual(testData.coptic);
    });

    it("should correctly change fixed dates to ethiopic", () => {
      expect(ethiopicFromRd(testData.rd)).toEqual(testData.ethiopic);
    });
    it("should correctly change fixed dates to gregorian", () => {
      expect(geregorianFromRd(testData.rd)).toEqual(testData.gregorian);
    });
  });

  describe("date to fixed", () => {
    it("should correctly change fixed dates to coptic", () => {
      expect(rdFromCoptic(testData.coptic)).toEqual(testData.rd);
    });
    it("should correctly change fixed dates to ethiopic", () => {
      expect(rdFromEthiopic(testData.ethiopic)).toEqual(testData.rd);
    });
    it("should correctly change fixed dates to gregorian", () => {
      expect(rdFromGeregorian(testData.gregorian)).toEqual(testData.rd);
    });
  });
});
