# Maintainer notes

Internal notes — not shipped to npm, not part of the public README.

## Behavioral compatibility

0.0.8 is a full internal rewrite (TypeScript, Bun toolchain, dual ESM + CJS
build) with byte-identical observable behavior to the published 0.0.7.
To reproduce the proof:

```bash
bun run verify   # downloads zemen@0.0.7 fresh from npm and diffs it against
                 # this build: ~450k exhaustive conversions (1700–2300), 40k
                 # seeded-random fuzz cases (VERIFY_SEED=<n> to pick your own),
                 # API surface incl. Function#length, TZ paths, and the
                 # packaged-tarball contract
```

Run it under more than one timezone (`TZ=UTC`, `TZ=America/New_York`) — CI does.

## Known quirks (contract — do not fix in a patch release)

These shipped in every 0.0.x release, so consumers may depend on them.
Fixing any of them is a breaking change reserved for 0.1.0, on its own
branch, with the change called out in release notes:

1. **`new Zemen(dateObject)` is one month off** and throws for December dates —
   the constructor double-increments the month before handing it to `toEC`.
   `Zemen.toEC(dateObject)` is the correct path. *The #1 candidate fix.*
2. `Zemen.parse()` with falsy input returns `''` — a string, not a `Zemen`,
   not an error. Consequently `new Zemen('')` dies with a `TypeError`.
3. `Zemen.parse(str, pattern)` always throws `'Not implemented Exception :('` —
   pattern parsing was never implemented.
4. `Zemen.toEC('2017-09-02')` uses native `Date` string parsing: ISO date-only
   strings resolve at UTC midnight, so results shift a day in negative-UTC
   timezones.
5. `toGC` returns `new Date(y, m, d)`, which maps Gregorian years 0–99 into
   1900–1999.
6. Repeated format tokens concatenate greedily: `'YYY'` → `'092009'`,
   `'YYYYY'` → `'20092009'`, `'MMMMM'` → `'ነሐሴ12'`, `'DDDDD'` → `'ቅዳሜ27'`.
7. Validation accepts day 0, month 0, public month −1, and ጳጉሜን days 7–30
   (dates spill arithmetically into the next period); `NaN` inputs flow
   through unchecked (`new Zemen('abc', 1, 2)` → `'NaN-2-2'`).
8. Error messages are contract text, including `'Not implemented Exception :('`
   and the truncated `'Unknown Era:'`.
9. Instance fields (`year`, `month`, `date`, `gc`) are reachable at runtime;
   mutating them desyncs the cached Gregorian date behind weekday queries.

All of the above are pinned by the test suite (`known quirks` blocks) and by
`bun run verify`.

## Releasing

Publishing is manual: run the CI workflow via *Run workflow* (needs the
`NPM_TOKEN` secret; publishes with `--provenance`), or `npm publish` locally —
`prepublishOnly` runs typecheck + tests + build.
