# Accessibility Baseline

<!--
This table grandfathers pre-existing axe-core accessibility violations in
component stories, the same way docs/architecture/SAST_BASELINE.md
grandfathers pre-existing CodeQL findings. It is validated by
scripts/provenance/validate-accessibility-baseline.mjs.

Scanner: axe-core ~4.13.0, run transitively via
@axe-core/playwright@4.13.0. That package is not yet installed in this
repo as of this baseline's creation (Phase 10 Track A, Task 5) — Task 5 is
pure tooling for the baseline mechanism itself; installing the scanner and
producing real scan envelopes is Task 6/7/8's job. This table starts empty
because no real scan has run yet.

axe-core's own documented default ruleset runs all rules except those
tagged `experimental` — it is not scoped to only WCAG 2.0/2.1 A/AA tags.
Any violation from that full default ruleset, on any component story, is
in scope for this baseline.

One-way-door contract (adapted from SAST_BASELINE.md's, with one
deliberate difference): unlike the SAST baseline, which is fully populated
once and never grows, this baseline MAY grow over time as new component
stories are authored incrementally and scanned for the first time — adding
a new story's genuinely pre-existing violations here is expected, ongoing
maintenance, not a one-time event. What never changes is this: an existing
entry is NEVER removed except by fixing the underlying violation, confirmed
by that violation's fingerprint genuinely disappearing from a subsequent
real scan. A baseline row must never be deleted by hand just to make the
gate pass — that defeats the entire purpose of grandfathering.

Every addition to this table is a human-authored git change to this
Markdown file, made directly by a person reviewing
`validate-accessibility-baseline.mjs --report <glob>`'s output. The
validator script itself has no write, populate, or update mode of any
kind, under any flag or environment variable — this is enforced by
construction, not by convention, so it can never become a CI escape hatch.

Fingerprint formula: `<axe rule ID>:<component-story identifier>:<CSS
selector/target path>`, computed per-violation, per-node (one axe rule
violation can report multiple nodes[], each a distinct DOM location with
its own fingerprint entry).
-->

| Fingerprint | Rule | Component/Story | Note |
| ----------- | ---- | --------------- | ---- |
| landmark-one-main:ng-autofocus--default:html | landmark-one-main | ng-autofocus--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-autofocus--default:html | page-has-heading-one | ng-autofocus--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-autofocus--default:#storybook-root | region | ng-autofocus--default | Storybook's #storybook-root wrapper div sits outside any landmark region on the bare iframe shell page; environmental, not a component defect. |
| landmark-one-main:ng-badge--large:html | landmark-one-main | ng-badge--large | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-badge--large:html | page-has-heading-one | ng-badge--large | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-badge--large:#storybook-root | region | ng-badge--large | Storybook's #storybook-root wrapper div sits outside any landmark region on the bare iframe shell page; environmental, not a component defect. |
| landmark-one-main:ng-badge--success:html | landmark-one-main | ng-badge--success | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-badge--success:html | page-has-heading-one | ng-badge--success | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-badge--success:#storybook-root | region | ng-badge--success | Storybook's #storybook-root wrapper div sits outside any landmark region on the bare iframe shell page; environmental, not a component defect. |
| color-contrast:ng-button--default:.u-button-label | color-contrast | ng-button--default | UButton's white label text on the success/primary background color (#ffffff on #10b981, ratio 2.53:1) is below WCAG AA's 4.5:1 minimum; real theme-level contrast issue in @ultimate/uix-styles, out of Task 6's scope to fix (component/style source). |
| landmark-one-main:ng-button--default:html | landmark-one-main | ng-button--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-button--default:html | page-has-heading-one | ng-button--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-button--loading:html | landmark-one-main | ng-button--loading | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-button--loading:html | page-has-heading-one | ng-button--loading | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| color-contrast:ng-button--with-icon:.u-button-label | color-contrast | ng-button--with-icon | UButton's white label text on the success/primary background color (#ffffff on #10b981, ratio 2.53:1) is below WCAG AA's 4.5:1 minimum; real theme-level contrast issue in @ultimate/uix-styles, out of Task 6's scope to fix (component/style source). |
| landmark-one-main:ng-button--with-icon:html | landmark-one-main | ng-button--with-icon | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-button--with-icon:html | page-has-heading-one | ng-button--with-icon | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| label:ng-checkbox--default:input | label | ng-checkbox--default | Checkbox Default story renders a bare binary checkbox with no label/aria-label/aria-labelledby (per checkbox.stories.ts's own Default args, out of Task 6's scope to modify); real finding for this specific story's unlabeled usage. |
| landmark-one-main:ng-checkbox--default:html | landmark-one-main | ng-checkbox--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-checkbox--default:html | page-has-heading-one | ng-checkbox--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-checkbox--default:#storybook-root | region | ng-checkbox--default | Storybook's #storybook-root wrapper div sits outside any landmark region on the bare iframe shell page; environmental, not a component defect. |
| landmark-one-main:ng-dialog--default:html | landmark-one-main | ng-dialog--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-dialog--default:html | page-has-heading-one | ng-dialog--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-dialog--non-closable:html | landmark-one-main | ng-dialog--non-closable | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-dialog--non-closable:html | page-has-heading-one | ng-dialog--non-closable | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-dialog--open:html | landmark-one-main | ng-dialog--open | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-dialog--open:html | page-has-heading-one | ng-dialog--open | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-fluid--default:html | landmark-one-main | ng-fluid--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-fluid--default:html | page-has-heading-one | ng-fluid--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-menu--popup:html | landmark-one-main | ng-menu--popup | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-menu--popup:html | page-has-heading-one | ng-menu--popup | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-menu--popup:.u-menu-item[role="none"]:nth-child(1) > .u-ripple.u-menu-item-link[role="menuitem"] > .u-menu-item-label | region | ng-menu--popup | WebKit-only: axe flags menu item label text as outside a landmark region on the bare Storybook iframe shell (no <main> exists on this page at all); same root cause as landmark-one-main/page-has-heading-one, surfaced differently by WebKit's accessibility tree. |
| region:ng-menu--popup:a[href$="settings"] > .u-menu-item-label | region | ng-menu--popup | WebKit-only: axe flags menu item label text as outside a landmark region on the bare Storybook iframe shell (no <main> exists on this page at all); same root cause as landmark-one-main/page-has-heading-one, surfaced differently by WebKit's accessibility tree. |
| landmark-one-main:ng-menu--with-disabled-item:html | landmark-one-main | ng-menu--with-disabled-item | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-menu--with-disabled-item:html | page-has-heading-one | ng-menu--with-disabled-item | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-menu--with-disabled-item:.u-menu-item[role="none"]:nth-child(1) > .u-ripple.u-menu-item-link[role="menuitem"] > .u-menu-item-label | region | ng-menu--with-disabled-item | WebKit-only: axe flags menu item label text as outside a landmark region on the bare Storybook iframe shell (no <main> exists on this page at all); same root cause as landmark-one-main/page-has-heading-one, surfaced differently by WebKit's accessibility tree. |
| region:ng-menu--with-disabled-item:.p-disabled > .u-ripple.u-menu-item-link[role="menuitem"] > .u-menu-item-label | region | ng-menu--with-disabled-item | WebKit-only: axe flags menu item label text as outside a landmark region on the bare Storybook iframe shell (no <main> exists on this page at all); same root cause as landmark-one-main/page-has-heading-one, surfaced differently by WebKit's accessibility tree. |
| region:ng-menu--with-disabled-item:.u-menu-item[role="none"]:nth-child(3) > .u-ripple.u-menu-item-link[role="menuitem"] > .u-menu-item-label | region | ng-menu--with-disabled-item | WebKit-only: axe flags menu item label text as outside a landmark region on the bare Storybook iframe shell (no <main> exists on this page at all); same root cause as landmark-one-main/page-has-heading-one, surfaced differently by WebKit's accessibility tree. |
| landmark-one-main:ng-paginator--default:html | landmark-one-main | ng-paginator--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-paginator--default:html | page-has-heading-one | ng-paginator--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-paginator--empty:html | landmark-one-main | ng-paginator--empty | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-paginator--empty:html | page-has-heading-one | ng-paginator--empty | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-paginator--middle-page:html | landmark-one-main | ng-paginator--middle-page | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-paginator--middle-page:html | page-has-heading-one | ng-paginator--middle-page | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-ripple--default:html | landmark-one-main | ng-ripple--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-ripple--default:html | page-has-heading-one | ng-ripple--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-scroller--default:html | landmark-one-main | ng-scroller--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-scroller--default:html | page-has-heading-one | ng-scroller--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-scroller--disabled:html | landmark-one-main | ng-scroller--disabled | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-scroller--disabled:html | page-has-heading-one | ng-scroller--disabled | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-scroller--disabled:#storybook-root | region | ng-scroller--disabled | Storybook's #storybook-root wrapper div sits outside any landmark region on the bare iframe shell page; environmental, not a component defect. |
| scrollable-region-focusable:ng-scroller--disabled:.u-component | scrollable-region-focusable | ng-scroller--disabled | UScroller's disabled/unvirtualized root has scrollable overflow content but no tabindex, so it is not keyboard-reachable for scrolling; real finding, out of Task 6's scope to fix (component source). |
| landmark-one-main:ng-scroller--loading:html | landmark-one-main | ng-scroller--loading | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-scroller--loading:html | page-has-heading-one | ng-scroller--loading | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| aria-required-children:ng-table--default:.u-component | aria-required-children | ng-table--default | UTable's root div[role=table] wraps a native <table> element directly; ARIA's table role requires rowgroup/row children, not a nested table element -- real structural ARIA mismatch in ng-core's UTable template, out of Task 6's scope to fix. |
| landmark-one-main:ng-table--default:html | landmark-one-main | ng-table--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-table--default:html | page-has-heading-one | ng-table--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-table--default:#storybook-root | region | ng-table--default | Storybook's #storybook-root wrapper div sits outside any landmark region on the bare iframe shell page; environmental, not a component defect. |
| aria-required-children:ng-table--paginated:.u-table | aria-required-children | ng-table--paginated | UTable's root div[role=table] wraps a native <table> element directly; ARIA's table role requires rowgroup/row children, not a nested table element -- real structural ARIA mismatch in ng-core's UTable template, out of Task 6's scope to fix. |
| landmark-one-main:ng-table--paginated:html | landmark-one-main | ng-table--paginated | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-table--paginated:html | page-has-heading-one | ng-table--paginated | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-table--paginated:.u-table-table | region | ng-table--paginated |  |
| aria-required-children:ng-table--sorted:.u-component | aria-required-children | ng-table--sorted | UTable's root div[role=table] wraps a native <table> element directly; ARIA's table role requires rowgroup/row children, not a nested table element -- real structural ARIA mismatch in ng-core's UTable template, out of Task 6's scope to fix. |
| landmark-one-main:ng-table--sorted:html | landmark-one-main | ng-table--sorted | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-table--sorted:html | page-has-heading-one | ng-table--sorted | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-table--sorted:#storybook-root | region | ng-table--sorted | Storybook's #storybook-root wrapper div sits outside any landmark region on the bare iframe shell page; environmental, not a component defect. |
| landmark-one-main:ng-tooltip--default:html | landmark-one-main | ng-tooltip--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-tooltip--default:html | page-has-heading-one | ng-tooltip--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-tooltip--disabled:html | landmark-one-main | ng-tooltip--disabled | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-tooltip--disabled:html | page-has-heading-one | ng-tooltip--disabled | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-tooltip--right-position:html | landmark-one-main | ng-tooltip--right-position | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-tooltip--right-position:html | page-has-heading-one | ng-tooltip--right-position | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-badge--default:html | landmark-one-main | ng-badge--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-badge--default:html | page-has-heading-one | ng-badge--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-badge--default:#storybook-root | region | ng-badge--default | Storybook's #storybook-root wrapper div sits outside any landmark region on the bare iframe shell page; environmental, not a component defect. |
| landmark-one-main:ng-button--disabled:html | landmark-one-main | ng-button--disabled | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-button--disabled:html | page-has-heading-one | ng-button--disabled | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| landmark-one-main:ng-checkbox--disabled:html | landmark-one-main | ng-checkbox--disabled | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-checkbox--disabled:html | page-has-heading-one | ng-checkbox--disabled | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-checkbox--disabled:#storybook-root | region | ng-checkbox--disabled | Storybook's #storybook-root wrapper div sits outside any landmark region on the bare iframe shell page; environmental, not a component defect. |
| landmark-one-main:ng-checkbox--with-label:html | landmark-one-main | ng-checkbox--with-label | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-checkbox--with-label:html | page-has-heading-one | ng-checkbox--with-label | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-checkbox--with-label:#storybook-root | region | ng-checkbox--with-label | Storybook's #storybook-root wrapper div sits outside any landmark region on the bare iframe shell page; environmental, not a component defect. |
| landmark-one-main:ng-menu--default:html | landmark-one-main | ng-menu--default | Storybook iframe.html shell page has no <main> landmark around the story root; environmental (present for every ng story tested), not a component defect. |
| page-has-heading-one:ng-menu--default:html | page-has-heading-one | ng-menu--default | Storybook iframe.html shell page has no top-level <h1>; environmental (present for every ng story tested), not a component defect. |
| region:ng-menu--default:.u-menu-item[role="none"]:nth-child(1) > .u-ripple.u-menu-item-link[role="menuitem"] > .u-menu-item-label | region | ng-menu--default | WebKit-only: axe flags menu item label text as outside a landmark region on the bare Storybook iframe shell (no <main> exists on this page at all); same root cause as landmark-one-main/page-has-heading-one, surfaced differently by WebKit's accessibility tree. |
| region:ng-menu--default:a[href$="settings"] > .u-menu-item-label | region | ng-menu--default | WebKit-only: axe flags menu item label text as outside a landmark region on the bare Storybook iframe shell (no <main> exists on this page at all); same root cause as landmark-one-main/page-has-heading-one, surfaced differently by WebKit's accessibility tree. |
