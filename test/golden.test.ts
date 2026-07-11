/**
 * Golden-master parity replay.
 *
 * Replays every fixture in test/golden/fixtures.json (generated from the
 * published zemen@0.0.7 tarball by scripts/generate-golden.ts) against the
 * current implementation and requires byte-exact equality — outputs and
 * thrown error messages alike. This suite is the no-breaking-changes gate
 * and stays in CI permanently.
 *
 * Independent reviewers: `bun run verify` replays these same fixtures
 * against a FRESH download of zemen@0.0.7 from the registry, plus runs
 * exhaustive and randomized old-vs-new differential checks. See
 * VERIFICATION.md.
 */
import { describe, expect, it } from "bun:test";
import { Zemen } from "./_lib";
import fixtures from "./golden/fixtures.json";
import { replaySection, type Fixture } from "./golden/replay";

const sections: Record<string, Fixture[]> = {
  toEC: fixtures.toEC,
  toGC: fixtures.toGC,
  format: fixtures.format,
  ctor: fixtures.ctor,
  parse: fixtures.parse,
  getters: fixtures.getters,
  misc: fixtures.misc,
};

describe("golden-master parity with published zemen@0.0.7", () => {
  for (const [name, sectionFixtures] of Object.entries(sections)) {
    it(`${name} — ${sectionFixtures.length} cases`, () => {
      const result = replaySection(name, sectionFixtures, Zemen);
      expect(result.mismatches, result.firstMismatch).toBe(0);
    });
  }
});
