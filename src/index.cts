import { Zemen } from "./zemen";

// Compiles to a bare `module.exports = Zemen` so `require('zemen')` returns
// the class directly — the exact export shape of every release since 0.0.1.
export = Zemen;
