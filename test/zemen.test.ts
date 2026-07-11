import { describe, expect, it } from "bun:test";
import Zemen from "../src/zemen";
import { MONTH_NAMES, SHORT_MONTH_NAMES, WEEKDAY_NAMES } from "../src/names";

describe("Zemen constructor", () => {
  it("no arguments → today", () => {
    expect(new Zemen()).toBeInstanceOf(Zemen);
  });

  it("from an Ethiopian date string", () => {
    expect(new Zemen("2009-12-27").toString()).toBe("2009-12-27");
  });

  it("from (year, month, day) numbers — month is 0-based", () => {
    expect(new Zemen(2009, 11, 27).toString()).toBe("2009-12-27");
  });

  it("coerces string and float arguments like parseInt", () => {
    expect(new Zemen("2009", "11", "27").toString()).toBe("2009-12-27");
    expect(new Zemen(2009.9, 11.2, 27.7).toString()).toBe("2009-12-27");
    expect(new Zemen("0x10", "2", "3").toString()).toBe("0-3-3"); // radix 10
    expect(new Zemen("abc", 1, 2).toString()).toBe("NaN-2-2"); // NaN flows through
  });

  it("throws 'Invalid Argument Exception' for wrong arity or type", () => {
    for (const call of [
      () => new (Zemen as any)(2009, 5),
      () => new (Zemen as any)(2009, 5, 15, 15),
      () => new (Zemen as any)(null),
      () => new Zemen(undefined),
      () => new (Zemen as any)({}),
      () => new (Zemen as any)(new Error("x")),
      () => new Zemen(2009),
      () => new (Zemen as any)(true),
    ]) {
      expect(call).toThrow("Invalid Argument Exception");
    }
  });

  it("empty string dies in parse with a TypeError (preserved quirk)", () => {
    expect(() => new Zemen("")).toThrow(TypeError);
  });
});

describe("Zemen.toEC (Gregorian → Ethiopian)", () => {
  it("from (year, month, day) numbers — month is 0-based", () => {
    expect(Zemen.toEC(2017, 8, 2).toString()).toBe("2009-12-27");
  });

  it("from a Date object", () => {
    expect(Zemen.toEC(new Date(2017, 8, 2)).toString()).toBe("2009-12-27");
  });

  it("string input uses native Date parsing (so it is timezone-sensitive)", () => {
    // the string path and the Date path share the same native parse
    expect(Zemen.toEC("2017-09-02").toString())
      .toBe(Zemen.toEC(new Date("2017-09-02")).toString());
  });

  it("throws 'Invalid Argument Exception' for wrong arity or type", () => {
    expect(() => (Zemen as any).toEC(2009, 5, 15, 15)).toThrow("Invalid Argument Exception");
    expect(() => (Zemen as any).toEC(null)).toThrow("Invalid Argument Exception");
    expect(() => (Zemen as any).toEC(undefined)).toThrow("Invalid Argument Exception");
    expect(() => (Zemen as any).toEC({})).toThrow("Invalid Argument Exception");
  });
});

describe("Zemen.toGC (Ethiopian → Gregorian)", () => {
  it("from an Ethiopian date string", () => {
    expect(Zemen.toGC("2009-12-27").toDateString()).toBe("Sat Sep 02 2017");
  });

  it("from a Zemen instance", () => {
    expect(Zemen.toGC(new Zemen("2009-12-27")).toDateString()).toBe("Sat Sep 02 2017");
  });

  it("from (year, month, day) numbers — month is 0-based", () => {
    expect(Zemen.toGC(2009, 11, 27).toDateString()).toBe("Sat Sep 02 2017");
  });

  it("handles ጳጉሜን, the 13th month", () => {
    expect(Zemen.toGC("2011-13-5").toDateString()).toBe("Tue Sep 10 2019");
  });

  it("throws 'Invalid Argument Exception' for wrong arity or type", () => {
    expect(() => (Zemen as any).toGC(2009, 5, 15, 15)).toThrow("Invalid Argument Exception");
    expect(() => (Zemen as any).toGC(null)).toThrow("Invalid Argument Exception");
    expect(() => (Zemen as any).toGC(undefined)).toThrow("Invalid Argument Exception");
    expect(() => (Zemen as any).toGC({})).toThrow("Invalid Argument Exception");
  });
});

describe("Zemen.parse", () => {
  it("parses 'y-m-d' strings", () => {
    const date = Zemen.parse("2010-01-01");
    expect(date).toBeInstanceOf(Zemen);
    expect(date.getFullYear()).toBe(2010);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(1);
    expect(Zemen.parse("007-08-09").toString()).toBe("7-8-9");
  });

  it("returns '' for falsy input (preserved quirk)", () => {
    expect(Zemen.parse() as unknown as string).toBe("");
    expect(Zemen.parse(null) as unknown as string).toBe("");
    expect(Zemen.parse(undefined) as unknown as string).toBe("");
  });

  it("throws ParsingError for malformed strings", () => {
    expect(() => Zemen.parse("2010-01-01-0669--"))
      .toThrow("ParsingError: Can't parse 2010-01-01-0669--");
    expect(() => Zemen.parse("2010/01/01")).toThrow("ParsingError: Can't parse 2010/01/01");
  });

  it("throws for any parsing pattern (not implemented)", () => {
    expect(() => Zemen.parse("2010/01/01", "DDDD")).toThrow("Not implemented Exception :(");
  });
});

describe("names & weekdays", () => {
  it("month names, full and short, for all 13 months", () => {
    const full = ["መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"];
    const short = ["መስከ", "ጥቅም", "ኅዳር", "ታኅሣ", "ጥር", "የካቲ", "መጋቢ", "ሚያዝ", "ግንቦ", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"];
    expect([...MONTH_NAMES]).toEqual(full);
    expect(SHORT_MONTH_NAMES).toEqual(short);
    for (let m = 0; m <= 12; m += 1) {
      const z = new Zemen(2015, m, 15);
      expect(z.getMonthName()).toBe(full[m]!);
      expect(z.getShortMonthName()).toBe(short[m]!);
    }
  });

  it("weekday names across a full week", () => {
    // 2009-12-21 E.C is a Sunday (እሑድ)
    const week = ["እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሓሙስ", "ዓርብ", "ቅዳሜ"];
    expect([...WEEKDAY_NAMES]).toEqual(week);
    for (let i = 0; i < 7; i += 1) {
      const z = new Zemen(2009, 11, 21 + i);
      expect(z.getDayOfWeek()).toBe(week[i]!);
      expect(z.getGCWeekDay()).toBe(i);
    }
  });
});

describe("preserved quirks (kept for byte-compatibility with 0.0.7)", () => {
  it("new Zemen(dateObject) runs one month ahead, and throws for December", () => {
    expect(new Zemen(new Date(2017, 8, 2)).toString()).toBe("2010-1-22"); // not 2009-12-27!
    expect(() => new Zemen(new Date(2023, 11, 25))).toThrow("Invalid Gregorian Date");
    // the static form is the correct one:
    expect(Zemen.toEC(new Date(2017, 8, 2)).toString()).toBe("2009-12-27");
  });

  it("toGC maps Gregorian years 0-99 into 1900-1999 (Date constructor)", () => {
    expect(Zemen.toGC(1, 0, 1).toDateString()).toBe("Thu Aug 27 1908");
  });

  it("ጳጉሜን days 7-30 pass validation and spill into the next year", () => {
    expect(Zemen.toGC(2011, 12, 30).toDateString()).toBe("Sat Oct 05 2019");
    expect(() => Zemen.toGC(2009, -1, 10)).not.toThrow(); // public month -1 → internal 0
  });
});
