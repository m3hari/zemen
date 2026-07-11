/**
 * Independent behavioral-parity verifier — `bun run verify`.
 *
 * Proves the rewrite is byte-identical to the published zemen@0.0.7 WITHOUT
 * trusting anything committed in this repo:
 *
 *   V1  oracle provenance    zemen@0.0.7 is downloaded fresh from the npm
 *                            registry at run time; every vendored baseline
 *                            file is sha256-compared against it.
 *   V2  fixture authenticity the committed golden fixtures are replayed
 *                            against the FRESH download — doctored fixtures
 *                            would fail here.
 *   V3  API surface          prototype + static member lists old vs new.
 *   V4  exhaustive sweep     every GC day and every EC day 1700→2300, both
 *                            directions, compared 3-way: fresh oracle vs
 *                            dist/index.cjs vs dist/index.mjs.
 *   V5  randomized fuzz      seeded PRNG (seed printed; override with
 *                            VERIFY_SEED=<n>) throws valid + garbage inputs
 *                            at every public entry point, old vs new.
 *                            Run-time randomness cannot be pre-gamed.
 *   V6  TZ/clock paths       native-Date-parsing and now() paths compared
 *                            relatively (old vs new in this same process/TZ).
 *
 * Exit code 0 = every check passed. Run it twice under different TZs
 * (e.g. TZ=UTC, TZ=America/New_York) for timezone robustness.
 */
import { $ } from "bun";
import { createRequire } from "node:module";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { replaySection, capture, type Fixture } from "../test/golden/replay";
import fixtures from "../test/golden/fixtures.json";

const root = join(import.meta.dir, "..");
const require = createRequire(import.meta.url);
const results: { check: string; pass: boolean; detail: string }[] = [];
let failures = 0;

function report(check: string, pass: boolean, detail: string) {
  results.push({ check, pass, detail });
  if (!pass) failures += 1;
  console.log(`${pass ? "PASS" : "FAIL"}  ${check.padEnd(24)} ${detail}`);
}

// ---------------------------------------------------------------- V1: fresh oracle
console.log("V1: downloading zemen@0.0.7 from the npm registry…");
const tmp = mkdtempSync(join(tmpdir(), "zemen-verify-"));
await $`npm pack zemen@0.0.7 --pack-destination ${tmp}`.quiet();
await $`tar -xzf ${join(tmp, "zemen-0.0.7.tgz")} -C ${tmp}`.quiet();
const freshPkg = join(tmp, "package");

const sha256 = async (path: string) =>
  new Bun.CryptoHasher("sha256").update(await Bun.file(path).arrayBuffer()).digest("hex");

{
  const runtimeFiles = ["zemen.js", "src/ conversion.js", "src/formating.js", "src/util.js", "src/zemen.js", "src/index.js"];
  let mismatched = "";
  for (const f of runtimeFiles) {
    const fresh = await sha256(join(freshPkg, f));
    const vendored = await sha256(join(root, "test/golden/baseline", f));
    if (fresh !== vendored) mismatched += ` ${f}`;
  }
  report("V1 oracle provenance", !mismatched,
    mismatched ? `vendored baseline differs from registry:${mismatched}`
               : `${runtimeFiles.length} baseline files match the registry tarball`);
}

// Load the three implementations.
const OldZemen = require(join(freshPkg, "zemen.js"));
await $`bun scripts/build.ts`.cwd(root).quiet();
const NewCjs = require(join(root, "dist/index.cjs"));
const NewEsm = (await import(join(root, "dist/index.mjs"))).default;

// ---------------------------------------------------------------- V2: fixtures vs fresh oracle
{
  let cases = 0;
  let bad = "";
  for (const [name, sec] of Object.entries(fixtures)) {
    if (!Array.isArray(sec)) continue;
    const r = replaySection(name, sec as Fixture[], OldZemen);
    cases += r.cases;
    if (r.mismatches) bad = r.firstMismatch;
  }
  report("V2 fixture authenticity", !bad, bad || `${cases} committed fixtures reproduce fresh-registry behavior`);
}

// ---------------------------------------------------------------- V3: API surface
{
  const members = (o: object) => Object.getOwnPropertyNames(o).sort().join(",");
  const oldSurface = `${members(OldZemen)}|${members(OldZemen.prototype)}`;
  const newSurface = `${members(NewCjs)}|${members(NewCjs.prototype)}`;
  report("V3 API surface", oldSurface === newSurface,
    oldSurface === newSurface ? `statics+prototype identical: ${members(OldZemen.prototype)}`
                              : `old=${oldSurface} new=${newSurface}`);
}

// ---------------------------------------------------------------- differential core
let firstDiff = "";
function diff3(label: string, run: (Z: any) => unknown): boolean {
  const expected = capture(() => run(OldZemen));
  for (const [name, Z] of [["cjs", NewCjs], ["esm", NewEsm]] as const) {
    const actual = capture(() => run(Z));
    if (actual !== expected) {
      if (!firstDiff) firstDiff = `${label} (${name}): old=${JSON.stringify(expected)} new=${JSON.stringify(actual)}`;
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------- V4: exhaustive sweep
{
  let cases = 0;
  let bad = 0;
  for (let y = 1700; y <= 2300; y++) {
    for (let m1 = 1; m1 <= 12; m1++) {
      const days = new Date(y, m1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        cases += 1;
        if (!diff3(`toEC(${y},${m1 - 1},${d})`, (Z) => Z.toEC(y, m1 - 1, d).toString())) bad += 1;
      }
    }
  }
  for (let y = 1700; y <= 2300; y++) {
    for (let m0 = 0; m0 <= 12; m0++) {
      for (let d = 1; d <= 30; d++) {
        cases += 1;
        if (!diff3(`toGC(${y},${m0},${d})`, (Z) => Z.toGC(y, m0, d).toDateString())) bad += 1;
      }
    }
  }
  report("V4 exhaustive 1700-2300", bad === 0, `${cases} conversions 3-way compared, ${bad} mismatches`);
}

// ---------------------------------------------------------------- V5: randomized fuzz
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
  console.log(`V5: fuzzing with seed ${seed} (reproduce/override with VERIFY_SEED=${seed})`);
  const tokens = ["Y", "M", "D", "d", "e", "E", "-", "/", " ", "ቀን", "፣", "ዓ", "x", "!", "2", ""];
  let cases = 0;
  let bad = 0;
  const N = 40000;
  for (let i = 0; i < N; i++) {
    const kind = ri(0, 6);
    let ok = true;
    if (kind === 0) {
      const [y, m, d] = [ri(-100, 6500), ri(-3, 15), ri(-3, 35)];
      ok = diff3(`fuzz toEC(${y},${m},${d})`, (Z) => Z.toEC(y, m, d).toString());
    } else if (kind === 1) {
      const [y, m, d] = [ri(-100, 6500), ri(-3, 15), ri(-3, 35)];
      ok = diff3(`fuzz toGC(${y},${m},${d})`, (Z) => Z.toGC(y, m, d).toDateString());
    } else if (kind === 2) {
      const [y, m, d] = [ri(1, 3000), ri(-2, 14), ri(-2, 32)];
      ok = diff3(`fuzz ctor(${y},${m},${d})`, (Z) => new Z(y, m, d).toString());
    } else if (kind === 3) {
      const [y, m, d] = [ri(1900, 2100), ri(0, 11), ri(1, 31)];
      // exercises the preserved Date-ctor off-by-one bug, incl. December throws
      ok = diff3(`fuzz ctor(Date(${y},${m},${d}))`, (Z) => new Z(new Date(y, m, d)).toString());
    } else if (kind === 4) {
      const [y, m, d] = [ri(1, 3000), ri(0, 12), ri(1, 30)];
      const pattern = Array.from({ length: ri(1, 14) }, () => pick(tokens)).join("");
      ok = diff3(`fuzz format(${y},${m},${d},${JSON.stringify(pattern)})`,
        (Z) => new Z(y, m, d).format(pattern));
    } else if (kind === 5) {
      const s = `${ri(-50, 3000)}-${ri(-5, 20)}-${ri(-40, 40)}`;
      ok = diff3(`fuzz parse(${JSON.stringify(s)})`, (Z) => String(Z.parse(s)));
    } else {
      const s = Array.from({ length: ri(0, 4) }, () => `${ri(-9, 3000)}`).join("-");
      ok = diff3(`fuzz ctor(${JSON.stringify(s)})`, (Z) => new Z(s).toString());
    }
    cases += 1;
    if (!ok) bad += 1;
  }
  report("V5 randomized fuzz", bad === 0, `${cases} random cases (seed ${seed}), ${bad} mismatches`);
}

// ---------------------------------------------------------------- V6: TZ/clock-dependent paths
{
  let bad = 0;
  let cases = 0;
  // native string parsing (Zemen.toEC(string) → new Date(string))
  for (let i = 0; i < 2000; i++) {
    const y = ri(1900, 2100);
    const s = pick([
      `${y}-${String(ri(1, 12)).padStart(2, "0")}-${String(ri(1, 28)).padStart(2, "0")}`,
      `${pick(["Jan", "Mar", "Sep", "Dec"])} ${ri(1, 28)}, ${y}`,
      `${y}/${ri(1, 12)}/${ri(1, 28)}`,
    ]);
    cases += 1;
    if (!diff3(`toEC(${JSON.stringify(s)})`, (Z) => Z.toEC(s).toString())) bad += 1;
    cases += 1;
    if (!diff3(`ctorDateFromParse(${JSON.stringify(s)})`, (Z) => Z.toEC(new Date(s)).toString())) bad += 1;
  }
  // today's date (no-arg constructor)
  cases += 1;
  if (!diff3("new Zemen()", (Z) => new Z().toString())) {
    // a midnight rollover between the two calls is the only benign cause; retry once
    firstDiff = "";
    if (!diff3("new Zemen() retry", (Z) => new Z().toString())) bad += 1;
  }
  report("V6 TZ/clock paths", bad === 0,
    `${cases} native-parse + now() cases compared in TZ=${Intl.DateTimeFormat().resolvedOptions().timeZone}, ${bad} mismatches`);
}

// ---------------------------------------------------------------- summary
console.log("─".repeat(72));
if (firstDiff) console.log(`first mismatch: ${firstDiff}`);
console.log(failures === 0
  ? "ALL CHECKS PASSED — the rewrite is behaviorally identical to the published zemen@0.0.7."
  : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
