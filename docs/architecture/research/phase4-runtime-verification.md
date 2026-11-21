# Phase 4 runtime verification (ticket #169, spec #167)

> **Temporary evidence file.** This file records runtime checks for ticket #169. It is not a source of truth for architecture. It must be deleted in the parent's final cleanup of spec #167. The Phase 4 reports under `docs/architecture/research/phase4/` were not edited (rule Q4); the parent decides any reclassification.

Scope: evidence only. No product code was changed. Items covered:

1. MeterGroup Angular row 5 (vertical geometry).
2. Timeline Angular row 8 (consumer class, style and attribute coexistence).
3. Angular aria and root-attribute probes for Card, Chip, ToggleButton, Tag, Paginator and Carousel (compared with the Prime oracle, PrimeNG 21.1.9, `docs/prime-reference/components/`).

## Environment

| Item              | Value                                                                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Branch            | `test/169-runtime-verification`, from `feat/gap-foundations` (003906d7)                                                                                                                                                                                      |
| Node / pnpm       | v24.22.2 / 9.6.0                                                                                                                                                                                                                                             |
| Unit runner       | `ng test --project=ng` (jsdom)                                                                                                                                                                                                                               |
| Browser           | Chromium 158, headless, 1280x720, DPR 1, driven with `playwright-cli`                                                                                                                                                                                        |
| Ultimate harness  | a throwaway Angular app inside `packages/ng`, with no CSS files, calling `applyUltimateTheme()`                                                                                                                                                              |
| Prime oracle      | a throwaway Angular 21.2.22 app in `/private/tmp`, PrimeNG 21.1.9, `@primeuix/themes` 2.0.3, Aura preset                                                                                                                                                     |
| Local build issue | `ng build` aborts inside the sandbox (SIGABRT, exit 134) and works when run unsandboxed. The known `~/postcss.config.mjs` / missing `postcss-import` issue did not occur because the harness apps have no CSS files. `~/postcss.config.mjs` was not touched. |

The probe spec, the harness app and the oracle app were throwaway and are not committed.

## 1. MeterGroup Angular row 5: vertical geometry

**Method.** Browser, computed bounding rects of the host, the `.u-meter-group` root and the meter bar, for the same `orientation="vertical"` content rendered by Ultimate and by PrimeNG. `applyUltimateTheme()` is required: without it every Ultimate bar is 0px, including the horizontal one.

**Observed values (meter bar width x height).**

| Case                                  | Ultimate                                      | PrimeNG 21.1.9                |
| ------------------------------------- | --------------------------------------------- | ----------------------------- |
| A: vertical, no height set            | 8x0; host is `display:inline`                 | 8x96; host gets `height:96px` |
| B: host `style` height 300px          | 8x0; host is inline, so the height is ignored | 8x300                         |
| C: host `display:block`, height 300px | 8x0; root is 96px and is not stretched        | 8x300                         |
| D: parent is a 300px flex column      | 8x300; segments 48 / 24 / 72 / 30             | 8x300; same segments          |
| E: horizontal                         | 497.9x8; segments 79.7 / 39.8 / 119.5 / 49.8  | identical                     |

**Result: verified divergence.** Vertical meters render at 0px height in the common cases (A to C) in Ultimate, where PrimeNG gives 96px by default and honours a consumer height. The layout matches only when the parent already provides a definite height (D), and horizontal layout matches (E).

**Observed root causes.**

- No height stabilization. The behaviour the Prime baseline has at P-N:237-240 (a default `96px` host height for vertical orientation) has no equivalent.
- `.u-meter-group` styles the inner root element, not the host, so a consumer height or `display` on the host does not reach the bar.

**Classification input.** The evidence supports "partial" or "missing" for row 5, not "verified". The report is frozen, so the parent decides.

## 2. Timeline Angular row 8: consumer attributes

**Method.** jsdom probe via `ng test --project=ng`, rendering the component with consumer-supplied class, style and attributes and reading the host element, including after binding updates.

**Observed.**

- Static and dynamic consumer `class` and `style` coexist with `u-component u-timeline u-timeline-vertical`.
- Bound `[class]` and `[style]` replace only their own previous values; the component classes stay.
- Consumer `id`, `role`, `aria-*`, `title`, `tabindex` and `data-*` reach the host.
- No `align` class is emitted, which is consistent with the already-known align gap.

**Result: verified (jsdom only).** No real-browser style computation was done for Timeline.

## 3. Aria and root-attribute probes

**Method.** Each Ultimate component was rendered in jsdom (98 recorded observations across 41 passing tests) and in the browser harness. The PrimeNG 21.1.9 component was rendered in the oracle app. Root class, style, attributes, role, tabindex, aria attributes and dynamic updates were compared, together with the documented Prime behaviour in `docs/prime-reference/components/`.

**Common result.** For all six components, class, style and attribute coexistence and dynamic updates match PrimeNG. Caveat: for Card the oracle received its style through the `style` input, so the style comparison there is not like-for-like.

**Interactions.** Ultimate interactions were checked in jsdom with change detection flushed: ToggleButton toggles on click, Enter and Space and is blocked when disabled; Chip removes on Backspace and Enter and is blocked when disabled. The PrimeNG interaction snapshots (chip remove, toggle click and keys) were taken without a change-detection flush (the toggle still showed `data-p-checked="false"` after a click), so they are **invalid and not used**. Interaction parity with PrimeNG is therefore not established.

### Verified divergences

| Component    | Ultimate                                                                                                                                                                                                                             | PrimeNG 21.1.9                                                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Chip         | The remove control has no default `aria-label`.                                                                                                                                                                                      | Remove control uses "Remove" from the config.                                                                                                                                  |
| ToggleButton | Disabled `tabindex` is -1; the root also carries the Prime class `p-disabled`.                                                                                                                                                       | Disabled `tabindex` is 0 (the documented Prime caveat).                                                                                                                        |
| Tag          | No `data-p` attribute on the root.                                                                                                                                                                                                   | `data-p="info"` on the root.                                                                                                                                                   |
| Paginator    | Controls are wrapped in a `<nav>` inside the host; `data-page*` state is exposed on the host; First is disabled on page 1 through the `disabled` attribute; with zero records Next and Last stay enabled; page labels read "Page N". | No `<nav>` wrapper; First on page 1 is disabled by class only; with zero records all four buttons are disabled; page labels read "N".                                          |
| Carousel     | Slides have no `aria-label` or `aria-roledescription`; indicator buttons have no roving `tabindex`; navigator labels are "Previous" / "Next".                                                                                        | Indicators use `tabindex` 0 / -1; the config labels are "Previous Page" / "Next Page" (the PrimeNG navigator buttons were not captured, so this label comes from config only). |

### Matches

- Chip: role and `tabindex` match (0, or -1 when disabled).
- All six: class, style, attribute coexistence and dynamic updates (see the Card caveat above).

### Unexplained

- The PrimeNG Carousel root rendered with id `pn_id_3` even though the consumer passed an `id`. Seen once, not investigated.

## Limits

- The Timeline check is jsdom only. It does not cover browser-computed styles.
- The PrimeNG interaction snapshots are invalid (no change-detection flush) and were not re-run, because the ticket did not require interaction parity.
- Browser geometry was measured only in Chromium 158 at 1280x720, DPR 1, with no app CSS beyond the Ultimate theme and the Aura preset.
- Paginator and Carousel were compared on rendered attributes, not on full keyboard behaviour.

## Cleanup

Delete this file in the parent's final cleanup of spec #167.
