import { describe, expect, it } from "bun:test";
import Zemen from "../src/zemen";
import { MONTH_NAMES, WEEKDAY_NAMES } from "../src/names";

describe("Zemen constructor", () => {
  it("no arguments → today", () => {
    expect(new Zemen()).toBeInstanceOf(Zemen);
  });

  it("from an Ethiopian date string", () => {
    expect(new Zemen("2009-12-27").toString()).toBe("2009-12-27");
    expect(new Zemen("007-08-09").toString()).toBe("7-8-9");
  });

  it("from (year, month, day) numbers — month is 0-based", () => {
    expect(new Zemen(2009, 11, 27).toString()).toBe("2009-12-27");
  });

  it("coerces string and float arguments like parseInt", () => {
    expect(new Zemen("2009", "11", "27").toString()).toBe("2009-12-27");
    expect(new Zemen(2009.9, 11.2, 27.7).toString()).toBe("2009-12-27");
    expect(new Zemen("0x10", "2", "3").toString()).toBe("0-3-3"); // radix 10
  });

  it("rejects arguments that coerce to NaN", () => {
    expect(() => new Zemen("abc", 1, 2)).toThrow("Invalid Ethiopian Date");
    expect(() => new Zemen(2009, "ጳጉሜ", 1)).toThrow("Invalid Ethiopian Date");
  });

  it("throws ParsingError for malformed or empty strings", () => {
    expect(() => new Zemen("")).toThrow("ParsingError: Can't parse ");
    expect(() => new Zemen("2010-01-01-0669--")).toThrow("ParsingError: Can't parse 2010-01-01-0669--");
    expect(() => new Zemen("2010/01/01")).toThrow("ParsingError: Can't parse 2010/01/01");
  });

  it("throws 'Invalid Argument Exception' for wrong arity or type", () => {
    for (const call of [
      () => new (Zemen as any)(2009, 5),
      () => new (Zemen as any)(2009, 5, 15, 15),
      () => new (Zemen as any)(null),
      () => new (Zemen as any)(undefined),
      () => new (Zemen as any)({}),
      () => new (Zemen as any)(new Date(2017, 8, 2)), // Gregorian input → fromGregorian
      () => new (Zemen as any)(2009),
      () => new (Zemen as any)(true),
    ]) {
      expect(call).toThrow("Invalid Argument Exception");
    }
  });

  it("instances are immutable — no public fields to poke", () => {
    const z = new Zemen(2009, 11, 27);
    expect((z as any).year).toBeUndefined();
    expect((z as any).month).toBeUndefined();
    expect((z as any).date).toBeUndefined();
    expect((z as any).gc).toBeUndefined();
    (z as any).year = 1234;
    expect(z.getFullYear()).toBe(2009); // getters read private state
  });
});

describe("Zemen.fromGregorian (Gregorian → Ethiopian)", () => {
  it("from (year, month, day) numbers — month is 0-based", () => {
    expect(Zemen.fromGregorian(2017, 8, 2).toString()).toBe("2009-12-27");
  });

  it("from a Date object", () => {
    expect(Zemen.fromGregorian(new Date(2017, 8, 2)).toString()).toBe("2009-12-27");
    expect(Zemen.fromGregorian(new Date(2023, 11, 25)).toString()).toBe("2016-4-15"); // December
  });

  it("date-only ISO strings are timezone-stable", () => {
    expect(Zemen.fromGregorian("2017-09-02").toString()).toBe("2009-12-27"); // same in every TZ
    expect(Zemen.fromGregorian("2017-09-02").toString()).toBe(Zemen.fromGregorian(2017, 8, 2).toString());
    expect(() => Zemen.fromGregorian("2023-02-30")).toThrow("Invalid Gregorian Date"); // no Date rollover
    expect(() => Zemen.fromGregorian("not a date")).toThrow("Invalid Gregorian Date");
  });

  it("rejects nonexistent Gregorian days", () => {
    expect(() => Zemen.fromGregorian(2023, 1, 29)).toThrow("Invalid Gregorian Date"); // non-leap Feb
    expect(() => Zemen.fromGregorian(2023, -1, 10)).toThrow("Invalid Gregorian Date");
    expect(() => Zemen.fromGregorian(NaN, 8, 2)).toThrow("Invalid Gregorian Date");
  });

  it("rejects Gregorian dates before the ዓመተ ምሕረት epoch", () => {
    // EC 1-1-1 is Aug 27, 8 AD.
    expect(() => Zemen.fromGregorian(7, 7, 28)).toThrow("Invalid Gregorian Date");
    expect(() => Zemen.fromGregorian(8, 7, 26)).toThrow("Invalid Gregorian Date");
    expect(Zemen.fromGregorian(8, 7, 27).toString()).toBe("1-1-1");
    expect(Zemen.fromGregorian(8, 7, 27).toGregorian().getFullYear()).toBe(8);
  });

  it("throws 'Invalid Argument Exception' for wrong arity or type", () => {
    expect(() => (Zemen as any).fromGregorian(2009, 5, 15, 15)).toThrow("Invalid Argument Exception");
    expect(() => (Zemen as any).fromGregorian(null)).toThrow("Invalid Argument Exception");
    expect(() => (Zemen as any).fromGregorian(undefined)).toThrow("Invalid Argument Exception");
    expect(() => (Zemen as any).fromGregorian({})).toThrow("Invalid Argument Exception");
  });
});

describe("toGregorian (Ethiopian → Gregorian)", () => {
  it("converts to a JS Date", () => {
    expect(new Zemen("2009-12-27").toGregorian().toDateString()).toBe("Sat Sep 02 2017");
    expect(new Zemen(2009, 11, 27).toGregorian().toDateString()).toBe("Sat Sep 02 2017");
  });

  it("handles ጳጉሜን, the 13th month", () => {
    expect(new Zemen("2011-13-5").toGregorian().toDateString()).toBe("Tue Sep 10 2019");
    expect(new Zemen(2011, 12, 6).toGregorian().toDateString()).toBe("Wed Sep 11 2019"); // 2011 is leap
  });

  it("round-trips with fromGregorian", () => {
    const gc = new Date(2024, 1, 29);
    expect(Zemen.fromGregorian(gc).toGregorian().toDateString()).toBe(gc.toDateString());
  });

  it("preserves Gregorian years 0-99", () => {
    expect(new Zemen(1, 0, 1).toGregorian().getFullYear()).toBe(8); // EC 1-1-1 == Aug 27, 8 AD
    expect(new Zemen(85, 0, 1).toGregorian().getFullYear()).toBe(92);
  });

  it("returns a fresh Date — mutating it does not touch the instance", () => {
    const z = new Zemen(2009, 11, 27);
    z.toGregorian().setFullYear(1999);
    expect(z.toGregorian().getFullYear()).toBe(2017);
  });

  it("rejects nonexistent Ethiopian dates at construction", () => {
    expect(() => new Zemen(2011, 12, 30)).toThrow("Invalid Ethiopian Date");
    expect(() => new Zemen(2000, 12, 6)).toThrow("Invalid Ethiopian Date"); // 2000 is not a leap year
    expect(() => new Zemen(2009, -1, 10)).toThrow("Invalid Ethiopian Date");
    expect(() => new Zemen(2009, 0, 0)).toThrow("Invalid Ethiopian Date");
  });
});

describe("names & weekdays", () => {
  it("month names for all 13 months", () => {
    const full = ["መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"];
    expect([...MONTH_NAMES]).toEqual(full);
    for (let m = 0; m <= 12; m += 1) {
      expect(new Zemen(2015, m, 5).getMonthName()).toBe(full[m]!);
    }
  });

  it("weekday names and getDay across a full week", () => {
    // 2009-12-21 E.C is a Sunday (እሑድ)
    const week = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሓሙስ", "ዓርብ", "ቅዳሜ"];
    expect([...WEEKDAY_NAMES]).toEqual(week);
    for (let i = 0; i < 7; i += 1) {
      const z = new Zemen(2009, 11, 21 + i);
      expect(z.getDayOfWeek()).toBe(week[i]!);
      expect(z.getDay()).toBe(i);
    }
  });
});
