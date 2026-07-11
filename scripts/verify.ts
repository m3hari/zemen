/**
 * Independent behavioral verifier — `bun run verify`.
 *
 * 0.0.9 intentionally fixes conversion and validation bugs, so exact parity
 * with the published package no longer holds everywhere. This script proves
 * the release is correct AND that nothing drifted unintentionally:
 *
 *   V1  API surface       static + prototype members and Function#length
 *                         unchanged vs published zemen@0.0.7
 *   V2  scoped parity     on strictly-valid dates in 1901–2099 (where the
 *                         old math was correct), conversions, formatting and
 *                         parsing are byte-identical to 0.0.7 — the
 *                         regression gate against unintended drift
 *   V3  absolute oracle   every day 1583-01-01 → 2400-12-31, both directions,
 *                         against JS Date's proleptic Gregorian calendar,
 *                         anchored on the canonical academic table
 *   V4  validation        impossible dates and non-integer inputs throw
 *   V5  self-consistency  ctor(Date) == toEC(Date); ISO string == (y, m, d)
 *                         in every timezone
 *   V6  package contract  tarball, require/import shape + identity, types
 *
 * Exit code 0 = every check passed.
 */
import { $ } from "bun";
import { createRequire } from "node:module";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const require = createRequire(import.meta.url);
let failures = 0;
let firstDiff = "";

function report(check: string, pass: boolean, detail: string) {
  if (!pass) failures += 1;
  console.log(`${pass ? "PASS" : "FAIL"}  ${check.padEnd(24)} ${detail}`);
}

function capture(fn: () => unknown): string {
  try {
    return String(fn());
  } catch (err) {
    const e = err as Error;
    return e.constructor === Error ? `!${e.message}` : `!!${e.constructor.name}`;
  }
}

const note = (msg: string) => {
  if (!firstDiff) firstDiff = msg;
};

// Independent calendar facts (used by the sweeps; deliberately re-derived
// here rather than imported from the library under test).
const isGcLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
const gcMonthDays = (y: number, m: number) =>
  [0, 31, isGcLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]!;
const pagumeDays = (y: number) => (y % 4 === 3 ? 6 : 5);
const ecMonthDays = (y: number, m: number) => (m === 13 ? pagumeDays(y) : 30);

console.log("fetching zemen@0.0.7 from the npm registry…");
const tmp = mkdtempSync(join(tmpdir(), "zemen-verify-"));
await $`npm pack zemen@0.0.7 --pack-destination ${tmp}`.quiet();
await $`tar -xzf ${join(tmp, "zemen-0.0.7.tgz")} -C ${tmp}`.quiet();
const OldZemen = require(join(tmp, "package", "zemen.js"));

await $`bun scripts/build.ts`.cwd(root).quiet();
const NewCjs = require(join(root, "dist/index.cjs"));
const NewEsm = (await import(join(root, "dist/index.mjs"))).default;

// ---------------------------------------------------------------- V1: API surface
{
  const surface = (Z: any) =>
    [Z, Z.prototype]
      .map((o) =>
        Object.getOwnPropertyNames(o)
          .sort()
          .map((n) => (typeof o[n] === "function" ? `${n}/${o[n].length}` : n))
          .join(","),
      )
      .join(" | ");
  const [oldS, newS] = [surface(OldZemen), surface(NewCjs)];
  report("V1 API surface", oldS === newS, oldS === newS ? oldS : `old=${oldS}  new=${newS}`);
}

// ---------------------------------------------------------------- V2: scoped parity
{
  const patterns = ["YYYY-MM-DD", "MMM DD YYYY", "d ፣ MMMM DD ቀን YYYY E", "e", "M/D/YY"];
  let cases = 0;
  let bad = 0;
  const parity = (label: string, run: (Z: any) => unknown) => {
    const expected = capture(() => run(OldZemen));
    cases += 1;
    for (const [name, Z] of [["cjs", NewCjs], ["esm", NewEsm]] as const) {
      const actual = capture(() => run(Z));
      if (actual !== expected) {
        bad += 1;
        note(`V2 ${label} (${name}): old=${JSON.stringify(expected)} new=${JSON.stringify(actual)}`);
        return;
      }
    }
  };
  for (let y = 1901; y <= 2099; y += 1) {
    for (let m = 1; m <= 12; m += 1) {
      for (const d of [1, 15, gcMonthDays(y, m)]) {
        parity(`toEC(${y},${m - 1},${d})`, (Z) => Z.toEC(y, m - 1, d).toString());
      }
    }
  }
  for (let y = 1894; y <= 2091; y += 1) {
    for (let m = 1; m <= 13; m += 1) {
      for (const d of [1, ecMonthDays(y, m)]) {
        parity(`toGC(${y},${m - 1},${d})`, (Z) => Z.toGC(y, m - 1, d).toDateString());
        for (const p of patterns) {
          parity(`format(${y},${m - 1},${d},${p})`, (Z) => new Z(y, m - 1, d).format(p));
        }
      }
    }
    parity(`parse('${y}-4-11')`, (Z) => Z.parse(`${y}-4-11`).toString());
  }
  report("V2 scoped parity", bad === 0, `${cases} valid-domain cases vs 0.0.7, ${bad} mismatches`);
}

// ---------------------------------------------------------------- V3: absolute oracle
{
  // Anchor from the canonical table: GC 2005-01-01 == EC 1997-4-23.
  const nextEc = ([y, m, d]: number[]): number[] =>
    d! < ecMonthDays(y!, m!) ? [y!, m!, d! + 1] : m! < 13 ? [y!, m! + 1, 1] : [y! + 1, 1, 1];
  const prevEc = ([y, m, d]: number[]): number[] =>
    d! > 1 ? [y!, m!, d! - 1] : m! > 1 ? [y!, m! - 1, ecMonthDays(y!, m! - 1)] : [y! - 1, 13, pagumeDays(y! - 1)];
  let cases = 0;
  let bad = 0;
  for (const dir of [1, -1] as const) {
    let gc = new Date(Date.UTC(2005, 0, 1));
    let ec = [1997, 4, 23];
    while (true) {
      gc = new Date(gc.getTime() + dir * 86400000);
      ec = dir === 1 ? nextEc(ec) : prevEc(ec);
      const gy = gc.getUTCFullYear();
      if (gy < 1583 || gy > 2400) break;
      const [gm, gd] = [gc.getUTCMonth() + 1, gc.getUTCDate()];
      cases += 1;
      const lib = NewCjs.toGC(ec[0], ec[1]! - 1, ec[2]);
      const rev = capture(() => NewCjs.toEC(gy, gm - 1, gd).toString());
      if (
        lib.getFullYear() !== gy || lib.getMonth() + 1 !== gm || lib.getDate() !== gd ||
        rev !== `${ec[0]}-${ec[1]}-${ec[2]}`
      ) {
        bad += 1;
        note(`V3 EC ${ec} ⇆ GC ${gy}-${gm}-${gd}: toGC=${lib.toDateString()}, toEC=${rev}`);
      }
    }
  }
  report("V3 oracle 1583-2400", bad === 0, `${cases} days walked both directions vs JS Date, ${bad} mismatches`);
}

// ---------------------------------------------------------------- V4: validation
{
  const throws = (label: string, fn: (Z: any) => unknown, msg: string) => {
    for (const Z of [NewCjs, NewEsm]) {
      const out = capture(() => fn(Z));
      if (out !== `!${msg}`) {
        note(`V4 ${label}: expected throw ${JSON.stringify(msg)}, got ${JSON.stringify(out)}`);
        return false;
      }
    }
    return true;
  };
  const cases: [string, (Z: any) => unknown, string][] = [
    // Ethiopian side
    ["ጳጉሜን 6 non-leap (issue #41)", (Z) => Z.toGC(2000, 12, 6), "Invalid Ethiopian Date"],
    ["ጳጉሜን 7 leap", (Z) => Z.toGC(2003, 12, 7), "Invalid Ethiopian Date"],
    ["EC day 0", (Z) => Z.toGC(2009, 0, 0), "Invalid Ethiopian Date"],
    ["EC month -1", (Z) => Z.toGC(2009, -1, 10), "Invalid Ethiopian Date"],
    ["EC fractional", (Z) => Z.toGC(2009.5, 5, 5), "Invalid Ethiopian Date"],
    ["EC NaN", (Z) => Z.toGC(NaN, 5, 5), "Invalid Ethiopian Date"],
    // Gregorian side
    ["Feb 29 non-leap", (Z) => Z.toEC(2023, 1, 29), "Invalid Gregorian Date"],
    ["Apr 31", (Z) => Z.toEC(2023, 3, 31), "Invalid Gregorian Date"],
    ["GC day 0", (Z) => Z.toEC(2009, 0, 0), "Invalid Gregorian Date"],
    ["GC fractional", (Z) => Z.toEC(2017.5, 8, 2), "Invalid Gregorian Date"],
    ["GC NaN", (Z) => Z.toEC(NaN, 8, 2), "Invalid Gregorian Date"],
    ["pre-Amete-Mihret", (Z) => Z.toEC(7, 7, 28), "Invalid Gregorian Date"],
    // parse
    ["parse('')", (Z) => Z.parse(""), "ParsingError: Can't parse "],
    ["ctor NaN coercion", (Z) => new Z("abc", 1, 2), "Invalid Ethiopian Date"],
  ];
  let bad = 0;
  for (const [label, fn, msg] of cases) if (!throws(label, fn, msg)) bad += 1;
  report("V4 validation", bad === 0, `${cases.length} invalid-input classes all throw, ${bad} misses`);
}

// ---------------------------------------------------------------- V5: self-consistency
{
  let cases = 0;
  let bad = 0;
  for (let y = 1930; y <= 2090; y += 7) {
    for (let m = 0; m < 12; m += 1) {
      for (const d of [1, 17, 28]) {
        cases += 2;
        const viaCtor = capture(() => new NewCjs(new Date(y, m, d)).toString());
        const viaStatic = capture(() => NewCjs.toEC(new Date(y, m, d)).toString());
        if (viaCtor !== viaStatic) {
          bad += 1;
          note(`V5 ctor(Date(${y},${m},${d}))=${viaCtor} != toEC=${viaStatic}`);
        }
        const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const viaString = capture(() => NewCjs.toEC(iso).toString());
        const viaNumbers = capture(() => NewCjs.toEC(y, m, d).toString());
        if (viaString !== viaNumbers) {
          bad += 1;
          note(`V5 toEC('${iso}')=${viaString} != toEC(y,m,d)=${viaNumbers}`);
        }
      }
    }
  }
  report("V5 self-consistency", bad === 0,
    `${cases} cases in TZ=${Intl.DateTimeFormat().resolvedOptions().timeZone}, ${bad} mismatches`);
}

// ---------------------------------------------------------------- V6: package contract
{
  const packed = await $`npm pack --json --pack-destination ${tmp}`.cwd(root).quiet();
  const [info] = JSON.parse(packed.stdout.toString());
  const shipped = (info.files as { path: string }[]).map((f) => f.path).sort();
  const expected = [
    "LICENCE.md", "README.md",
    "dist/index.cjs", "dist/index.d.cts", "dist/index.d.mts", "dist/index.mjs",
    "package.json",
  ];
  let detail = `tarball has exactly: ${expected.join(", ")}`;
  let pass = JSON.stringify(shipped) === JSON.stringify(expected);
  if (!pass) detail = `unexpected tarball contents: ${shipped.join(", ")}`;

  if (pass) {
    const consumer = join(tmp, "consumer");
    await $`mkdir -p ${consumer}`;
    await Bun.write(join(consumer, "package.json"), JSON.stringify({ name: "consumer", private: true }));
    await $`bun add ${join(tmp, info.filename)}`.cwd(consumer).quiet();

    await $`node --input-type=module -e ${`
      import assert from 'node:assert';
      import { createRequire } from 'node:module';
      import Zemen from 'zemen';
      const required = createRequire(import.meta.url)('zemen');
      assert.strictEqual(typeof required, 'function');
      assert.strictEqual(required.name, 'Zemen');
      assert.strictEqual(required.default, undefined);
      assert.strictEqual(required.__esModule, undefined);
      assert.strictEqual(Zemen, required);
      assert.strictEqual(new Zemen(2009, 11, 27).format('MMM-DD-YYYY'), 'ነሐሴ-27-2009');
      assert.ok(required.toGC(new Zemen(2009, 11, 27)) instanceof Date);
    `}`.cwd(consumer).quiet();

    await Bun.write(join(consumer, "check.cts"),
      "import Zemen = require('zemen');\nconst z: Zemen = new Zemen(2009, 11, 27);\nconst d: Date = Zemen.toGC('2009-12-27');\nconst p: Zemen = Zemen.parse('2010-01-01');\nvoid [z.format('YYYY'), d, p, z.getMonthName()];\n");
    await Bun.write(join(consumer, "check.mts"),
      "import Zemen from 'zemen';\nconst z: Zemen = Zemen.toEC(new Date());\nvoid [z.toString(), z.getDayOfWeek(), z.getGCWeekDay()];\n");
    const tsc = join(root, "node_modules", ".bin", "tsc");
    await $`${tsc} --noEmit --strict --module nodenext --moduleResolution nodenext check.cts check.mts`.cwd(consumer).quiet();
    detail += "; require/import shape, identity and shipped types all check out";
  }
  report("V6 package contract", pass, detail);
}

// ---------------------------------------------------------------- summary
console.log("─".repeat(72));
if (firstDiff) console.log(`first mismatch: ${firstDiff}`);
console.log(failures === 0
  ? "ALL CHECKS PASSED — correct vs the oracle, parity preserved on the valid domain."
  : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
