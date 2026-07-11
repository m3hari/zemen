/**
 * Single indirection point for the implementation under test.
 * The whole suite imports Zemen (and the internal converter/formatter
 * modules) from here, so swapping the implementation is a one-file change.
 *
 * Points at the TypeScript rewrite; it previously pointed at the 0.0.7-era
 * JavaScript source, and the suite passed unchanged against both.
 */
export { default as Zemen } from "../src/index";
export * as Converter from "../src/conversion";
export * as Formatter from "../src/formatting";
