# Zemen
### Ethiopian Calender library.

![Under Development](https://img.shields.io/badge/under-development-orange.svg)
[![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg?maxAge=2592000)](LICENCE.md)
[![Build Status](https://travis-ci.org/m3hari/zemen.svg?branch=master)](https://travis-ci.org/m3hari/zemen)

### Based On Beyene-Kudlek  Algorithm 
#### http://www.geez.org/Calendars/

## API
```

/**
* Converts a Ethiopian date to Gregorian and returns Date instance representing Gregorian Date.
* @param { String | Number  } val - A numeric year value if second and third parameters are provided,
                             It should be a date string if not. 
* @param { Number } month A zero-based numeric value for the month (0 for January, 11 for December)
* @param { Number } day A numeric value equal for the day of the month.
*/

toGC(val, month, day)


/**
* Converts a Gregorian date to Ethiopian and returns Zemen instance representing Ethiopian Date.
* @param { String | Number | Date } val - A numeric year value if second and third parameters are provided,
*                                   It should be  either a date string or a Date object if not.  
* @param { Number } month A zero-based numeric value for the month (0 for January, 11 for December)
* @param { Number } day A numeric value equal for the day of the month.
*/
toEC(val, month, day)

```

## Usage
```js
const zemen  = require('zemen');

let zare = Zemen.toEC(new Date());
zare.toString() // '2009-12-12'
zare.format()   // ዓርብ,ነሐሴ 12 2009 ዓ.ም

let zare = Zemen.toEC("2017-08-18");
zare.toString() // '2009-12-12'

let zare = Zemen.toEC(2017,8,18);
zare.toString() // '2009-12-12'


Zemen.toGC("2009-12-12")    // 2017-08-18
Zemen.toGC(2009,12,12)      // 2017-08-18

```



### Plans
- [ ] more formating
- [ ] support the browser
- [ ] publish on npm
- [ ] support for time and time zone related thing
- [ ] playground github page
- [ ] date picker
- [ ] ng wrapper
- [ ] . . .

## Contributing
1. Fork it!
2. Create your feature branch
3. Submit a pull request :D