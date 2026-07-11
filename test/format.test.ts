import { describe, expect, it } from "bun:test";
import Zemen from "../src/zemen";

describe("format", () => {
  const zare = new Zemen("2009-12-27"); // ቅዳሜ (Saturday)
  const meskerem1 = new Zemen("2009-1-1"); // እሑድ (Sunday)

  const cases: [pattern: string, expected: string][] = [
    ["Y", "2009"],
    ["YY", "09"],
    ["YYY", "092009"], // YY then Y — preserved repetition quirk
    ["YYYY", "2009"],
    ["YYYYY", "20092009"],
    ["YYYYYY", "200909"],
    ["M", "12"],
    ["MM", "12"],
    ["MMM", "ነሐሴ"],
    ["MMMM", "ነሐሴ"],
    ["MMMMM", "ነሐሴ12"],
    ["MMMMMM", "ነሐሴ12"],
    ["D", "27"],
    ["DD", "27"],
    ["DDD", "ቅዳሜ"],
    ["DDDD", "ቅዳሜ27"],
    ["DDDDD", "ቅዳሜ27"],
    ["DDDDDD", "ቅዳሜቅዳሜ"],
    ["d", "ቅዳሜ"],
    ["e", "6"],
    ["E", "ዓ.ም"],
    ["d MMM/DD/YYYY", "ቅዳሜ ነሐሴ/27/2009"],
    ["d ፣ MMM DD ቀን YYYY E", "ቅዳሜ ፣ ነሐሴ 27 ቀን 2009 ዓ.ም"],
    ["plain ጽሑፍ!?", "plain ጽሑፍ!?"],
  ];
  for (const [pattern, expected] of cases) {
    it(`'${pattern}' → '${expected}'`, () => {
      expect(zare.format(pattern)).toBe(expected);
    });
  }

  it("zero-pads single digits", () => {
    expect(meskerem1.format("YY-MM-DD")).toBe("09-01-01");
    expect(meskerem1.format("DDDD")).toBe("እሑድ1");
  });

  it("no pattern (or empty pattern) → 'y-m-d'", () => {
    expect(zare.format()).toBe("2009-12-27");
    expect(zare.format("")).toBe("2009-12-27");
  });

  it("two-digit padding is % 100 based, odd for negative years (quirk)", () => {
    const z = new Zemen(-500, 5, 5);
    expect(z.format("Y")).toBe("-500");
    expect(z.format("YY")).toBe("00");
  });
});
