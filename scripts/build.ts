/**
 * Builds the publishable dist/ — `bun scripts/build.ts`:
 *
 *   dist/index.cjs    CJS bundle — `module.exports = Zemen`, so require()
 *                     returns the class directly.
 *   dist/index.mjs    ESM entry — re-exports the CJS bundle so `import` and
 *                     `require` consumers share ONE class identity.
 *   dist/index.d.cts  types for require()  (export = Zemen)
 *   dist/index.d.mts  types for import     (export default Zemen)
 */
import { rm } from "node:fs/promises";
import { $ } from "bun";

const root = `${import.meta.dir}/..`;
const dist = `${root}/dist`;

/** The public type surface — deliberately authored, not generated. */
const DECLARATION = `declare class Zemen {
  constructor();
  constructor(val: string | Date);
  constructor(year: number | string, month: number | string, day: number | string);
  static toGC(val: string | Zemen): Date;
  static toGC(year: number, month: number, day: number): Date;
  static toEC(val: string | Date): Zemen;
  static toEC(year: number, month: number, day: number): Zemen;
  static parse(dateString: string, pattern?: string): Zemen;
  format(pattern?: string): string;
  toString(): string;
  getDate(): number;
  getMonth(): number;
  getFullYear(): number;
  getMonthName(): string;
  getShortMonthName(): string;
  getDayOfWeek(): string;
  getGCWeekDay(): number;
}
`;

await rm(dist, { recursive: true, force: true });
await $`bun build src/index.cts --format=cjs --target=node --outfile=dist/index.cjs`.cwd(root).quiet();
await Bun.write(`${dist}/index.mjs`, 'import Zemen from "./index.cjs";\n\nexport default Zemen;\n');
await Bun.write(`${dist}/index.d.cts`, `${DECLARATION}\nexport = Zemen;\n`);
await Bun.write(`${dist}/index.d.mts`, `${DECLARATION}\nexport default Zemen;\n`);

// Fail the build outright if the CJS export shape ever regresses.
const Zemen = (await import(`${dist}/index.cjs`)).default;
if (typeof Zemen !== "function" || Zemen.name !== "Zemen" || typeof Zemen.toEC !== "function") {
  throw new Error("dist/index.cjs does not export the Zemen class directly");
}
if ("default" in Zemen || "__esModule" in Zemen) {
  throw new Error("dist/index.cjs export carries unexpected interop properties");
}

for (const file of ["index.cjs", "index.mjs", "index.d.cts", "index.d.mts"]) {
  const bytes = new Uint8Array(await Bun.file(`${dist}/${file}`).arrayBuffer());
  const gz = Bun.gzipSync(bytes).byteLength;
  console.log(`dist/${file.padEnd(11)} ${String(bytes.byteLength).padStart(6)} B  (${gz} B gzipped)`);
}
