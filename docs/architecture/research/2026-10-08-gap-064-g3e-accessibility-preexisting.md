# GAP-064 G3-E — pre-existing accessibility violations on the G3-E verification stories

**Date:** 2026-10-08. **Type:** dated evidence (AGENTS.md tier 6). This file is **not** an accessibility baseline and not CI configuration.

## What this is

The axe violation fingerprints (`rule:story:target`) that the G3-E verification stories show **before** each batch's CSS port, confirmed again after it. They predate G3-E; the G3-E stories only expose them. Rows are added per batch (Plan Tasks 5, 8, 11, 14) from the Docker before-port run and confirmed in the batch's after-port run.

- Consumer: `scripts/provenance/validate-g3e-accessibility.mjs` only. `validate-accessibility-baseline.mjs` and the G3-A..G3-D validators never read it.
- Introduced rows are **not** listed here; they go to the batch's review gate, and only approved ones enter `ACCESSIBILITY_BASELINE.md`.
- Changes are human-authored, reviewed edits only. Remove a row once its debt is fixed (the check reports it as STALE). Never add a row to silence a violation introduced by a later change.

| Fingerprint | Rule | Component/Story | Note |
| ----------- | ---- | --------------- | ---- |
