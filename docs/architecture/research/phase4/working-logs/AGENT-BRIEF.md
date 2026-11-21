# Phase 4 agent brief: remaining families

Read `DECISIONS.md` first; it is binding. This brief only summarises it for family work.

- Product: `/Users/majedsiefalnasr/Documents/Work/Ultimate-Solutions-EGY/ultimate`, pinned `91a8472547e34c6e92456f2b98270a1555e3a2db`. Read-only. No tests, builds, browser, installs, specs or tickets.
- Oracles: pinned archives under `ultimate/.vendor-cache/extracted/` (PrimeNG 21.1.9, PrimeReact 10.9.9, PrimeVue 4.5.5). Pinned source wins over docs (`ultimate/docs/prime-reference/components/<family>.md`).
- Unit: one capability per framework (Angular / React / Vue). Map by function, not by name.
- Classes: C complete, P partial, M missing, I intentional (only with an in-force ADR or user ruling; code comments do not count), N not applicable (Prime lacks it in that framework), U unresolved (only when source cannot decide it).
- Every cell cites exact product AND Prime `path:line`. No `...` paths, no `:*` line placeholders.
- Default-value differences are a `[default-differs]` flag on the row, never a class.
- Four mandatory separate rows in every family: `pt`, `ptOptions`, `unstyled`, per-instance `dt`.
  - `pt`/`ptOptions`: M where that Prime framework offers them, N where it does not.
  - `unstyled`: Angular P (base declares, never reads), React/Vue M where Prime offers it.
  - per-instance `dt`: Angular P, React N (PrimeReact has no `dt` API), Vue M.
- Aura tokens row: Angular/Vue drop to P when the product requests `dt()` paths absent from both Aura and Prime (exact lines in `foundations/shared-foundation-audit.md:124-125`). React is P when it uses hand-written CSS without `dt()` unless the family is an ADR-067 exception (mention, multi-state-checkbox, tri-state-checkbox, data-scroller, button-group, scroll-top, scroller, table).
- Vue root attributes are M/P when `inheritAttrs:false` has no `$attrs` rebind (D-SHARED #2). Label state-class mismatches are a note only (D-SHARED #3), never a counted row.
- A docs/source conflict that changes a class stays U and is listed under "Ruling needed" with the exact citations, two options and a recommendation. Do not self-rule.
- Count mechanically from the cells (script), C/P/M/I/N/U per framework, and state the row count.
- Report format: mapping table; numbered capability matrix; distribution table; default flags; reference defects; ruling needed; verification limits.
- Write reports only to your own scratchpad, one `<family>.md` per family (canonical lowercase name), and return the absolute paths plus counts. The lead promotes them.
