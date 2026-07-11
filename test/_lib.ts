/**
 * Single indirection point for the implementation under test.
 * The whole suite imports Zemen (and the internal converter/formatter
 * modules) from here, so swapping the implementation is a one-file change.
 *
 * Currently points at the untouched 0.0.7-era JavaScript source; the
 * TypeScript rewrite commit repoints these three lines and nothing else.
 */
// @ts-expect-error legacy untyped CJS module
export { default as Zemen } from "../zemen.js";
// @ts-expect-error legacy untyped CJS module (note the leading space in the filename)
export * as Converter from "../src/ conversion.js";
// @ts-expect-error legacy untyped CJS module
export * as Formatter from "../src/formating.js";
