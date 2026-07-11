# Zemen · ዘመን

> Ethiopian ⇆ Gregorian calendar conversion & formatting — zero dependencies, types included.
> የኢትዮጵያ እና የግሪጎሪያን ቀን መቀያየሪያ እና መቅረጫ ላይብረሪ።

[![npm version](https://img.shields.io/npm/v/zemen)](https://www.npmjs.com/package/zemen)
[![npm downloads](https://img.shields.io/npm/dm/zemen)](https://www.npmjs.com/package/zemen)
[![CI](https://github.com/m3hari/zemen/actions/workflows/ci.yml/badge.svg)](https://github.com/m3hari/zemen/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/zemen)](https://bundlephobia.com/package/zemen)
[![license](https://img.shields.io/npm/l/zemen)](LICENCE.md)
[![types included](https://img.shields.io/badge/TypeScript-types%20included-3178c6)](#typescript)

The Ethiopian calendar has **13 months** — twelve of 30 days plus ጳጉሜን, a
short month of 5 or 6 days — and runs 7–8 years behind the Gregorian year.
**Zemen** converts dates between the two calendars and formats Ethiopian
dates with Amharic month and weekday names. ~2 KB gzipped, no dependencies,
works everywhere (`import`, `require`, browsers via CDN).

Conversion uses the [Beyene–Kudlek](http://www.geez.org/Calendars/) Julian
Day Number algorithm, validated against canonical scholarly test data
(Appleyard & Girma Selasse, Oxford, 1979; Calendrica).

▶ **[Try it live in the playground](https://m3hari.github.io/zemen/)**

## Install

```bash
npm i zemen
# or
bun add zemen
```

## Quick start

```js
// ESM
import Zemen from 'zemen';

// CommonJS
const Zemen = require('zemen');

const zare = new Zemen();                    // today, in the Ethiopian calendar
zare.toString();                             // '2018-11-4'
zare.format('MMMM DD ቀን YYYY E');            // 'ሐምሌ 04 ቀን 2018 ዓ.ም'

Zemen.toEC('2017-09-02').toString();         // '2009-12-27'  Gregorian → Ethiopian
Zemen.toGC('2009-12-27').toDateString();     // 'Sat Sep 02 2017'  Ethiopian → Gregorian
```

## A worked example

```js
import Zemen from 'zemen';

// What is today in the Ethiopian calendar?
const today = new Zemen();
today.format('d ፣ MMMM DD ቀን YYYY E');       // 'ቅዳሜ ፣ ሐምሌ 04 ቀን 2018 ዓ.ም'

// Round-trip: Gregorian → Ethiopian → Gregorian
const ec = Zemen.toEC(2017, 8, 2);           // Sep 2 2017 (0-based GC month!)
ec.toString();                               // '2009-12-27'
ec.getMonthName();                           // 'ነሐሴ'
ec.getDayOfWeek();                           // 'ቅዳሜ'
Zemen.toGC(ec).toDateString();               // 'Sat Sep 02 2017'

// The 13th month, ጳጉሜን:
new Zemen(2011, 12, 5).format('MMMM D YYYY');// 'ጳጉሜን 5 2011'
```

## API

**Months are 0-based everywhere** (0 = መስከረም … 12 = ጳጉሜን on the Ethiopian side;
0 = January … 11 = December on the Gregorian side), matching `Date#getMonth`.

| Member | Returns | Description |
|---|---|---|
| `new Zemen()` | `Zemen` | today's date in the Ethiopian calendar |
| `new Zemen('2009-12-27')` | `Zemen` | from an Ethiopian `y-m-d` date string |
| `new Zemen(2009, 11, 27)` | `Zemen` | from Ethiopian year, month (0-based), day |
| `Zemen.toEC(val)` | `Zemen` | Gregorian → Ethiopian; `val` is a date string, a `Date`, or `(y, m, d)` numbers |
| `Zemen.toGC(val)` | `Date` | Ethiopian → Gregorian; `val` is a date string, a `Zemen`, or `(y, m, d)` numbers |
| `Zemen.parse(str)` | `Zemen` | parse an Ethiopian `y-m-d` string |
| `.format(pattern?)` | `string` | format with the tokens below; no pattern → `y-m-d` |
| `.toString()` | `string` | `y-m-d` (month shown 1-based) |
| `.getFullYear()` / `.getMonth()` / `.getDate()` | `number` | Ethiopian year / month (0-based) / day |
| `.getMonthName()` / `.getShortMonthName()` | `string` | month name in Amharic (`ነሐሴ` / `ነሐሴ`) |
| `.getDayOfWeek()` | `string` | weekday name in Amharic (`ቅዳሜ`) |
| `.getGCWeekDay()` | `number` | weekday index 0–6 (0 = Sunday) |

### Format tokens

For `new Zemen(2009, 11, 27)` — ቅዳሜ, ነሐሴ 27, 2009:

| Token | Meaning | Output |
|---|---|---|
| `Y` / `YYYY` | year | `2009` |
| `YY` | 2-digit year | `09` |
| `M` | month number (1-based) | `12` |
| `MM` | zero-padded month | `12` |
| `MMM` | short month name | `ነሐሴ` |
| `MMMM` | full month name | `ነሐሴ` |
| `D` | day of month | `27` |
| `DD` | zero-padded day | `27` |
| `DDD` / `d` | weekday name | `ቅዳሜ` |
| `e` | Gregorian weekday index | `6` |
| `E` | era | `ዓ.ም` |

Any other character is copied through:

```js
zare.format('d ፣ MMM DD ቀን YYYY E');   // 'ቅዳሜ ፣ ነሐሴ 27 ቀን 2009 ዓ.ም'
```

## TypeScript

Type declarations ship with the package for both module systems — no `@types/*`
needed:

```ts
import Zemen from 'zemen';            // ESM
import Zemen = require('zemen');      // CommonJS

const z: Zemen = Zemen.toEC(new Date());
```

## Credits

- Conversion algorithm adopted from [geez.org's `EthiopicCalendar.java`](http://www.geez.org/Calendars/EthiopicCalendar.java)
  (Beyene–Kudlek).
- Canonical test data: Appleyard & Girma Selasse Asfaw (Oxford University Press, 1979)
  and the [Calendrica](http://emr.cs.iit.edu/home/reingold/calendar-book/Calendrica.html) applet.
- Author: [m3hari](https://github.com/m3hari) — መሐሪ ጌታ

## Contributing

1. Fork it!
2. Create your feature branch
3. `bun install && bun run check`
4. Submit a pull request :D

[MIT](LICENCE.md)
