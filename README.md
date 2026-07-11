# Zemen · ዘመን

> Ethiopian ⇆ Gregorian calendar dates for JavaScript.
> የኢትዮጵያ እና የግሪጎሪያን ቀን መቀያየሪያ እና መቅረጫ ላይብረሪ።

[![CI](https://github.com/m3hari/zemen/actions/workflows/ci.yml/badge.svg)](https://github.com/m3hari/zemen/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/zemen)](https://bundlephobia.com/package/zemen)

▶ **[Playground](https://m3hari.github.io/zemen/)**

## Install

```bash
npm i zemen        # or: bun add zemen
```

## Usage

```js
import Zemen from 'zemen';               // ESM, default import
import { Zemen } from 'zemen';           // ESM, named import
const Zemen = require('zemen');          // CommonJS

// today, in the Ethiopian calendar
const zare = new Zemen();
zare.toString();                         // '2018-11-5'
zare.format('d ፣ MMMM DD ቀን YYYY E');    // 'እሑድ ፣ ሐምሌ 05 ቀን 2018 ዓ.ም'

// Gregorian → Ethiopian
const ken = Zemen.fromGregorian('2017-09-02');
ken.toString();                           // '2009-12-27'
ken.getMonthName();                       // 'ነሐሴ'
ken.getDayOfWeek();                       // 'ቅዳሜ'

// Ethiopian → Gregorian
new Zemen(2009, 11, 27).toGregorian();   // Date: Sat Sep 02 2017

// the 13th month, ጳጉሜን
new Zemen(2011, 12, 5).format('MMMM D YYYY');  // 'ጳጉሜን 5 2011'
```

## API

Zemen mirrors the read API of JavaScript's `Date` — **months are 0-based**
(0 = መስከረም … 12 = ጳጉሜን), like `Date#getMonth`. Instances are immutable.

| Member | Returns | Description |
|---|---|---|
| `new Zemen()` | `Zemen` | today |
| `new Zemen('2009-12-27')` | `Zemen` | from an Ethiopian `y-m-d` string |
| `new Zemen(2009, 11, 27)` | `Zemen` | from Ethiopian year, month, day |
| `Zemen.fromGregorian(date)` | `Zemen` | from a JS `Date`, a date string, or `(y, m, d)` |
| `.toGregorian()` | `Date` | this date in the Gregorian calendar |
| `.format(pattern?)` | `string` | tokens below; no pattern → `'y-m-d'` |
| `.toString()` | `string` | `'y-m-d'` (month 1-based) |
| `.getFullYear()` | `number` | Ethiopian year |
| `.getMonth()` | `number` | Ethiopian month, 0-based |
| `.getDate()` | `number` | day of month |
| `.getDay()` | `number` | weekday, 0 = Sunday |
| `.getMonthName()` | `string` | month name in Amharic |
| `.getDayOfWeek()` | `string` | weekday name in Amharic |

### Format tokens

For `new Zemen(2009, 11, 27)` — ቅዳሜ, ነሐሴ 27, 2009:

| Token | Output | | Token | Output |
|---|---|---|---|---|
| `YYYY` / `Y` | `2009` | | `DD` | `27` |
| `YY` | `09` | | `D` | `27` |
| `MMMM` | `ነሐሴ` | | `DDD` / `d` | `ቅዳሜ` |
| `MMM` | `ነሐሴ` | | `e` | `6` |
| `MM` / `M` | `12` | | `E` | `ዓ.ም` |

Any other character is copied through:
`format('d ፣ MMM DD ቀን YYYY E')` → `'ቅዳሜ ፣ ነሐሴ 27 ቀን 2009 ዓ.ም'`

## Credits

- Conversion algorithm: [geez.org `EthiopicCalendar.java`](http://www.geez.org/Calendars/EthiopicCalendar.java) (Beyene–Kudlek).
- Test data: Appleyard & Girma Selasse Asfaw (Oxford, 1979) and [Calendrica](http://emr.cs.iit.edu/home/reingold/calendar-book/Calendrica.html).
- Author: [m3hari](https://github.com/m3hari) — መሐሪ ጌታ · [MIT](LICENCE.md)
