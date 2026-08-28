// Shared type shape for style-module exports in this package.
//
// Transcribed from upstream `@primeuix/styles@2.0.3`'s `dist/types.d.mts`
// (not sourcemapped — `dist/types.mjs.map` has empty `sources`, so
// `extract-source.mjs` recovers nothing for it; read directly per the
// documented fallback for un-sourcemapped `.d.mts` files, see Task 4).
//
// Upstream's `types.d.mts` re-exports `StyleType` from `@primeuix/styled`.
// This package has zero runtime dependencies (confirmed: `base` is a plain
// CSS template string with no imports), so `StyleType` is redefined locally
// here rather than importing `@primeuix/styled`. Each per-component style
// module upstream exports a `style` of this shape; Phase 2+ subpaths added
// to this package will reuse it.
export type StyleType = string;
