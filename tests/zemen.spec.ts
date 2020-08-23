const testData = require("./data");
import Zemen, { ethiopicToGregorian, gregorianToEthiopic } from "../src/index";

describe("Conversion", () => {
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

describe("Zemen API", () => {
  Date.now = jest.fn(() => 1597717251619); // Tue Aug 18 2020
  it("Initializes ethiopic date from current time", () => {
    expect(new Zemen().toString()).toBe("2012-12-12");
    expect(new Zemen().toLongDateString()).toBe("ማክሰኞ ነሐሴ 12 2012 ዓ.ም");
  });
  it("Initializes ethiopic date from gregorian date", () => {
    expect(new Zemen("Sep 10 2020").toString()).toBe("2012-13-05");
    expect(new Zemen("Sep 11 2020").toString()).toBe("2013-01-01");
    expect(new Zemen("Mar 16 1995").toLongDateString()).toBe(
      "ሐሙስ መጋቢት 07 1987 ዓ.ም"
    );
    expect(new Zemen("Sep 02 2017").toLongDateString()).toBe(
      "ቅዳሜ ነሐሴ 27 2009 ዓ.ም"
    );
  });
});
