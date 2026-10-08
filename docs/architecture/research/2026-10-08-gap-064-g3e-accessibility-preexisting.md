# GAP-064 G3-E — pre-existing accessibility violations on the G3-E verification stories

**Date:** 2026-10-08. **Type:** dated evidence (AGENTS.md tier 6). This file is **not** an accessibility baseline and not CI configuration.

## What this is

The axe violation fingerprints (`rule:story:target`) that the G3-E verification stories show **before** each batch's CSS port, confirmed again after it. They predate G3-E; the G3-E stories only expose them. Rows are added per batch (Plan Tasks 5, 8, 11, 14) from the Docker before-port run and confirmed in the batch's after-port run.

- Consumer: `scripts/provenance/validate-g3e-accessibility.mjs` only. `validate-accessibility-baseline.mjs` and the G3-A..G3-D validators never read it.
- Introduced rows are **not** listed here; they go to the batch's review gate, and only approved ones enter `ACCESSIBILITY_BASELINE.md`.
- Changes are human-authored, reviewed edits only. Remove a row once its debt is fixed (the check reports it as STALE). Never add a row to silence a violation introduced by a later change.

| Fingerprint                                       | Rule                 | Component/Story         | Note                                                                        |
| ------------------------------------------------- | -------------------- | ----------------------- | --------------------------------------------------------------------------- |
| label:ng-imagecompare--rtl:input                  | label                | ng-imagecompare--rtl    | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| label:ng-imagecompare--sized:input                | label                | ng-imagecompare--sized  | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| label:vue-imagecompare--rtl:input                 | label                | vue-imagecompare--rtl   | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| label:vue-imagecompare--sized:input               | label                | vue-imagecompare--sized | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| landmark-one-main:ng-image--default:html          | landmark-one-main    | ng-image--default       | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| landmark-one-main:ng-image--with-preview:html     | landmark-one-main    | ng-image--with-preview  | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| landmark-one-main:ng-imagecompare--rtl:html       | landmark-one-main    | ng-imagecompare--rtl    | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| landmark-one-main:ng-imagecompare--sized:html     | landmark-one-main    | ng-imagecompare--sized  | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| landmark-one-main:vue-image--default:html         | landmark-one-main    | vue-image--default      | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| landmark-one-main:vue-image--with-preview:html    | landmark-one-main    | vue-image--with-preview | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| landmark-one-main:vue-imagecompare--rtl:html      | landmark-one-main    | vue-imagecompare--rtl   | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| landmark-one-main:vue-imagecompare--sized:html    | landmark-one-main    | vue-imagecompare--sized | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| page-has-heading-one:ng-image--default:html       | page-has-heading-one | ng-image--default       | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| page-has-heading-one:ng-image--with-preview:html  | page-has-heading-one | ng-image--with-preview  | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| page-has-heading-one:ng-imagecompare--rtl:html    | page-has-heading-one | ng-imagecompare--rtl    | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| page-has-heading-one:ng-imagecompare--sized:html  | page-has-heading-one | ng-imagecompare--sized  | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| page-has-heading-one:vue-image--default:html      | page-has-heading-one | vue-image--default      | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| page-has-heading-one:vue-image--with-preview:html | page-has-heading-one | vue-image--with-preview | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| page-has-heading-one:vue-imagecompare--rtl:html   | page-has-heading-one | vue-imagecompare--rtl   | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| page-has-heading-one:vue-imagecompare--sized:html | page-has-heading-one | vue-imagecompare--sized | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| region:ng-image--default:#storybook-root          | region               | ng-image--default       | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| region:ng-image--with-preview:img                 | region               | ng-image--with-preview  | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| region:ng-imagecompare--rtl:#storybook-root       | region               | ng-imagecompare--rtl    | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| region:ng-imagecompare--sized:#storybook-root     | region               | ng-imagecompare--sized  | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| region:vue-image--default:#storybook-root         | region               | vue-image--default      | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| region:vue-image--with-preview:img                | region               | vue-image--with-preview | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| region:vue-imagecompare--rtl:#storybook-root      | region               | vue-imagecompare--rtl   | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
| region:vue-imagecompare--sized:#storybook-root    | region               | vue-imagecompare--sized | E-1 pre-existing before the port (Docker, c2efa39; chromium,firefox,webkit) |
