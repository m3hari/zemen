/**
 * Golden-master fixture generator.
 *
 * Runs a large, fully deterministic input matrix against the VENDORED
 * published package (test/golden/baseline == the zemen@0.0.7 npm tarball,
 * see test/golden/baseline/MANIFEST.txt) and records every output and every
 * thrown error. The committed fixtures.json is the behavioral contract the
 * rewrite must reproduce byte-for-byte (replayed by test/golden.test.ts).
 *
 * Deliberately excluded because they are timezone- or clock-dependent:
 * `new Zemen()`, `Zemen.toEC(<string>)`, `Zemen.toEC(<Date>)`. Those paths
 * are verified relatively (old vs new in the same process) by
 * scripts/verify.ts instead of via baked absolute values.
 *
 * Usage: bun scripts/generate-golden.ts
 */
// @ts-expect-error vendored untyped CJS oracle
import Zemen from "../test/golden/baseline/zemen.js";

type Fixture = (string | number)[];

/** Encode a result or a throw. Explicit `Error`s pin the exact message;
 * incidental engine errors (e.g. TypeError) pin only the class name. */
function capture(fn: () => unknown): string {
  try {
    return String(fn());
  } catch (err) {
    const e = err as Error;
    return e.constructor === Error ? `!${e.message}` : `!!${e.constructor.name}`;
  }
}

const daysInGcMonth = (y: number, m1: number) =>
  new Date(y, m1, 0).getDate(); // m1 is 1-based; day 0 of next month

// ---------------------------------------------------------------- toEC (GC → EC)
// Zemen.toEC(y, m0, d).toString() — m0 is the public 0-based Gregorian month.
const toEC: Fixture[] = [];
const gcFullYears: number[] = [];
for (const [from, to] of [
  [1855, 1870], // canonical Appleyard/Theodore era
  [1899, 1901],
  [1975, 1977],
  [1999, 2001],
  [2007, 2012], // Ethiopian millennium & 13-month edge years
  [2023, 2027],
] as const) {
  for (let y = from; y <= to; y++) gcFullYears.push(y);
}
for (const y of gcFullYears) {
  for (let m1 = 1; m1 <= 12; m1++) {
    for (let d = 1; d <= daysInGcMonth(y, m1); d++) {
      toEC.push([y, m1 - 1, d, capture(() => Zemen.toEC(y, m1 - 1, d).toString())]);
    }
  }
}
// Sparse sweep across eight centuries: every 13th day.
for (let y = 1600; y <= 2400; y += 1) {
  for (let doy = 1; doy <= 365; doy += 13) {
    const dt = new Date(y, 0, doy);
    const [gy, gm0, gd] = [dt.getFullYear(), dt.getMonth(), dt.getDate()];
    toEC.push([gy, gm0, gd, capture(() => Zemen.toEC(gy, gm0, gd).toString())]);
  }
}
// New-year / leap boundaries (Ethiopian new year falls Sep 11/12).
for (let y = 1892; y <= 2112; y += 1) {
  for (const [m0, d] of [
    [8, 5], [8, 6], [8, 7], [8, 8], [8, 9], [8, 10], [8, 11], [8, 12], [8, 13],
    [1, 26], [1, 27], [1, 28], [2, 1], // Feb/Mar (GC leap boundary)
    [11, 31], [0, 1], // year boundary
  ] as const) {
    toEC.push([y, m0, d, capture(() => Zemen.toEC(y, m0, d).toString())]);
  }
}
// Out-of-range / quirk inputs at the public boundary (m0 ∈ [-1,12] passes
// old validation; d=0 passes; d=32 & m0=13 throw).
for (const [y, m0, d] of [
  [2009, -1, 10], [2009, 0, 0], [2009, 13, 1], [2009, 5, 32], [2009, 5, -1],
  [2009, -2, 10], [0, 0, 1], [-500, 5, 5],
] as const) {
  toEC.push([y, m0, d, capture(() => Zemen.toEC(y, m0, d).toString())]);
}

// ---------------------------------------------------------------- toGC (EC → GC)
// Zemen.toGC(y, m0, d).toDateString() — TZ-independent (local ctor, local read)
// and pins the weekday plus the Q5 year-0..99 → 1900+y Date-constructor quirk.
const toGC: Fixture[] = [];
const ecFullYears: number[] = [];
for (const [from, to] of [
  [1847, 1862],
  [1891, 1893],
  [1967, 1969],
  [1991, 1996],
  [1999, 2004], // millennium, incl. leap ጳጉሜን
  [2015, 2019],
] as const) {
  for (let y = from; y <= to; y++) ecFullYears.push(y);
}
for (const y of ecFullYears) {
  for (let m0 = 0; m0 <= 12; m0++) {
    // d runs to 30 even for ጳጉሜን (m0=12): old validation allows it and the
    // arithmetic spills into the following year — that behavior is contract.
    for (let d = 1; d <= 30; d++) {
      toGC.push([y, m0, d, capture(() => Zemen.toGC(y, m0, d).toDateString())]);
    }
  }
}
// Sparse sweep: every 13th day across eight EC centuries.
for (let y = 1500; y <= 2300; y += 1) {
  for (let m0 = 0; m0 <= 12; m0++) {
    for (let d = 4; d <= 30; d += 13) {
      toGC.push([y, m0, d, capture(() => Zemen.toGC(y, m0, d).toDateString())]);
    }
  }
}
// Quirk & error inputs (m0=-1 passes old validation; d=0 passes; d=31 throws).
for (const [y, m0, d] of [
  [2009, -1, 10], [2009, 0, 0], [2009, 12, 6], [2009, 12, 30],
  [2009, 8, 31], [2009, 13, 1], [2009, -2, 10], [2009, 8, -1],
  [1, 0, 1], [3, 12, 6], [5500, 0, 1], [-500, 5, 5],
] as const) {
  toGC.push([y, m0, d, capture(() => Zemen.toGC(y, m0, d).toDateString())]);
}

// ---------------------------------------------------------------- formatting
const patterns = [
  "Y", "YY", "YYY", "YYYY", "YYYYY", "YYYYYY",
  "M", "MM", "MMM", "MMMM", "MMMMM", "MMMMMM",
  "D", "DD", "DDD", "DDDD", "DDDDD", "DDDDDD",
  "d", "dd", "e", "ee", "E", "EE",
  "YYYY-MM-DD", "DD/MM/YYYY", "MMM-DD-YYYY", "d ፣ MMM DD ቀን YYYY E",
  "d,MMM DD YYYY E", "e E d D M Y", "MMDDYY", "YDM", "MMMMDDD",
  "ዛሬ D ነው", "plain text", "X!?-", "", "YYYYMMDD",
];
// Dates covering all 13 months, ጳጉሜን 5/6, tiny/negative/NaN years, day 1/30.
const formatDates: [number, number, number][] = [
  [2009, 11, 27], [2009, 0, 1], [2011, 12, 5], [2003, 12, 6], [2015, 6, 30],
  [9, 3, 15], [99, 9, 9], [123, 4, 5], [-500, 5, 5], [2000, 1, 10],
  [2016, 2, 29], [1855, 1, 20], [5500, 0, 1], [2009, 7, 8],
];
for (let m0 = 0; m0 <= 12; m0++) formatDates.push([2015, m0, 15]);
for (let d = 8; d <= 14; d++) formatDates.push([2016, 2, d]); // one full week
const format: Fixture[] = [];
for (const [y, m0, d] of formatDates) {
  for (const p of patterns) {
    format.push([y, m0, d, p, capture(() => new Zemen(y, m0, d).format(p))]);
  }
  format.push([y, m0, d, "<none>", capture(() => new Zemen(y, m0, d).format())]);
}

// ---------------------------------------------------------------- constructors
const ctor: Fixture[] = [];
// 3-arg incl. string/float/garbage coercion through parseInt.
for (const [y, m0, d] of [
  [2009, 11, 27], ["2009", "11", "27"], [2009.9, 11.2, 27.7], ["09x", "2", "3"],
  ["abc", 1, 1], [2009, "ጳጉሜ", 1], [0, 0, 1], [-500, 5, 5], ["0x10", "0x1", "2"],
] as const) {
  ctor.push([
    JSON.stringify([y, m0, d]),
    capture(() => {
      const z = new Zemen(y, m0, d);
      return `${z.toString()}|${z.getFullYear()}|${z.getMonth()}|${z.getDate()}`;
    }),
  ]);
}
// 1-arg EC string (goes through Zemen.parse — no native Date, TZ-safe).
for (const s of ["2009-12-27", "2009-1-1", "0001-01-01", "2011-13-5", "2009-00-00"]) {
  ctor.push([JSON.stringify([s]), capture(() => new Zemen(s).toString())]);
}
// 1-arg Date object — pins the Q1 off-by-one-month bug, incl. the December
// throw. new Date(y, m0, d) is local+deterministic.
for (let gm0 = 0; gm0 <= 11; gm0++) {
  for (const [gy, gd] of [[2017, 2], [2020, 29], [1999, 15], [2024, 1]] as const) {
    ctor.push([
      `Date(${gy},${gm0},${gd})`,
      capture(() => new Zemen(new Date(gy, gm0, gd)).toString()),
    ]);
  }
}
// Invalid arities / types.
ctor.push(["[2009]", capture(() => new Zemen(2009).toString())]);
ctor.push(["[2009,5]", capture(() => new (Zemen as any)(2009, 5).toString())]);
ctor.push(["[2009,5,15,15]", capture(() => new (Zemen as any)(2009, 5, 15, 15).toString())]);
ctor.push(["[null]", capture(() => new Zemen(null).toString())]);
ctor.push(["[undefined-explicit]", capture(() => new Zemen(undefined).toString())]);
ctor.push(["[{}]", capture(() => new Zemen({}).toString())]);
ctor.push(["[ErrorObj]", capture(() => new Zemen(new Error("x")).toString())]);
ctor.push(["[emptyString]", capture(() => new Zemen("").toString())]);
ctor.push(["[true]", capture(() => new Zemen(true).toString())]);

// ---------------------------------------------------------------- parse
const parse: Fixture[] = [];
for (const s of [
  "2010-01-01", "2009-13-5", "1-1-1", "2010-01-01-0669--", "2010/01/01",
  "5-6", "a-b-c", "007-08-09", "--",
]) {
  parse.push([
    JSON.stringify([s]),
    capture(() => {
      const r = Zemen.parse(s);
      return typeof r === "string" ? `str:${r}` : `zemen:${r.toString()}`;
    }),
  ]);
}
parse.push(["[<no args>]", capture(() => `str:${Zemen.parse()}`)]);
parse.push(["[null]", capture(() => `str:${Zemen.parse(null)}`)]);
parse.push([
  JSON.stringify(["2010/01/01", "DDDD"]),
  capture(() => String(Zemen.parse("2010/01/01", "DDDD"))),
]);
parse.push([
  JSON.stringify(["2010-01-01", "YYYY-MM-DD"]),
  capture(() => String(Zemen.parse("2010-01-01", "YYYY-MM-DD"))),
]);

// ---------------------------------------------------------------- getters
const getters: Fixture[] = [];
for (let m0 = 0; m0 <= 12; m0++) {
  const z = new Zemen(2015, m0, 15 as number);
  getters.push([
    2015, m0, 15,
    `${z.getMonthName()}|${z.getShortMonthName()}|${z.getDayOfWeek()}|${z.getGCWeekDay()}`,
  ]);
}
for (let d = 8; d <= 14; d++) {
  const z = new Zemen(2016, 2, d);
  getters.push([2016, 2, d, `${z.getDayOfWeek()}|${z.getGCWeekDay()}`]);
}
// toGC(Zemen) and toGC(string) forms (both TZ-safe: no native Date parsing).
const misc: Fixture[] = [
  ["toGC(Zemen(2009-12-27))", capture(() => Zemen.toGC(new Zemen(2009, 11, 27)).toDateString())],
  ["toGC('2009-12-27')", capture(() => Zemen.toGC("2009-12-27").toDateString())],
  ["toGC('2011-13-5')", capture(() => Zemen.toGC("2011-13-5").toDateString())],
  ["toGC(null)", capture(() => Zemen.toGC(null))],
  ["toGC({})", capture(() => Zemen.toGC({}))],
  ["toGC(2009,5,15,15)", capture(() => (Zemen as any).toGC(2009, 5, 15, 15))],
  ["toEC(null)", capture(() => Zemen.toEC(null))],
  ["toEC({})", capture(() => Zemen.toEC({}))],
  ["toEC(2009,5,15,15)", capture(() => (Zemen as any).toEC(2009, 5, 15, 15))],
];

const fixtures = {
  oracle: "zemen@0.0.7 (npm dist.shasum 791265d7f42495888393b76892d730b0e2c7e0a8)",
  note: "Generated by scripts/generate-golden.ts from test/golden/baseline. Do not edit by hand.",
  toEC, toGC, format, ctor, parse, getters, misc,
};

const out = `${import.meta.dir}/../test/golden/fixtures.json`;
await Bun.write(out, JSON.stringify(fixtures));
const total = toEC.length + toGC.length + format.length + ctor.length + parse.length + getters.length + misc.length;
console.log(`wrote ${total} fixtures to test/golden/fixtures.json`);
for (const [k, v] of Object.entries({ toEC, toGC, format, ctor, parse, getters, misc })) {
  console.log(`  ${k.padEnd(8)} ${v.length}`);
}
