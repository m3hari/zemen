/**
 * Golden-master parity replay.
 *
 * Replays every fixture in test/golden/fixtures.json (generated from the
 * published zemen@0.0.7 tarball by scripts/generate-golden.ts) against the
 * current implementation and requires byte-exact equality — outputs and
 * thrown error messages alike. This suite is the no-breaking-changes gate
 * and stays in CI permanently.
 */
import { describe, expect, it } from "bun:test";
import { Zemen as ZemenClass } from "./_lib";
import fixtures from "./golden/fixtures.json";

// The replay deliberately exercises off-contract inputs (nulls, wrong
// arities, garbage strings), so it drives the class through an untyped alias.
const Zemen: any = ZemenClass;

/** Mirror of the generator's encoding: explicit `Error`s pin the message,
 * incidental engine errors pin only the class name. */
function capture(fn: () => unknown): string {
  try {
    return String(fn());
  } catch (err) {
    const e = err as Error;
    return e.constructor === Error ? `!${e.message}` : `!!${e.constructor.name}`;
  }
}

function replay(section: (string | number)[][], run: (f: (string | number)[]) => unknown) {
  let mismatches = 0;
  let first = "";
  for (const f of section) {
    const expected = f[f.length - 1] as string;
    const actual = capture(() => run(f));
    if (actual !== expected) {
      mismatches += 1;
      if (!first) first = `input=${JSON.stringify(f.slice(0, -1))} expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`;
    }
  }
  expect(mismatches, `first mismatch: ${first}`).toBe(0);
}

describe("golden-master parity with published zemen@0.0.7", () => {
  it(`toEC(y, m, d) — ${fixtures.toEC.length} cases`, () => {
    replay(fixtures.toEC, ([y, m, d]) => Zemen.toEC(y, m, d).toString());
  });

  it(`toGC(y, m, d) — ${fixtures.toGC.length} cases`, () => {
    replay(fixtures.toGC, ([y, m, d]) => Zemen.toGC(y, m, d).toDateString());
  });

  it(`format(pattern) — ${fixtures.format.length} cases`, () => {
    replay(fixtures.format, ([y, m, d, p]) =>
      p === "<none>" ? new Zemen(y, m, d).format() : new Zemen(y, m, d).format(p as string),
    );
  });

  it(`constructor arities & coercions — ${fixtures.ctor.length} cases`, () => {
    replay(fixtures.ctor, ([input]) => {
      const key = input as string;
      if (key.startsWith("Date(")) {
        const [gy, gm0, gd] = key.slice(5, -1).split(",").map(Number);
        return new Zemen(new Date(gy, gm0, gd)).toString();
      }
      switch (key) {
        case "[2009]": return new Zemen(2009).toString();
        case "[2009,5]": return new (Zemen as any)(2009, 5).toString();
        case "[2009,5,15,15]": return new (Zemen as any)(2009, 5, 15, 15).toString();
        case "[null]": return new Zemen(null).toString();
        case "[undefined-explicit]": return new Zemen(undefined).toString();
        case "[{}]": return new Zemen({}).toString();
        case "[ErrorObj]": return new Zemen(new Error("x")).toString();
        case "[emptyString]": return new Zemen("").toString();
        case "[true]": return new Zemen(true).toString();
      }
      const args = JSON.parse(key);
      if (args.length === 1) return new Zemen(args[0]).toString();
      const z = new Zemen(args[0], args[1], args[2]);
      return `${z.toString()}|${z.getFullYear()}|${z.getMonth()}|${z.getDate()}`;
    });
  });

  it(`parse — ${fixtures.parse.length} cases`, () => {
    replay(fixtures.parse, ([input]) => {
      const key = input as string;
      if (key === "[<no args>]") return `str:${Zemen.parse()}`;
      if (key === "[null]") return `str:${Zemen.parse(null)}`;
      const args = JSON.parse(key);
      if (args.length === 2) return String(Zemen.parse(args[0], args[1]));
      const r = Zemen.parse(args[0]);
      return typeof r === "string" ? `str:${r}` : `zemen:${r.toString()}`;
    });
  });

  it(`getters (names, weekdays) — ${fixtures.getters.length} cases`, () => {
    replay(fixtures.getters, ([y, m, d, expected]) => {
      const z = new Zemen(y, m, d);
      return (expected as string).split("|").length === 4
        ? `${z.getMonthName()}|${z.getShortMonthName()}|${z.getDayOfWeek()}|${z.getGCWeekDay()}`
        : `${z.getDayOfWeek()}|${z.getGCWeekDay()}`;
    });
  });

  it(`misc static forms — ${fixtures.misc.length} cases`, () => {
    replay(fixtures.misc, ([input]) => {
      const key = input as string;
      switch (key) {
        case "toGC(Zemen(2009-12-27))": return Zemen.toGC(new Zemen(2009, 11, 27)).toDateString();
        case "toGC('2009-12-27')": return Zemen.toGC("2009-12-27").toDateString();
        case "toGC('2011-13-5')": return Zemen.toGC("2011-13-5").toDateString();
        case "toGC(null)": return Zemen.toGC(null);
        case "toGC({})": return Zemen.toGC({});
        case "toGC(2009,5,15,15)": return (Zemen as any).toGC(2009, 5, 15, 15);
        case "toEC(null)": return Zemen.toEC(null);
        case "toEC({})": return Zemen.toEC({});
        case "toEC(2009,5,15,15)": return (Zemen as any).toEC(2009, 5, 15, 15);
        default: throw new Error(`unknown misc fixture: ${key}`);
      }
    });
  });
});
