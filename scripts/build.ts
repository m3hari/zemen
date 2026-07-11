/**
 * Builds the publishable dist/ — `bun scripts/build.ts`:
 *
 *   dist/index.cjs    CJS bundle — `module.exports = Zemen`, the exact export
 *                     shape of every release since 0.0.1.
 *   dist/index.mjs    ESM entry — re-exports the CJS bundle so `import` and
 *                     `require` consumers share ONE class identity.
 *   dist/index.d.cts  types for require()  (export = Zemen)
 *   dist/index.d.mts  types for import     (export default Zemen)
 */
import { rm } from "node:fs/promises";
import { $ } from "bun";

const root = `${import.meta.dir}/..`;
const dist = `${root}/dist`;

/** The public type surface — deliberately authored, not generated: this is
 * the 0.0.7 contract (plus `parse`, which always existed at runtime). */
const DECLARATION = `type ZemenDateValue = string | number | Date | Zemen;

declare class Zemen {
  constructor(val?: ZemenDateValue, month?: number, day?: number);
  static toGC(val: ZemenDateValue, month?: number, day?: number): Date;
  static toEC(val: ZemenDateValue, month?: number, day?: number): Zemen;
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
