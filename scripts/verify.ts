/**
 * Independent behavioral-parity verifier — `bun run verify`.
 *
 * Proves the rewrite is byte-identical to the published zemen@0.0.7 without
 * trusting anything committed in this repo: the reference implementation is
 * downloaded fresh from the npm registry at run time, and the fuzz inputs are
 * generated at run time from a seed you can choose (VERIFY_SEED=<n>).
 *
 *   V1  API surface       static + prototype members and Function#length
 *   V2  exhaustive sweep  every GC and EC day 1700→2300 (~450k conversions),
 *                         3-way: fresh oracle vs dist/index.cjs vs index.mjs
 *   V3  randomized fuzz   40k seeded-random calls across every entry point —
 *                         valid dates, garbage, wrong arities, Date objects,
 *                         random format patterns — outputs and thrown error
 *                         messages compared byte-for-byte
 *   V4  TZ/clock paths    native-Date-parsing and now() paths, compared
 *                         relatively in this process/TZ (run under several TZs)
 *   V5  package contract  packs the real tarball, installs it in a temp
 *                         consumer: require() returns the class itself,
 *                         import === require (one identity), shipped types
 *                         compile under tsc --strict, tarball file list exact
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

/** Stringify a result or a throw. Explicit `Error`s pin the exact message;
 * incidental engine errors (e.g. TypeError) pin only the class name. */
function capture(fn: () => unknown): string {
  try {
    return String(fn());
  } catch (err) {
    const e = err as Error;
    return e.constructor === Error ? `!${e.message}` : `!!${e.constructor.name}`;
  }
}

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

// ---------------------------------------------------------------- differential core
function same(label: string, run: (Z: any) => unknown): boolean {
  const expected = capture(() => run(OldZemen));
  for (const [name, Z] of [["cjs", NewCjs], ["esm", NewEsm]] as const) {
    if (capture(() => run(Z)) !== expected) {
      if (!firstDiff) {
        firstDiff = `${label} (${name}): old=${JSON.stringify(expected)} new=${JSON.stringify(capture(() => run(Z)))}`;
      }
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------- V2: exhaustive sweep
{
  let cases = 0;
  let bad = 0;
  for (let y = 1700; y <= 2300; y++) {
    for (let m = 0; m < 12; m++) {
      const days = new Date(y, m + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        cases += 1;
        if (!same(`toEC(${y},${m},${d})`, (Z) => Z.toEC(y, m, d).toString())) bad += 1;
      }
    }
    for (let m = 0; m <= 12; m++) {
      for (let d = 1; d <= 30; d++) {
        cases += 1;
        if (!same(`toGC(${y},${m},${d})`, (Z) => Z.toGC(y, m, d).toDateString())) bad += 1;
      }
    }
  }
  report("V2 exhaustive 1700-2300", bad === 0, `${cases} conversions 3-way compared, ${bad} mismatches`);
}

// ---------------------------------------------------------------- V3: randomized fuzz
const seed = Number(process.env.VERIFY_SEED ?? Date.now() % 2147483647);
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(seed);
const ri = (lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)]!;

{
  console.log(`fuzzing with seed ${seed} (override with VERIFY_SEED=<n>)`);
  const tokens = ["Y", "M", "D", "d", "e", "E", "-", "/", " ", "ቀን", "፣", "ዓ", "x", "!", "2"];
  let bad = 0;
  const N = 40000;
  for (let i = 0; i < N; i++) {
    const ok = [
      () => {
        const [y, m, d] = [ri(-100, 6500), ri(-3, 15), ri(-3, 35)];
        return same(`toEC(${y},${m},${d})`, (Z) => Z.toEC(y, m, d).toString());
      },
      () => {
        const [y, m, d] = [ri(-100, 6500), ri(-3, 15), ri(-3, 35)];
        return same(`toGC(${y},${m},${d})`, (Z) => Z.toGC(y, m, d).toDateString());
      },
      () => {
        const [y, m, d] = [ri(1, 3000), ri(-2, 14), ri(-2, 32)];
        return same(`ctor(${y},${m},${d})`, (Z) => new Z(y, m, d).toString());
      },
      () => {
        // exercises the preserved Date-ctor off-by-one bug, incl. December throws
        const [y, m, d] = [ri(1900, 2100), ri(0, 11), ri(1, 31)];
        return same(`ctor(Date(${y},${m},${d}))`, (Z) => new Z(new Date(y, m, d)).toString());
      },
      () => {
        const [y, m, d] = [ri(1, 3000), ri(0, 12), ri(1, 30)];
        const p = Array.from({ length: ri(1, 14) }, () => pick(tokens)).join("");
        return same(`format(${y},${m},${d},${JSON.stringify(p)})`, (Z) => new Z(y, m, d).format(p));
      },
      () => {
        const s = Array.from({ length: ri(0, 4) }, () => `${ri(-9, 3000)}`).join("-");
        return same(`parse(${JSON.stringify(s)})`, (Z) => String(Z.parse(s)));
      },
    ][i % 6]!();
    if (!ok) bad += 1;
  }
  report("V3 randomized fuzz", bad === 0, `${N} random cases (seed ${seed}), ${bad} mismatches`);
}

// ---------------------------------------------------------------- V4: TZ/clock paths
{
  let cases = 0;
  let bad = 0;
  for (let i = 0; i < 2000; i++) {
    const y = ri(1900, 2100);
    const s = pick([
      `${y}-${String(ri(1, 12)).padStart(2, "0")}-${String(ri(1, 28)).padStart(2, "0")}`,
      `${pick(["Jan", "Mar", "Sep", "Dec"])} ${ri(1, 28)}, ${y}`,
      `${y}/${ri(1, 12)}/${ri(1, 28)}`,
    ]);
    cases += 2;
    if (!same(`toEC(${JSON.stringify(s)})`, (Z) => Z.toEC(s).toString())) bad += 1;
    if (!same(`toEC(Date(${JSON.stringify(s)}))`, (Z) => Z.toEC(new Date(s)).toString())) bad += 1;
  }
  cases += 1;
  if (!same("new Zemen()", (Z) => new Z().toString())) {
    firstDiff = ""; // benign only if midnight rolled over between calls — retry once
    if (!same("new Zemen() retry", (Z) => new Z().toString())) bad += 1;
  }
  report("V4 TZ/clock paths", bad === 0,
    `${cases} cases in TZ=${Intl.DateTimeFormat().resolvedOptions().timeZone}, ${bad} mismatches`);
}

// ---------------------------------------------------------------- V5: package contract
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

    // require() returns the class itself; import gives the SAME identity.
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

    // shipped declarations compile for both CJS-TS and ESM-TS consumers
    await Bun.write(join(consumer, "check.cts"),
      "import Zemen = require('zemen');\nconst z: Zemen = new Zemen(2009, 11, 27);\nconst d: Date = Zemen.toGC('2009-12-27');\nconst p: Zemen = Zemen.parse('2010-01-01');\nvoid [z.format('YYYY'), d, p, z.getMonthName()];\n");
    await Bun.write(join(consumer, "check.mts"),
      "import Zemen from 'zemen';\nconst z: Zemen = Zemen.toEC(new Date());\nvoid [z.toString(), z.getDayOfWeek(), z.getGCWeekDay()];\n");
    const tsc = join(root, "node_modules", ".bin", "tsc");
    await $`${tsc} --noEmit --strict --module nodenext --moduleResolution nodenext check.cts check.mts`.cwd(consumer).quiet();
    detail += "; require/import shape, identity and shipped types all check out";
  }
  report("V5 package contract", pass, detail);
}

// ---------------------------------------------------------------- summary
console.log("─".repeat(72));
if (firstDiff) console.log(`first mismatch: ${firstDiff}`);
console.log(failures === 0
  ? "ALL CHECKS PASSED — behaviorally identical to the published zemen@0.0.7."
  : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
