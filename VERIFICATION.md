# How to verify this rewrite changes nothing

The claim: **zemen 0.0.8 is a full internal rewrite (TypeScript, Bun toolchain, dual ESM/CJS) with byte-identical observable behavior to the published zemen@0.0.7.**

You should not have to take that on trust. The checks below are designed so that
nothing committed in this repo — fixtures, baselines, tests — has to be
believed: the reference implementation is downloaded from the npm registry at
verification time, and the fuzz inputs are generated at verification time from
a seed you can choose yourself.

## The 5-minute version

```bash
git checkout revamp/0.0.8
bun install

bun run verify                       # the independent proof (details below)
TZ=America/New_York bun run verify   # again under a negative-UTC-offset TZ
VERIFY_SEED=12345 bun run verify     # pick your own fuzz seed

bun test                             # 125 tests: ported suite + canonical academic
                                     # table + 87,601 golden replays + packaging gate
bun run typecheck                    # strict tsc over src, tests, scripts
```

`bun run verify` must end with `ALL CHECKS PASSED` and exit 0.

## What `bun run verify` proves, and why it can't be gamed

| Check | What it does | Why it's trustworthy |
|---|---|---|
| **V1 oracle provenance** | Downloads `zemen@0.0.7` from the npm registry *right now*, sha256-compares every vendored baseline file against it | The reference behavior comes from npm, not from this repo. npm itself verifies the tarball against the registry's `dist.integrity`. |
| **V2 fixture authenticity** | Replays all 87,601 committed golden fixtures against that fresh download | If the committed fixtures had been doctored to match the new code instead of the old, this fails. |
| **V3 API surface** | Compares the full static + prototype member lists, old vs new | No method silently added, removed, or renamed. |
| **V4 exhaustive sweep** | Every Gregorian day and every Ethiopian day from 1700 to 2300 — about 454,000 conversions — compared three ways: fresh oracle vs `dist/index.cjs` vs `dist/index.mjs` | Not a sample: *every* date in the six-century window around today, against both shipped artifacts. |
| **V5 randomized fuzz** | 40,000 seeded-random calls across every public entry point — valid dates, garbage, wrong arities, `Date` objects (including the preserved December bug), random format patterns, parse strings — old vs new | Inputs are generated at run time from a printed seed (`VERIFY_SEED` to override), so no pre-committed artifact can anticipate them. Error messages are compared byte-for-byte. |
| **V6 TZ/clock paths** | The timezone-dependent paths (`toEC(string)` native parsing, `new Zemen()`/today) compared old-vs-new in the same process and TZ | These can't be pinned as absolute fixtures; relative comparison in *your* TZ is the honest check. Run under multiple TZs. |

## What to eyeball by hand

1. **The rewrite diff, side by side** — the whole point of the commit layout:
   ```bash
   git log --oneline master..revamp/0.0.8
   git show <rewrite-commit>            # old .js deleted, new .ts added, tests untouched
   ```
2. **The canonical academic test data is verbatim** (Appleyard & Girma Selasse
   1979 + Calendrica). Only the two harness lines at the top changed:
   ```bash
   git log --follow -p -- test/conversion.test.ts   # renamed from .js, data intact
   ```
3. **The npm tarball is lean and correct:**
   ```bash
   bun run build && npm pack --dry-run
   # dist/ (4 files) + README.md + LICENCE.md + package.json — nothing else
   ```
4. **The published-package contract** (what real consumers see) is asserted by
   `test/packaging.test.ts`: it packs the real tarball, installs it in a temp
   project, and checks from Node subprocesses that `require('zemen')` *is* the
   class (no `.default`, no `__esModule`), that `import Zemen from 'zemen'`
   yields the *same* class identity, and that the shipped `.d.cts`/`.d.mts`
   compile under `tsc --strict` for both CJS-TS and ESM-TS consumers.

## Known preserved quirks

Anything that looked like a bug was **preserved, not fixed** — see
`POTENTIAL-IMPROVEMENTS.md` for the catalog (with repro snippets), headlined by
the `new Zemen(dateObject)` off-by-one-month bug. Fixes are deferred to a
follow-up branch on top of this one, per maintainer decision.
