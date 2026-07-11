# Changelog

## 1.0.0

Frozen, minimal public API. No conversion behavior changes — every change is
a rename, a removal, or a hide.

### Breaking

| 0.0.x | 1.0.0 |
|-------|-------|
| `Zemen.toEC(x)` / `Zemen.toEC(y, m, d)` | `Zemen.fromGregorian(x)` / `Zemen.fromGregorian(y, m, d)` |
| `Zemen.toGC(zemenInstance)` | `zemenInstance.toGregorian()` |
| `Zemen.toGC('2009-12-27')` | `new Zemen('2009-12-27').toGregorian()` |
| `Zemen.toGC(2009, 11, 27)` | `new Zemen(2009, 11, 27).toGregorian()` |
| `Zemen.parse('2009-12-27')` | `new Zemen('2009-12-27')` |
| `new Zemen(dateObject)` | `Zemen.fromGregorian(dateObject)` |
| `z.getGCWeekDay()` | `z.getDay()` |
| `z.getShortMonthName()` | `z.getMonthName().slice(0, 3)` or `format('MMM')` |
| `z.year` / `z.month` / `z.date` / `z.gc` | `z.getFullYear()` / `z.getMonth()` / `z.getDate()` / `z.toGregorian()` |

Instances are now immutable (private fields). `toGregorian()` returns a fresh
`Date` on every call.

### Added

- ESM named export: `import { Zemen } from 'zemen'`.

## 0.0.9

Twelve bug fixes; no API changes. Highlights:

- `toGC` returned the wrong month for the 1st of Feb–Nov in non-leap century
  years (1800/1900/2100/2200), and Dec 31 of years divisible by 400
  (1600/2400) came back as Jan 1 of the next year.
- Strict validation: nonexistent ጳጉሜን days (#41), nonexistent Gregorian days
  (Feb 29 in non-leap years), day/month 0, negative months, `NaN` and
  fractional inputs, and pre-8 AD Gregorian dates now throw.
- `new Zemen(dateObject)` no longer runs one month ahead (December used to throw).
- `toGC` no longer maps Gregorian years 0–99 into the 1900s.
- Date-only ISO strings convert timezone-stably.
- `Zemen.parse('')` throws `ParsingError` instead of returning `''`.

## 0.0.8

Internal rewrite: TypeScript source, Bun-native toolchain, dual ESM + CJS
build with bundled types, lean 7-file tarball. Behavior byte-identical
to 0.0.7.

## 0.0.7 and earlier

See git history.
