/**
 * Builds the publishable dist/:
 *
 *   dist/index.cjs    CJS bundle — `module.exports = Zemen`, the exact export
 *                     shape of every release since 0.0.1.
 *   dist/index.mjs    ESM entry — a thin wrapper re-exporting the CJS bundle,
 *                     so `import` and `require` consumers share ONE class
 *                     identity (no dual-package hazard; `val instanceof Zemen`
 *                     inside toGC keeps working across module systems).
 *   dist/index.d.cts  types for require()  (export = Zemen)
 *   dist/index.d.mts  types for import     (export default Zemen)
 *
 * Usage: bun scripts/build.ts
 */
import { rm } from "node:fs/promises";
import { $ } from "bun";

const root = `${import.meta.dir}/..`;
const dist = `${root}/dist`;

await rm(dist, { recursive: true, force: true });

await $`bun build src/index.cts --format=cjs --target=node --outfile=dist/index.cjs`.cwd(root).quiet();

await Bun.write(
  `${dist}/index.mjs`,
  'import Zemen from "./index.cjs";\n\nexport default Zemen;\n',
);
await Bun.write(`${dist}/index.d.cts`, Bun.file(`${root}/types/index.d.cts`));
await Bun.write(`${dist}/index.d.mts`, Bun.file(`${root}/types/index.d.mts`));

// Fail the build outright if the CJS export shape ever regresses.
const Zemen = (await import(`${dist}/index.cjs`)).default;
if (typeof Zemen !== "function" || Zemen.name !== "Zemen" || typeof Zemen.toEC !== "function") {
  throw new Error("dist/index.cjs does not export the Zemen class directly");
}
if ("default" in Zemen || "__esModule" in Zemen) {
  throw new Error("dist/index.cjs export carries unexpected interop properties");
}

for (const file of ["index.cjs", "index.mjs", "index.d.cts", "index.d.mts"]) {
  const buf = await Bun.file(`${dist}/${file}`).arrayBuffer();
  const gz = Bun.gzipSync(new Uint8Array(buf)).byteLength;
  console.log(`dist/${file.padEnd(11)} ${String(buf.byteLength).padStart(6)} B  (${gz} B gzipped)`);
}
