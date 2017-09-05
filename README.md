# Zemen
### Ethiopian Calender library.

![Under Development](https://img.shields.io/badge/under-development-orange.svg)
[![MIT](https://img.shields.io/packagist/l/doctrine/orm.svg?maxAge=2592000)](LICENCE.md)
[![Build Status](https://travis-ci.org/m3hari/zemen.svg?branch=master)](https://travis-ci.org/m3hari/zemen)
[![Coverage Status](https://coveralls.io/repos/github/m3hari/zemen/badge.svg?branch=develop)](https://coveralls.io/github/m3hari/zemen?branch=master)


### Based On Beyene-Kudlek  Algorithm 
#### http://www.geez.org/Calendars/

## Installation

```bash
$ npm install --save zemen  
```

## Usage
```js
const Zemen  = require('zemen');

let zare = new Zemen();
zare.toString()                         // '2009-12-27'
zare.format('MMM-DD-YYYY')              //  ነሐሴ-27-2009
zare.format('d ፣ MMM DD ቀን YYYY E')     //  ቅዳሜ ፣ ነሐሴ 27 ቀን 2009 ዓ.ም


// TO Ethiopian
Zemen.toEC("2017-09-02").toString()      // '2009-12-27'
Zemen.toEC(2017,8,2).toString()          // '2009-12-17'
Zemen.toEC(new Date()).toString()        // '2009-12-27'


// TO Gregorian
Zemen.toGC("2009-12-27").toDateString()     // Sat Sep 02 2017
Zemen.toGC(2009,11,27).toDateString()       // Sat Sep 02 2017
Zemen.toGC(new Zemen()).toDateString()      // Sat Sep 02 2017

```



### Plans
- [x] More formating
- [x] Support the browser
- [x] Publish on npm
- [ ] Support for time and timezone
- [ ] playground github page
- [ ] Date picker
- [ ] Date utilities
- [ ] Angular wrapper
- [ ] . . .

## Contributing
1. Fork it!
2. Create your feature branch
3. Submit a pull request :D