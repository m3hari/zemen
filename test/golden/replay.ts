/**
 * Shared golden-fixture replay engine.
 *
 * Used by test/golden.test.ts (replays fixtures against the current source)
 * and by scripts/verify.ts (replays the same fixtures against a freshly
 * downloaded zemen@0.0.7 from the npm registry, proving the committed
 * fixtures faithfully describe published behavior).
 */

export type Fixture = (string | number)[];
export type Sections = Record<string, Fixture[]>;

/** Encode a result or a throw. Explicit `Error`s pin the exact message;
 * incidental engine errors (e.g. TypeError) pin only the class name. */
export function capture(fn: () => unknown): string {
  try {
    return String(fn());
  } catch (err) {
    const e = err as Error;
    return e.constructor === Error ? `!${e.message}` : `!!${e.constructor.name}`;
  }
}

function runCtor(Zemen: any, key: string): unknown {
  if (key.startsWith("Date(")) {
    const [gy, gm0, gd] = key.slice(5, -1).split(",").map(Number);
    return new Zemen(new Date(gy!, gm0!, gd!)).toString();
  }
  switch (key) {
    case "[2009]": return new Zemen(2009).toString();
    case "[2009,5]": return new Zemen(2009, 5).toString();
    case "[2009,5,15,15]": return new Zemen(2009, 5, 15, 15).toString();
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
}

function runParse(Zemen: any, key: string): unknown {
  if (key === "[<no args>]") return `str:${Zemen.parse()}`;
  if (key === "[null]") return `str:${Zemen.parse(null)}`;
  const args = JSON.parse(key);
  if (args.length === 2) return String(Zemen.parse(args[0], args[1]));
  const r = Zemen.parse(args[0]);
  return typeof r === "string" ? `str:${r}` : `zemen:${r.toString()}`;
}

function runMisc(Zemen: any, key: string): unknown {
  switch (key) {
    case "toGC(Zemen(2009-12-27))": return Zemen.toGC(new Zemen(2009, 11, 27)).toDateString();
    case "toGC('2009-12-27')": return Zemen.toGC("2009-12-27").toDateString();
    case "toGC('2011-13-5')": return Zemen.toGC("2011-13-5").toDateString();
    case "toGC(null)": return Zemen.toGC(null);
    case "toGC({})": return Zemen.toGC({});
    case "toGC(2009,5,15,15)": return Zemen.toGC(2009, 5, 15, 15);
    case "toEC(null)": return Zemen.toEC(null);
    case "toEC({})": return Zemen.toEC({});
    case "toEC(2009,5,15,15)": return Zemen.toEC(2009, 5, 15, 15);
    default: throw new Error(`unknown misc fixture: ${key}`);
  }
}

function runFixture(section: string, Zemen: any, f: Fixture): unknown {
  switch (section) {
    case "toEC": return Zemen.toEC(f[0], f[1], f[2]).toString();
    case "toGC": return Zemen.toGC(f[0], f[1], f[2]).toDateString();
    case "format": {
      const [y, m, d, p] = f;
      return p === "<none>" ? new Zemen(y, m, d).format() : new Zemen(y, m, d).format(p);
    }
    case "ctor": return runCtor(Zemen, f[0] as string);
    case "parse": return runParse(Zemen, f[0] as string);
    case "getters": {
      const z = new Zemen(f[0], f[1], f[2]);
      return (f[3] as string).split("|").length === 4
        ? `${z.getMonthName()}|${z.getShortMonthName()}|${z.getDayOfWeek()}|${z.getGCWeekDay()}`
        : `${z.getDayOfWeek()}|${z.getGCWeekDay()}`;
    }
    case "misc": return runMisc(Zemen, f[0] as string);
    default: throw new Error(`unknown fixture section: ${section}`);
  }
}

export interface ReplayResult {
  cases: number;
  mismatches: number;
  firstMismatch: string;
}

/** Replay one fixture section against a Zemen implementation. */
export function replaySection(section: string, fixtures: Fixture[], Zemen: any): ReplayResult {
  let mismatches = 0;
  let firstMismatch = "";
  for (const f of fixtures) {
    const expected = f[f.length - 1] as string;
    const actual = capture(() => runFixture(section, Zemen, f));
    if (actual !== expected) {
      mismatches += 1;
      if (!firstMismatch) {
        firstMismatch = `[${section}] input=${JSON.stringify(f.slice(0, -1))} expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`;
      }
    }
  }
  return { cases: fixtures.length, mismatches, firstMismatch };
}
