# Angular numeric, date, color and file inputs — issue #119

Implements live [#119](https://github.com/majedsiefalnasr/ultimate-packages/issues/119)
under [#98](https://github.com/majedsiefalnasr/ultimate-packages/issues/98).
Source revision: `73cc77945ad2e4213695c2d140166822dc1ad12c`.
Start at the [generated index](index.md) and [validation](validation.md).
This is bounded coverage, not platform closeout, parity or defect-free certification.

## Authorship and ownership

Edit `scripts/inventory/angular-numeric-date-color-file.json`, not generated details. The existing
pilot pipeline and family-alias resolution are reused unchanged. Scope: input-number,
date-picker, color-picker and file-upload under `packages/ng/src`. Each family owns its
index, component and style module. `spec.ts` and `stories.ts` files are explicit
supporting-file exclusions; every scoped file has an owner or exclusion.

Entry points differ by family, and each record states its own: input-number is exported
only from the `@ultimate/ng/input-number` manifest subpath and is not re-exported by the
root barrel; date-picker and color-picker have both a manifest subpath and a root barrel
re-export; file-upload is re-exported by the root barrel only, with no `./file-upload`
manifest subpath and no `packages/ng/file-upload` entry-point directory.

Family aliases (`package.ultimate.ng.<family>`) resolve to the four records; none are
same-ticket pending. `package-coverage.json` already reserved these aliases for #119 and is
unchanged. Identities owned by other tickets stay explicitly pending with their owning
ticket in validation: ng-core base classes and overlay (ticket 148), `ng.fluid` and
`ng.progress-bar` (140), themes presets (151) and `uix-styles.inputnumber` (146);
relationships here do not complete those tickets. The Aura registry keys were checked
against `packages/themes/src/presets/aura/index.ts`: they are `inputnumber`, `datepicker`,
`colorpicker` and `fileupload`, which differ from the hyphenated folder and selector names.
No component-metadata record exists for any of the four families. Only input-number has
an `@ultimate/uix-styles` export (`inputnumber`) and is linked to it; the other three have
no dedicated export, so no uix-styles relationship is linked for them.

Regenerate and validate from a checkout with dependencies, under Node 24.15.0:

```sh
node scripts/inventory/pilot.mjs --root . --input scripts/inventory/angular-numeric-date-color-file.json --out docs/inventory/angular-numeric-date-color-file
node --test scripts/inventory/*.test.mjs
pnpm exec eslint scripts/inventory/angular-numeric-date-color-file.test.mjs
pnpm exec prettier --check scripts/inventory/angular-numeric-date-color-file.json scripts/inventory/angular-numeric-date-color-file.test.mjs docs/inventory/angular-numeric-date-color-file
```

## Executed evidence

Executed locally: `node --test scripts/inventory/*.test.mjs`, scoped ESLint on the new
test and Prettier on the new files, using the main checkout's installed tooling through
a temporary symlink (not committed) because the worktree has no `node_modules`.

## Product check: unavailable / not run

The bounded Angular suite (`pnpm --filter @ultimate/ng exec ng test ...`, see each
record's claim) was **not run**: the task limited local load (no `ng test`, build or
Storybook) and the worktree has no installed dependencies. No product assertions were
executed, so nothing is claimed about runtime behavior. Spec files present are not pass
evidence. CI enforcement is recorded as workflow configuration only; no CI run was
observed. No parity or gap judgment is made. The few numeric edge cases noted below
(`NaN`, `formatSize`) were reasoned from source and checked with plain Node arithmetic,
not by running the components.

## Source observations (recorded, not repaired)

Each item is recorded in the named record's surface, read from source and not repaired:

- input-number declares no outputs. Text that is not a number becomes `NaN` through an
  unguarded `Number()` and is not clamped. `onModelTouched` runs on every input event.
  `writeControlValue` also calls `onModelChange`. `variant` and `size` are not read, and the
  template binds no aria-label or label association.
- date-picker never reads `dateFormat`; the rendered text is always mm/dd/yyyy.
  `onSelect` emits a plain `Date` while the exported `UDatePickerSelectEvent` is unused.
  `clear()` does not call `onModelTouched`, `writeControlValue` does not call
  `onModelChange`, and an invalid `Date` renders `NaN/NaN/NaN` with an empty day grid.
  No focus call exists, keyboard navigation can land on disabled dates, and there is no
  Home, End, PageUp or PageDown handling.
- color-picker never reads `autoZIndex`. Escape and Tab call `hide()` unconditionally, so
  `onHide` is emitted even when the panel is closed. Selection is mouse-only, there is no
  click-outside handling, and document drag listeners have no destroy cleanup.
  `hexToRgb` does not validate or expand short hex values.
- file-upload has no `ControlValueAccessor`. A drop of several files in single mode is
  ignored silently, `onSelect` also reports rejected files, `clear()` emits `onClear`
  even when empty, and `formatSize` caps the unit label at TB without capping the
  divisor. The `fileThumbnail` class is defined but unused, and validation messages carry
  no role or live region.
- All four components inherit `dt` and `unstyled` from the base class; neither is read in
  ng-core. The Aura token spec lists approved unresolved CSS variables for date-picker (9),
  color-picker (1) and file-upload (11), none for input-number; that spec was not run here.

The full wording and conditions are in the records.

## Local review

Standards and Spec reviews were done directly without spawning. Standards: existing
inventory API/schema reused, no pipeline or product changes, no new dependencies,
English artifacts, scoped staging. Spec: inputs, outputs, base tiers, accessor wiring,
overlay composition, style helpers, barrel and manifest entry points were read from source
and conditional behaviour was checked against each emit or usage site and against the
sibling components; byte-exact generation and preserved authorship are tested. Owner
review remains outstanding.
