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
