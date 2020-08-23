import { format } from "./index";

describe("Formatting", () => {
  it("Default formatting works correctly", () => {
    expect(format({ year: 2012, month: 3, day: 6 })).toBe("2012-03-06");
  });
  it("Day formatting works correctly", () => {
    expect(format({ year: 2012, month: 3, day: 6 }, "D")).toBe("6");
    expect(format({ year: 2012, month: 3, day: 6 }, "DD")).toBe("06");
  });
  it("Month formatting works correctly", () => {
    expect(format({ year: 2012, month: 4, day: 6 }, "M")).toBe("4");
    expect(format({ year: 2012, month: 4, day: 6 }, "MM")).toBe("04");
    expect(format({ year: 2012, month: 4, day: 6 }, "MMM")).toBe("ታህሣ");
    expect(format({ year: 2012, month: 4, day: 6 }, "MMMM")).toBe("ታህሣሥ");
  });
  it("Year formatting works correctly", () => {
    expect(format({ year: 2012, month: 3, day: 6 }, "YY")).toBe("12");
    expect(format({ year: 2012, month: 3, day: 6 }, "YYYY")).toBe("2012");
  });
  it("Formatting works with any separator", () => {
    expect(format({ year: 2012, month: 3, day: 6 }, "D/MM/YYYY")).toBe(
      "6/03/2012"
    );
    expect(format({ year: 2012, month: 10, day: 6 }, "D-MMM-YY")).toBe(
      "6-ሰኔ-12"
    );
    expect(format({ year: 2012, month: 10, day: 6 }, "D ፣ MMMM ፣ YYYY")).toBe(
      "6 ፣ ሰኔ ፣ 2012"
    );
  });
});
