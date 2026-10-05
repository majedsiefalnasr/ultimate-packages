# GAP-064 G3-A — pre-existing accessibility violations on the G3-A verification stories

**Date:** 2026-10-04. **Type:** dated evidence (AGENTS.md tier 6). This file is **not** an accessibility baseline and not CI configuration.

## What this is

These are the 200 axe violation fingerprints (`rule:story:target`) that the 65 G3-A verification stories (ng 31, vue 34) show **before and after** the G3-A CSS port. They are page-level Storybook markup and component DOM issues that predate G3-A. The G3-A verification stories only expose them, because those story IDs were never scanned before.

- Derivation: the unique rows observed both in the pre-port run (`bdc0041`) and the post-port run of the Task 8 accepted state (staged tree `f6b9627`). Both are Docker `mcr.microsoft.com/playwright:v1.63.0-jammy` runs of `packages/{ng,vue}/e2e/g3a-aura-styles.spec.ts`, recorded in `docs/superpowers/plans/2026-10-04-gap-064-g3a-visual-review.md`. The rows were regenerated on 2026-10-05 from fresh runs of both trees, because the original Task 8 envelopes in `/tmp` had been deleted. The fresh runs reproduced the recorded numbers exactly: pre-port 228 unique rows, post-port 200, 0 introduced, 28 removed, and the same counts per rule.
- Decision: Task 8 decision (c) keeps these rows **out of** `docs/architecture/ACCESSIBILITY_BASELINE.md`. Spec §14 (Amendment A1) uses this list only in the G3-A differential check.
- Consumer: `scripts/provenance/validate-g3a-accessibility.mjs` reads this file. `validate-accessibility-baseline.mjs` never reads it.
- The 9 approved G3-A Aura parity exceptions are **not** listed here. They live only in `ACCESSIBILITY_BASELINE.md`.
- Changes are human-authored, reviewed edits only. Remove a row once its debt is fixed (the check reports it as STALE). Never add a row to silence a violation introduced by a later change.

| Fingerprint | Rule | Component/Story | Note |
| ----------- | ---- | --------------- | ---- |
| landmark-one-main:ng-avatar--circle:html | landmark-one-main | ng-avatar--circle | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-avatar--circle:html | page-has-heading-one | ng-avatar--circle | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-avatar--circle:#storybook-root | region | ng-avatar--circle | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-avatar--icon:html | landmark-one-main | ng-avatar--icon | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-avatar--icon:html | page-has-heading-one | ng-avatar--icon | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-avatar--label:html | landmark-one-main | ng-avatar--label | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-avatar--label:html | page-has-heading-one | ng-avatar--label | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-avatar--label:#storybook-root | region | ng-avatar--label | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-avatar--large:html | landmark-one-main | ng-avatar--large | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-avatar--large:html | page-has-heading-one | ng-avatar--large | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-avatar--large:#storybook-root | region | ng-avatar--large | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| image-alt:ng-avatar--local-image:img | image-alt | ng-avatar--local-image | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-avatar--local-image:html | landmark-one-main | ng-avatar--local-image | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-avatar--local-image:html | page-has-heading-one | ng-avatar--local-image | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-avatar--local-image:#storybook-root | region | ng-avatar--local-image | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-avatar--xl:html | landmark-one-main | ng-avatar--xl | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-avatar--xl:html | page-has-heading-one | ng-avatar--xl | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-avatar--xl:#storybook-root | region | ng-avatar--xl | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-chip--default:html | landmark-one-main | ng-chip--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-chip--default:html | page-has-heading-one | ng-chip--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-chip--default:#storybook-root | region | ng-chip--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-command-name:ng-chip--removable:.u-chip-remove-icon | aria-command-name | ng-chip--removable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-chip--removable:html | landmark-one-main | ng-chip--removable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-chip--removable:html | page-has-heading-one | ng-chip--removable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-chip--removable:#storybook-root | region | ng-chip--removable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| svg-img-alt:ng-chip--removable:svg[width="14"] | svg-img-alt | ng-chip--removable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-chip--with-icon:html | landmark-one-main | ng-chip--with-icon | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-chip--with-icon:html | page-has-heading-one | ng-chip--with-icon | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-chip--with-icon:#storybook-root | region | ng-chip--with-icon | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-knob--default:html | landmark-one-main | ng-knob--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-knob--default:html | page-has-heading-one | ng-knob--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-knob--no-value-text:html | landmark-one-main | ng-knob--no-value-text | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-knob--no-value-text:html | page-has-heading-one | ng-knob--no-value-text | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-knob--readonly:html | landmark-one-main | ng-knob--readonly | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-knob--readonly:html | page-has-heading-one | ng-knob--readonly | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-message--all-severities:html | landmark-one-main | ng-message--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-message--all-severities:html | page-has-heading-one | ng-message--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-message--closable:html | landmark-one-main | ng-message--closable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-message--closable:html | page-has-heading-one | ng-message--closable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-message--default:html | landmark-one-main | ng-message--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-message--default:html | page-has-heading-one | ng-message--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-meter-name:ng-metergroup--default:.u-component | aria-meter-name | ng-metergroup--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-metergroup--default:html | landmark-one-main | ng-metergroup--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-metergroup--default:html | page-has-heading-one | ng-metergroup--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-metergroup--default:#storybook-root | region | ng-metergroup--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-meter-name:ng-metergroup--vertical:.u-component | aria-meter-name | ng-metergroup--vertical | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-metergroup--vertical:html | landmark-one-main | ng-metergroup--vertical | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-metergroup--vertical:html | page-has-heading-one | ng-metergroup--vertical | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-metergroup--vertical:#storybook-root | region | ng-metergroup--vertical | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-overlaybadge--default:html | landmark-one-main | ng-overlaybadge--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-overlaybadge--default:html | page-has-heading-one | ng-overlaybadge--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-overlaybadge--default:#storybook-root | region | ng-overlaybadge--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-overlaybadge--dot-only:html | landmark-one-main | ng-overlaybadge--dot-only | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-overlaybadge--dot-only:html | page-has-heading-one | ng-overlaybadge--dot-only | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-progressbar-name:ng-progressbar--determinate:u-progress-bar | aria-progressbar-name | ng-progressbar--determinate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:ng-progressbar--determinate:.u-progress-bar-label | color-contrast | ng-progressbar--determinate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-progressbar--determinate:html | landmark-one-main | ng-progressbar--determinate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-progressbar--determinate:html | page-has-heading-one | ng-progressbar--determinate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-progressbar--determinate:#storybook-root | region | ng-progressbar--determinate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-progressbar-name:ng-progressbar--indeterminate:u-progress-bar | aria-progressbar-name | ng-progressbar--indeterminate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-progressbar--indeterminate:html | landmark-one-main | ng-progressbar--indeterminate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-progressbar--indeterminate:html | page-has-heading-one | ng-progressbar--indeterminate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-progressbar--indeterminate:#storybook-root | region | ng-progressbar--indeterminate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-progressbar-name:ng-progressspinner--default:u-progress-spinner | aria-progressbar-name | ng-progressspinner--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-progressspinner--default:html | landmark-one-main | ng-progressspinner--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-progressspinner--default:html | page-has-heading-one | ng-progressspinner--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-progressspinner--default:#storybook-root | region | ng-progressspinner--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-skeleton--circle:html | landmark-one-main | ng-skeleton--circle | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-skeleton--circle:html | page-has-heading-one | ng-skeleton--circle | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-skeleton--default:html | landmark-one-main | ng-skeleton--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-skeleton--default:html | page-has-heading-one | ng-skeleton--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-tag--all-severities:html | landmark-one-main | ng-tag--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-tag--all-severities:html | page-has-heading-one | ng-tag--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-tag--all-severities:#storybook-root | region | ng-tag--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-tag--default:html | landmark-one-main | ng-tag--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-tag--default:html | page-has-heading-one | ng-tag--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-tag--default:#storybook-root | region | ng-tag--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-tag--severity:html | landmark-one-main | ng-tag--severity | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-tag--severity:html | page-has-heading-one | ng-tag--severity | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-tag--severity:#storybook-root | region | ng-tag--severity | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| label:ng-terminal--default:input | label | ng-terminal--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-terminal--default:html | landmark-one-main | ng-terminal--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-terminal--default:html | page-has-heading-one | ng-terminal--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-terminal--default:#storybook-root | region | ng-terminal--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-timeline--default:html | landmark-one-main | ng-timeline--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-timeline--default:html | page-has-heading-one | ng-timeline--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-timeline--default:#storybook-root | region | ng-timeline--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-timeline--horizontal:html | landmark-one-main | ng-timeline--horizontal | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-timeline--horizontal:html | page-has-heading-one | ng-timeline--horizontal | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:ng-timeline--horizontal:#storybook-root | region | ng-timeline--horizontal | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:ng-toast--all-severities:.u-toast-message-error > .u-toast-message-content > .u-toast-summary | color-contrast | ng-toast--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:ng-toast--all-severities:.u-toast-message-success > .u-toast-message-content > .u-toast-summary | color-contrast | ng-toast--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:ng-toast--all-severities:.u-toast-message-warn > .u-toast-message-content > .u-toast-summary | color-contrast | ng-toast--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:ng-toast--all-severities:html | landmark-one-main | ng-toast--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:ng-toast--all-severities:html | page-has-heading-one | ng-toast--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-avatar--circle:html | landmark-one-main | vue-avatar--circle | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-avatar--circle:html | page-has-heading-one | vue-avatar--circle | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-avatar--circle:#storybook-root | region | vue-avatar--circle | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-avatar--icon:html | landmark-one-main | vue-avatar--icon | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-avatar--icon:html | page-has-heading-one | vue-avatar--icon | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-avatar--label:html | landmark-one-main | vue-avatar--label | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-avatar--label:html | page-has-heading-one | vue-avatar--label | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-avatar--label:#storybook-root | region | vue-avatar--label | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-avatar--large:html | landmark-one-main | vue-avatar--large | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-avatar--large:html | page-has-heading-one | vue-avatar--large | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-avatar--large:#storybook-root | region | vue-avatar--large | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| image-alt:vue-avatar--local-image:img | image-alt | vue-avatar--local-image | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-avatar--local-image:html | landmark-one-main | vue-avatar--local-image | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-avatar--local-image:html | page-has-heading-one | vue-avatar--local-image | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-avatar--local-image:#storybook-root | region | vue-avatar--local-image | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-avatar--xl:html | landmark-one-main | vue-avatar--xl | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-avatar--xl:html | page-has-heading-one | vue-avatar--xl | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-avatar--xl:#storybook-root | region | vue-avatar--xl | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-chip--default:html | landmark-one-main | vue-chip--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-chip--default:html | page-has-heading-one | vue-chip--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-chip--default:#storybook-root | region | vue-chip--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-command-name:vue-chip--removable:.u-chip-remove-icon | aria-command-name | vue-chip--removable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-chip--removable:html | landmark-one-main | vue-chip--removable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-chip--removable:html | page-has-heading-one | vue-chip--removable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-chip--removable:#storybook-root | region | vue-chip--removable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| svg-img-alt:vue-chip--removable:.u-icon | svg-img-alt | vue-chip--removable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-chip--with-icon:html | landmark-one-main | vue-chip--with-icon | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-chip--with-icon:html | page-has-heading-one | vue-chip--with-icon | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-chip--with-icon:#storybook-root | region | vue-chip--with-icon | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-inlinemessage--all-severities:html | landmark-one-main | vue-inlinemessage--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-inlinemessage--all-severities:html | page-has-heading-one | vue-inlinemessage--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-inlinemessage--default:html | landmark-one-main | vue-inlinemessage--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-inlinemessage--default:html | page-has-heading-one | vue-inlinemessage--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-inlinemessage--success:html | landmark-one-main | vue-inlinemessage--success | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-inlinemessage--success:html | page-has-heading-one | vue-inlinemessage--success | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-knob--default:html | landmark-one-main | vue-knob--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-knob--default:html | page-has-heading-one | vue-knob--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-knob--no-value-text:html | landmark-one-main | vue-knob--no-value-text | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-knob--no-value-text:html | page-has-heading-one | vue-knob--no-value-text | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-knob--readonly:html | landmark-one-main | vue-knob--readonly | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-knob--readonly:html | page-has-heading-one | vue-knob--readonly | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:vue-message--all-severities:.u-message-error > .u-message-content > .u-message-text | color-contrast | vue-message--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:vue-message--all-severities:.u-message-success > .u-message-content > .u-message-text | color-contrast | vue-message--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:vue-message--all-severities:.u-message-warn > .u-message-content > .u-message-text | color-contrast | vue-message--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-message--all-severities:html | landmark-one-main | vue-message--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-message--all-severities:html | page-has-heading-one | vue-message--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:vue-message--closable:.u-message-text | color-contrast | vue-message--closable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-message--closable:html | landmark-one-main | vue-message--closable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-message--closable:html | page-has-heading-one | vue-message--closable | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-message--default:html | landmark-one-main | vue-message--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-message--default:html | page-has-heading-one | vue-message--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-meter-name:vue-metergroup--default:.u-meter-group | aria-meter-name | vue-metergroup--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-metergroup--default:html | landmark-one-main | vue-metergroup--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-metergroup--default:html | page-has-heading-one | vue-metergroup--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-metergroup--default:#storybook-root | region | vue-metergroup--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-meter-name:vue-metergroup--vertical:.u-meter-group | aria-meter-name | vue-metergroup--vertical | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-metergroup--vertical:html | landmark-one-main | vue-metergroup--vertical | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-metergroup--vertical:html | page-has-heading-one | vue-metergroup--vertical | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-metergroup--vertical:#storybook-root | region | vue-metergroup--vertical | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-overlaybadge--default:html | landmark-one-main | vue-overlaybadge--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-overlaybadge--default:html | page-has-heading-one | vue-overlaybadge--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-overlaybadge--default:#storybook-root | region | vue-overlaybadge--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-overlaybadge--dot-only:html | landmark-one-main | vue-overlaybadge--dot-only | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-overlaybadge--dot-only:html | page-has-heading-one | vue-overlaybadge--dot-only | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-progressbar-name:vue-progressbar--determinate:.u-progress-bar | aria-progressbar-name | vue-progressbar--determinate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:vue-progressbar--determinate:.u-progress-bar-label | color-contrast | vue-progressbar--determinate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-progressbar--determinate:html | landmark-one-main | vue-progressbar--determinate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-progressbar--determinate:html | page-has-heading-one | vue-progressbar--determinate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-progressbar--determinate:#storybook-root | region | vue-progressbar--determinate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-progressbar-name:vue-progressbar--indeterminate:.u-progress-bar | aria-progressbar-name | vue-progressbar--indeterminate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-progressbar--indeterminate:html | landmark-one-main | vue-progressbar--indeterminate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-progressbar--indeterminate:html | page-has-heading-one | vue-progressbar--indeterminate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-progressbar--indeterminate:#storybook-root | region | vue-progressbar--indeterminate | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| aria-progressbar-name:vue-progressspinner--default:.u-progress-spinner | aria-progressbar-name | vue-progressspinner--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-progressspinner--default:html | landmark-one-main | vue-progressspinner--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-progressspinner--default:html | page-has-heading-one | vue-progressspinner--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-progressspinner--default:#storybook-root | region | vue-progressspinner--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-skeleton--circle:html | landmark-one-main | vue-skeleton--circle | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-skeleton--circle:html | page-has-heading-one | vue-skeleton--circle | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-skeleton--default:html | landmark-one-main | vue-skeleton--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-skeleton--default:html | page-has-heading-one | vue-skeleton--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-tag--all-severities:html | landmark-one-main | vue-tag--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-tag--all-severities:html | page-has-heading-one | vue-tag--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-tag--all-severities:#storybook-root | region | vue-tag--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-tag--default:html | landmark-one-main | vue-tag--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-tag--default:html | page-has-heading-one | vue-tag--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-tag--default:#storybook-root | region | vue-tag--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-tag--severity:html | landmark-one-main | vue-tag--severity | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-tag--severity:html | page-has-heading-one | vue-tag--severity | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-tag--severity:#storybook-root | region | vue-tag--severity | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| label:vue-terminal--default:input | label | vue-terminal--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-terminal--default:html | landmark-one-main | vue-terminal--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-terminal--default:html | page-has-heading-one | vue-terminal--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-terminal--default:#storybook-root | region | vue-terminal--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-timeline--default:html | landmark-one-main | vue-timeline--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-timeline--default:html | page-has-heading-one | vue-timeline--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-timeline--default:#storybook-root | region | vue-timeline--default | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-timeline--horizontal:html | landmark-one-main | vue-timeline--horizontal | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-timeline--horizontal:html | page-has-heading-one | vue-timeline--horizontal | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| region:vue-timeline--horizontal:#storybook-root | region | vue-timeline--horizontal | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:vue-toast--all-severities:.u-toast-message-error > .u-toast-message-content > .u-toast-summary | color-contrast | vue-toast--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:vue-toast--all-severities:.u-toast-message-success > .u-toast-message-content > .u-toast-summary | color-contrast | vue-toast--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| color-contrast:vue-toast--all-severities:.u-toast-message-warn > .u-toast-message-content > .u-toast-summary | color-contrast | vue-toast--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| landmark-one-main:vue-toast--all-severities:html | landmark-one-main | vue-toast--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
| page-has-heading-one:vue-toast--all-severities:html | page-has-heading-one | vue-toast--all-severities | Pre-existing before the G3-A port (bdc0041) and still present after it. |
