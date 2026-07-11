/**
 * Dual-package contract test — the release gate.
 *
 * Builds dist/, packs the real npm tarball, installs it into a temp consumer
 * project, and asserts what actual consumers see:
 *
 *   - `require('zemen')` returns the Zemen class directly (no .default, no
 *     __esModule) — the export shape of every release since 0.0.1.
 *   - `import Zemen from 'zemen'` in Node ESM returns the class.
 *   - Both module systems share ONE class identity (import === require).
 *   - The shipped .d.cts / .d.mts type-check under tsc for both a CJS-TS and
 *     an ESM-TS consumer.
 *   - The tarball contains only the lean file set.
 */
import { beforeAll, describe, expect, it } from "bun:test";
import { $ } from "bun";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const tsc = join(root, "node_modules", ".bin", "tsc");
let consumer: string;

beforeAll(async () => {
  const tmp = mkdtempSync(join(tmpdir(), "zemen-pack-"));
  await $`bun scripts/build.ts`.cwd(root).quiet();
  const packed = await $`npm pack --json --pack-destination ${tmp}`.cwd(root).quiet();
  const [info] = JSON.parse(packed.stdout.toString());

  const shipped = (info.files as { path: string }[]).map((f) => f.path).sort();
  expect(shipped).toEqual([
    "LICENCE.md",
    "README.md",
    "dist/index.cjs",
    "dist/index.d.cts",
    "dist/index.d.mts",
    "dist/index.mjs",
    "package.json",
  ]);

  consumer = join(tmp, "consumer");
  await $`mkdir -p ${consumer}`;
  await Bun.write(join(consumer, "package.json"), JSON.stringify({ name: "consumer", private: true }));
  await $`bun add ${join(tmp, info.filename)}`.cwd(consumer).quiet();
}, 30000);

describe("published package contract", () => {
  it("require('zemen') returns the class directly, with no interop props", async () => {
    const out = await $`node -e ${`
      const assert = require('node:assert');
      const Zemen = require('zemen');
      assert.strictEqual(typeof Zemen, 'function');
      assert.strictEqual(Zemen.name, 'Zemen');
      assert.strictEqual(Zemen.default, undefined);
      assert.strictEqual(Zemen.__esModule, undefined);
      const z = new Zemen(2009, 11, 27);
      assert.strictEqual(z.toString(), '2009-12-27');
      assert.strictEqual(Zemen.toGC(2009, 11, 27).toDateString(), 'Sat Sep 02 2017');
      assert.strictEqual(z.format('MMM-DD-YYYY'), 'ነሐሴ-27-2009');
      console.log('ok');
    `}`.cwd(consumer).quiet();
    expect(out.stdout.toString().trim()).toBe("ok");
  });

  it("import Zemen from 'zemen' (Node ESM) returns the same class identity", async () => {
    const out = await $`node --input-type=module -e ${`
      import assert from 'node:assert';
      import { createRequire } from 'node:module';
      import Zemen from 'zemen';
      assert.strictEqual(typeof Zemen, 'function');
      assert.strictEqual(new Zemen(2009, 11, 27).toString(), '2009-12-27');
      const required = createRequire(import.meta.url)('zemen');
      assert.strictEqual(Zemen, required); // no dual-package hazard
      assert.ok(required.toGC(new Zemen(2009, 11, 27)) instanceof Date);
      console.log('ok');
    `}`.cwd(consumer).quiet();
    expect(out.stdout.toString().trim()).toBe("ok");
  });

  it("shipped types compile for a CommonJS TypeScript consumer", async () => {
    await Bun.write(
      join(consumer, "check-cjs.cts"),
      `import Zemen = require('zemen');
       const z: Zemen = new Zemen(2009, 11, 27);
       const gc: Date = Zemen.toGC('2009-12-27');
       const ec: Zemen = Zemen.toEC(new Date());
       const s: string = z.format('MMM-DD-YYYY');
       const p: Zemen = Zemen.parse('2010-01-01');
       void [gc, ec, s, p, z.getMonthName(), z.getGCWeekDay()];
      `,
    );
    await $`${tsc} --noEmit --strict --module nodenext --moduleResolution nodenext check-cjs.cts`.cwd(consumer).quiet();
  });

  it("shipped types compile for an ESM TypeScript consumer", async () => {
    await Bun.write(
      join(consumer, "check-esm.mts"),
      `import Zemen from 'zemen';
       const z: Zemen = new Zemen('2009-12-27');
       const gc: Date = Zemen.toGC(z);
       const ec: Zemen = Zemen.toEC(2017, 8, 2);
       void [gc, ec, z.toString(), z.getDayOfWeek()];
      `,
    );
    await $`${tsc} --noEmit --strict --module nodenext --moduleResolution nodenext check-esm.mts`.cwd(consumer).quiet();
  });
});
