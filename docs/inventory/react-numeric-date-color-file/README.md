# React numeric, date, color and file inputs — issue #120

Implements live [#120](https://github.com/majedsiefalnasr/ultimate-packages/issues/120)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `e99d41249677496cf6c531576dd6e1c181544883`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage of four families, not platform closeout.

## Authorship and ownership

Edit `scripts/inventory/react-numeric-date-color-file.json`, not generated details. The
existing pilot pipeline is reused unchanged. Families: input-number, date-picker,
color-picker and file-upload. Each record owns its component, props and event types, local
style module and index barrel. Specs and stories (eight files) are explicit
supporting-file exclusions; every other scoped file has an owner.

Root and secondary entries resolve to the same records; #106 family identities are
aliases (`package.ultimate.react.<family>`), never same-ticket pending entries. Pending
identities owned elsewhere: `react-core` base and styling (#149), theme presets (#151)
and, for file-upload only, `react.progress-bar` (#141), because file-upload imports
`UProgressBar`. Links are recorded only where source supports them. The Aura registry
(`packages/themes/src/presets/aura/index.ts`) has keys `inputnumber`, `datepicker`,
`colorpicker` and `fileupload`; the componentNames `input-number`, `date-picker` and
`file-upload` differ from those keys, while color-picker uses `colorpicker`. No
component-metadata record exists for any of the four families, so no metadata relationship
is recorded. Only color-picker imports `@ultimate/uix-styles` (`./colorpicker`); the
dependency is described in its surface and not linked, as in the choice-range Knob record.

Regenerate and validate from a checkout with dependencies, under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/react-numeric-date-color-file.json --out docs/inventory/react-numeric-date-color-file
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/react-numeric-date-color-file.test.mjs
pnpm exec prettier --check scripts/inventory/react-numeric-date-color-file.json scripts/inventory/react-numeric-date-color-file.test.mjs docs/inventory/react-numeric-date-color-file
```

## Executed evidence

Executed locally: `node --test scripts/inventory/*.test.mjs`, scoped ESLint on the new
test and Prettier on the new files, using the main checkout's installed tooling through a
temporary symlink (not committed) because the worktree has no `node_modules`.

## Product check: not run

The bounded product check

```sh
pnpm --filter @ultimate/react exec vitest run src/input-number/ src/date-picker/ src/color-picker/ src/file-upload/
```

was **not run**: the task forbade vitest, builds, Storybook and installs to limit local
load. No product assertions, rendering or accessibility tests were executed, so nothing is
claimed about runtime behavior; every observation below was read from source (a few
arithmetic and parsing statements were also replayed in plain Node). Spec files present
are not pass evidence. CI enforcement is recorded as workflow configuration only
(`.github/workflows/ci.yml` root `pnpm run test`); no CI run was observed. No parity or
gap judgment is made.

## Source observations (recorded, not repaired)

Each item is recorded in the named record's surface and was checked against the usage
sites in all four components:

- Among the four, only input-number and color-picker are forwardRefs.
  date-picker and file-upload are plain function components.
  None of the four uses `createPortal`, `aria-controls`, `useId`, `useEffect`, `window.`
  or `aria-live`; only color-picker uses `useImperativeHandle` (its ref handle) and
  `focus(` (`autoFocus` and the handle's `focus`).
- Only color-picker registers document listeners (`mousemove` and `mouseup`, or `touchmove`,
  `touchend` and `touchcancel`, added on each press and removed when the drag ends or on
  unmount).
  Among the two overlay components only date-picker has no outside-click or blur handler;
  color-picker closes on an outside click through `useOverlayListener`. Both stay open
  when `disabled` becomes true.
  input-number and file-upload are inline and have no overlay.
- input-number: every blur emits `onValueChange`; the focus text is `String(value)`, which
  a locale with `.` group and `,` decimal separators parses as a different number (12345 for
  1234.5 in de, pt-BR, nl, tr, es and it; en, fr, pl, ru and pt-PT are unaffected); percent mode does not scale; `Intl.NumberFormat` construction
  can throw during render; the key handler calls `preventDefault` for ArrowUp and ArrowDown
  without checking `disabled` or `readOnly`; while focused, a step or an external `value` change
  does not update the shown text, so the next blur emits the stale typed text.
- date-picker: fixed MM/DD/YYYY format, Sunday-first grid, `today` captured once per
  mount, `setViewYear` called inside the `setViewMonth` updater, years 0 to 99 mapped to
  the 1900s, no `focus()` call so DOM focus does not follow the roving cell, clear and icon
  controls are not keyboard operable.
- color-picker: 3-digit hex misparses (`#fff` gives 0, 15, 255), gray and black convert to
  `h = 300`, hex is emitted without `#` as in PrimeReact, color changes are pointer-only
  and the panel has no role or label, as in PrimeReact source (ADR-104).
- file-upload: accept `*/*` rejects every file, `formatSize` yields `512.00 TB` for 0.5 and
  `NaN TB` for negatives, `onSelect` fires even when every file is rejected, Cancel does not
  abort an in-flight request, the Upload and Cancel buttons do not read `disabled`, there is
  no `onerror` or `onabort` handler, and messages have no role or `aria-live`.
- Only input-number's CSS reads custom properties (`var(--u-inputtext-*)`); date-picker,
  color-picker and file-upload style modules contain no `var(--` (color-picker imports the
  shared module, whose tokens are `dt()` placeholders). The class names
  `u-inputnumber-focus`, `u-inputnumber-button-up` and `u-inputnumber-button-down` have no
  CSS rule, and `FileUploadClassesParams.disabled` is never read by any class resolver.

## Local review

Standards and Spec reviews were done directly without spawning. Standards: existing
inventory API/schema reused, no pipeline or product changes, no new dependencies, English
artifacts, scoped staging, node_modules symlink removed before commit. Spec: props, state,
overlay composition, accessibility, style modules and manifest subpaths were read from
source and each conditional claim was re-grepped against every usage site and every sibling
component (forwardRef, absent-pattern, document-listener, outside-click and `var(--`
claims are asserted by the test across all four); the Angular #119 record was consulted
only as a hypothesis. Byte-exact generation and preserved authorship are tested. Owner
review remains outstanding.
