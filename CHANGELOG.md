# Changelog

## 0.0.8 — 2026

Internal rewrite. **No observable behavior changes** — verified against the
published 0.0.7 by 87,601 golden-master fixtures, an exhaustive day-by-day
comparison of six centuries, and randomized differential fuzzing
(see VERIFICATION.md).

### Changed (internals only)

- Source rewritten in strict TypeScript (`src/*.ts`); the infamous
  `src/ conversion.js` (leading space) is now `src/conversion.ts`.
- Toolchain is Bun-native: `bun test`, `bun build`, two dev dependencies
  (`typescript`, `@types/bun`). Webpack, Babel, ESLint, Jest, Travis,
  coveralls, rimraf and npx are gone.
- Dual-format build: `dist/index.cjs` (`module.exports = Zemen`, the same
  export shape as every release since 0.0.1) + `dist/index.mjs` (ESM entry
  sharing the same class identity) + per-format type declarations
  (`.d.cts` with `export =`, `.d.mts` with `export default`).
- npm tarball slimmed to `dist/` + README + LICENCE (0.0.7 shipped tests,
  webpack config and yarn.lock). Deep imports of `zemen/src/*` were never
  documented and no longer resolve.
- CI on GitHub Actions with a timezone matrix and an independent
  registry-based parity check.

### Added

- Type declarations now include `static parse` and allow `format()` without
  arguments (both existed at runtime since 0.0.x; additive types only).
- Golden-master parity suite, packaging contract tests, `bun run verify`.
- Live playground: https://m3hari.github.io/zemen/

### For consumers

Nothing to do. `require('zemen')` and `import Zemen from 'zemen'` both work;
all methods, outputs, month indexing (0-based) and error messages are
unchanged.

## 0.0.7 and earlier

See git history.
