# Potential improvements (deliberately NOT in 0.0.8)

0.0.8 is a stabilization release: byte-identical behavior to 0.0.7, locked by
the golden-master suite. Everything below is observable behavior a consumer
could depend on, so none of it was changed. Each item is a candidate for a
future 0.1.0 — fixing any of them is a breaking change and must be released
and documented as such.

Maintainer decision (2026-07): keep all quirks in 0.0.8; fix on a follow-up
branch on top of this one.

## Q1 — `new Zemen(dateObject)` is one month off ⚠ (the headliner)

The constructor passes a 1-based month into 3-arg `toEC`, which adds `+1`
again. Results are one month ahead — and December dates throw.

```js
new Zemen(new Date(2017, 8, 2)).toString();   // '2010-1-22'  (should be '2009-12-27')
Zemen.toEC(new Date(2017, 8, 2)).toString();  // '2009-12-27' (the static form is correct)
new Zemen(new Date(2023, 11, 25));            // throws 'Invalid Gregorian Date'
```

Fix: drop the `+ 1` in the constructor's `Date` branch (`src/zemen.ts`).
The golden fixtures pinning this behavior (`ctor` section, `Date(...)` keys)
would need regenerating.

## Q2 — `Zemen.parse()` returns `""` for falsy input

A string, not a `Zemen`, not an error. `new Zemen("")` consequently dies with
a `TypeError` instead of `'Invalid Argument Exception'`.

## Q3 — `Zemen.parse(str, pattern)` always throws

Any second argument yields `'Not implemented Exception :('`. Either implement
pattern parsing or drop the parameter.

## Q4 — format token repetition artifacts

```js
z.format('YYY');    // '092009'    (YY then Y)
z.format('YYYYY');  // '20092009'  (YYYY then Y)
z.format('MMMMM');  // 'ነሐሴ12'     (MMMM then M)
z.format('DDDDD');  // 'ቅዳሜ27'     (DDD then DD → weekday + padded day)
```

## Q5 — `toGC` maps Gregorian years 0–99 to 1900–1999

`new Date(year, …)` semantics. `Zemen.toGC(1, 0, 1)` → year 1908, not year 8.
The underlying conversion math is correct; only the `Date` wrapper is lossy.
Fix: `setFullYear` after construction.

## Q6 — `Zemen.toEC(string)` is timezone-dependent

Native `new Date(string)` parses ISO date-only strings as UTC midnight, so in
negative-UTC-offset timezones the result is the previous day. Fix: parse
`y-m-d` explicitly.

## Q7 — the era error message is truncated

`new Error("Unknown Era:", era)` — `Error` ignores the second argument, so the
message is just `"Unknown Era:"`.

## Q8 — validation accepts day 0 and month 0

Conversion-layer bounds are `d ∈ [0,30]` / `m ∈ [0,13]` (EC, 1-based month) and
`d ∈ [0,31]` / `m ∈ [0,12]` (GC): `d = 0` and `m = 0` pass validation and produce
arithmetic spillover dates. Likewise ጳጉሜን accepts days 7–30. Public-API month
`-1` therefore also passes.

## Q9 — `NaN` inputs flow through silently

`new Zemen('abc', 1, 1).toString()` → `'NaN-2-1'`. Validation compares with
`<`/`>`, which are always false for `NaN`.

## Q10 — misc

- `toString()`/default `format()` don't zero-pad (`'2009-1-5'`), while
  `format('YYYY-MM-DD')` does. Intentional but occasionally surprising.
- Instance fields `year`, `month`, `date`, `gc` are reachable and mutable;
  mutating them desyncs `gc` (weekday queries go stale).
- The repo previously committed a UMD bundle (`dist/zemen.min.js`) used only by
  the GitHub Pages playground; it was never published to npm and is now gone.
  Anyone hot-linking the raw GitHub file should switch to
  `https://esm.sh/zemen` or a bundler.
- Deep imports (`require('zemen/src/zemen')`) were never documented and are
  closed off by the `exports` map as of 0.0.8 (maintainer-confirmed
  non-contract).
