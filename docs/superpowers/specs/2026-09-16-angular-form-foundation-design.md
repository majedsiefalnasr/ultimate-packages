# Angular Form Foundation Tier — `UModelHolder` + `UInputText` (GAP-018)

**Status:** Approved
**References:** `docs/architecture/BLUEPRINT.md` (frozen baseline, not modified by this spec), `docs/architecture/BLUEPRINT_GAPS.md` GAP-018, `docs/architecture/COMPONENT_INVENTORY.md` Form components table, `docs/architecture/DECISIONS.md` ADR-018/ADR-021/ADR-022/ADR-023

**This is a specification, not an implementation plan.** No code changes result from this document. Implementation begins only after a separate plan is written and approved.

All PrimeNG findings below were independently verified this session by direct extraction of `.vendor-cache/primeng-21.1.9.tar.gz` (`scripts/provenance/extract-primeng-source.mjs`), not carried over from `BLUEPRINT_GAPS.md`'s own summary text.

---

## Context

Blueprint Completion closed on `main` at `c3aa820`. `BLUEPRINT.md` is frozen. `BLUEPRINT_GAPS.md` §7/§8 identifies GAP-018 (Angular's missing `BaseModelHolder`/`BaseInput` foundation tier) as the highest-leverage remaining foundation blocker: low risk, proven pattern (the same class of work `UBaseEditableHolder`/`UCheckbox` already did in Phase 2), and it unblocks an entire ~20-component Form family.

A brainstorming session scoped the next workstream to this gap, Angular-only, stopping at one real consumer component (`InputText`) rather than the full Form family — matching Phase 2's own precedent of proving a new base tier with exactly one component before moving on.

### Correction to GAP-018's own framing, found during this session's Real-Source Verification Gate

`BLUEPRINT_GAPS.md`'s GAP-018 entry describes a single combined "`BaseModelHolder`/`BaseInput` foundation tier." Direct extraction of the real pinned source shows this is actually **two distinct tiers**, and `InputText` — the component this workstream targets — only needs the first:

- **`BaseModelHolder`** (`packages/primeng/src/basemodelholder/basemodelholder.ts`, 14 lines): extends `BaseComponent` directly. Adds exactly `modelValue` (a signal), `$filled` (computed from `isNotEmpty(modelValue())`), and `writeModelValue(value)`.
- **`BaseEditableHolder`** (`packages/primeng/src/baseeditableholder/baseeditableholder.ts`, 65 lines): extends `BaseModelHolder`. Adds the `ControlValueAccessor` contract — `required`/`invalid`/`disabled`/`name` inputs, `$disabled`, `onModelChange`/`onModelTouched`, `writeControlValue` (a NOOP hook for subclasses to override), and the four real `ControlValueAccessor` methods (`writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`).
- **`BaseInput`** (`packages/primeng/src/baseinput/baseinput.ts`, 75 lines): extends `BaseEditableHolder` further. Adds `fluid`/`variant`/`size`/`inputSize`/`pattern`/`min`/`max`/`step`/`minlength`/`maxlength` inputs plus `$variant`/`hasFluid`.

Verified by direct grep of the full extracted `packages/primeng/src/` tree: `InputText` and `Textarea` extend **`BaseModelHolder` directly** — neither uses `BaseEditableHolder` or `BaseInput`. `BaseInput` is extended only by `InputMask`, `Password`, `AutoComplete`, `DatePicker`, `InputNumber`, `Select` — a materially richer, later tier. `BaseEditableHolder` (without `BaseInput`) is extended by `TreeSelect`, `Rating`, `RadioButton`, `ToggleSwitch`, `Listbox`, `Checkbox`, `ToggleButton`, `SelectButton`, `Slider`, `InputOtp`, `ColorPicker`, `Knob`, `MultiSelect`, `CascadeSelect`, `Editor`.

Angular's existing `UBaseEditableHolder` (`packages/ng-core/src/base-editable-holder/base-editable-holder.ts`) already implements real PrimeNG's `BaseEditableHolder` contract (CVA methods, `disabled`/`$disabled`) — confirmed by direct read — but has **no `modelValue`/`$filled`/`writeModelValue` glue at all**. That gap is real `BaseModelHolder`'s entire content, folded one level below where Angular's own hierarchy currently starts.

**Decision (see brainstorming session):** this workstream builds only the `BaseModelHolder`-equivalent tier — exactly what `InputText` needs, matching real PrimeNG's own scoping exactly. The richer `BaseInput`-equivalent tier is explicitly deferred to whichever future component (most likely `InputNumber` or `Password`) first needs it. Building `BaseInput` now would be speculative — no real consumer proves it in this workstream, the same situation `@ultimate/uix-data` is already in for its own unconsumed primitives.

---

## Objective

Close GAP-018's real, narrower scope: give `@ultimate/ng-core` a `modelValue`/`$filled` tier equivalent to real PrimeNG's `BaseModelHolder`, positioned correctly in the existing `UBaseComponent` → `UBaseEditableHolder` chain, then migrate `InputText` as `@ultimate/ng`'s first native-input Form component — proving the tier end-to-end the same way `UCheckbox` proved `UBaseEditableHolder` in Phase 2.

---

## Architecture

### Where the new tier sits

Real PrimeNG's chain is `BaseComponent → BaseModelHolder → BaseEditableHolder → BaseInput`. Angular's existing chain is `UBaseComponent → UBaseEditableHolder` (already folding in the `BaseEditableHolder`-equivalent CVA contract, per ADR-018's Option-B scoping). Two placement options:

1. **Insert a new `UModelHolder` between `UBaseComponent` and `UBaseEditableHolder`**, matching real PrimeNG's literal ordering exactly. `UBaseEditableHolder extends UModelHolder` becomes the new chain. `InputText` would then need its own minimal directive extending `UModelHolder` directly (skipping `UBaseEditableHolder`, matching real `InputText extends BaseModelHolder` exactly) — but `InputText` still needs `disabled`, which today only exists on `UBaseEditableHolder`. Real PrimeNG's own `InputText` does **not** get `disabled` from its base chain at all — it has no `disabled` input of its own either (confirmed: not present in the extracted `inputtext.ts`). This is a genuine, confirmed real-source asymmetry, not an oversight to "fix."
2. **Add `modelValue`/`$filled`/`writeModelValue` directly onto the existing `UBaseEditableHolder`**, since Angular's hierarchy already collapsed `BaseEditableHolder` one level up from where PrimeNG's sits, and `InputText` in Ultimate's world will use whatever tier already carries `disabled`/`invalid` for consistency with the rest of the proof set (every existing Ultimate form component — `UCheckbox` — reads `disabled` from `UBaseEditableHolder`).

**Recommendation, to be confirmed during implementation planning, not decided here:** Option 1 (insert `UModelHolder` as its own class) is more faithful to real PrimeNG's structure and leaves room for the deferred `BaseInput`-equivalent tier to slot in later exactly where real PrimeNG puts it. `InputText`'s own class extends `UModelHolder` directly (mirroring `extends BaseModelHolder` exactly) and declares its own local `invalid`/`fluid`/`variant` inputs — which is what real `InputText` does today (confirmed: `invalid`, `fluid`, `variant` are all declared locally on `InputText`, not inherited). This avoids inventing a `disabled` capability real `InputText` doesn't have. Final placement is an implementation-plan decision, informed by this finding, not pre-committed here.

### `UModelHolder` (new file, `packages/ng-core/src/model-holder/`)

Mirrors real `BaseModelHolder` exactly (14 lines of real source, minimal surface):
- `modelValue` — a signal, initial value `undefined`.
- `$filled` — computed from an Ultimate `isNotEmpty`-equivalent check on `modelValue()`. `@ultimate/uix-utils` is checked first for an existing `isNotEmpty`/`isEmpty` helper before adding a new one (verify during implementation — `@primeuix/utils`' `isNotEmpty` is the real upstream source this maps to).
- `writeModelValue(value)` — sets the signal.

No passthrough, no `PT` typing — matches GAP-021's three-times-convergent exclusion.

### `UInputText` (new component, `packages/ng/src/input-text/`)

A directive with selector `[uInputText]`, matching real PrimeNG's `[pInputText]` shape exactly (an attribute directive applied to a native `<input>`, not a wrapping component) — this is real PrimeNG's actual architecture, confirmed by direct source read, not a Ultimate design choice to diverge from.

Real, in-scope surface (confirmed present on real `InputText`, independent of the `pt`/`PassThrough` system which is excluded):
- `variant` (`'filled' | 'outlined' | undefined`), `fluid` (boolean), `invalid` (boolean) — declared locally, per the real source's own local-declaration pattern.
- `$variant` computed from `variant()` falling back to config (Ultimate's `UltimateConfig` equivalent — confirmed existing pattern from `UBaseComponent`'s `config` injection, per ADR-018).
- `hasFluid` getter — `fluid() ?? !!<ancestor Fluid directive>`, matching the existing `UFluid`/ancestor-detection pattern already proven by `UButton` (per ADR-018's own text: "Button's badge/Fluid ancestor-detection wiring").
- CVA wiring via `NgControl` injection (`optional: true, self: true`) — write model value from `ngControl?.value ?? <native input>.value` on `AfterViewInit` and `DoCheck`, and on native `input` events (`@HostListener('input')`).
- `data-p` host attribute reflecting `invalid`/`fluid`/`filled` state, matching the real source's `dataP` getter and `inputtextstyle.ts`'s `p-filled`/`p-invalid`/`p-inputtext-fluid`/`p-variant-filled` class conditions.

Explicitly excluded (per GAP-021, ADR-018's Option-B posture, no new fork needed — same exclusion already made three times):
- `pt`/`ptInputText`/`pInputTextPT`/`pInputTextUnstyled` passthrough inputs and the `Bind` host-directive wiring that serves them.
- `hostName`, `$pcInputText` sibling-instance lookup, `PARENT_INSTANCE` token — DI-token parent-instance lookup already excluded platform-wide per ADR-018.
- `pSize`/`inputSize` and the `NgModule` re-export wrapper (`InputTextModule`) — Angular's platform-wide standalone-only decision, ADR-019, already forbids new `NgModule` authorship.

### Styling

New `packages/ng/src/input-text/input-text-style.ts`, following the existing `checkbox-style.ts` pattern exactly (an `NgCoreStyleSheet`-registered class importing from `@primeuix/styles/inputtext` via `uix-styles`, per ADR-017's scope and GAP-003's now-working injection path). `p-filled`/`p-invalid`/`p-inputtext-fluid`/`p-variant-filled` class conditions carried over from the real `inputtextstyle.ts` `classes.root` function, renamed to Ultimate's own class-name convention (matching every existing component's namespace-rename precedent).

### Testing

`packages/ng/src/input-text/input-text.spec.ts`, using the Angular CLI Vitest builder + zoneless `TestBed` (ADR-022's established pattern, including its documented `markForCheck()`/`detectChanges(false)`/`whenStable()` fix for double-mutation `NG0100` errors where applicable). Coverage drawn from real `inputtext.spec.ts`'s non-PT-dependent blocks (confirmed present: Basic Functionality, Advanced Features — size/variant/fluid/invalid, Reactive Forms, Input Types, Edge Cases, Input Events) — the "PassThrough (PT) Tests" `describe` block (≈180 lines, the largest single block in the real spec file) is **not** ported, per the same PT-exclusion decision. `UModelHolder`'s own `model-holder.spec.ts` tests `modelValue`/`$filled`/`writeModelValue` directly, matching `base-editable-holder.spec.ts`'s existing test-file-per-tier convention.

---

## Non-Goals

- No `BaseInput`-equivalent tier. No `InputNumber`/`Password`/`InputMask`/`AutoComplete`/`DatePicker`/`Select` migration.
- No second Form component beyond `InputText` (e.g. no `Textarea`, even though real PrimeNG's `Textarea` is a sibling `BaseModelHolder` consumer — deferred to a future workstream to keep this one reviewable and matched to Phase 2's one-new-tier-one-consumer precedent).
- No passthrough (`pt`/`ptm`/`ptmo`) system.
- No React or Vue changes. No audit of whether `react-core`/`vue-core` have an equivalent tier (GAP-018's own React/Vue `UNVERIFIED` flag stays open, explicitly deferred to its own future workstream per the brainstorming session's decision).
- No changes to `BLUEPRINT.md`.
- No `apps/playground-angular` consumer wiring (GAP-008 stays untouched).

---

## Provenance and documentation updates (part of this workstream's scope)

- `docs/architecture/provenance/ng-core.json` — new entry for `UModelHolder`, citing `packages/primeng/src/basemodelholder/basemodelholder.ts` at commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`.
- `docs/architecture/provenance/ng.json` — new entry for `UInputText`, citing `packages/primeng/src/inputtext/inputtext.ts` at the same commit.
- `docs/architecture/COMPONENT_INVENTORY.md` — the `BaseModelHolder / BaseInput (foundation tier, not yet built)` row is split: a new "built" row for the `UModelHolder`-equivalent slice; the remaining `BaseInput`-equivalent slice gets its own still-remaining row, explicitly separated (matching the existing `config`/`icons` split-scope row precedent, §2's "14 + 2 + 101" accounting style). `InputText` row moves from the remaining Form table to the built table.
- `docs/architecture/BLUEPRINT_GAPS.md` — GAP-018 marked `RESOLVED` for the `BaseModelHolder`-equivalent slice specifically, with a new sibling entry (next available GAP number) recording the `BaseInput`-equivalent tier as the correctly-narrower remaining scope — mirroring GAP-009's own "resolved as amended, narrower than originally scoped" pattern.
- A new ADR recording this session's two-tier finding and the Option-B scoping decision for `UModelHolder`/`UInputText`, following ADR-018/024/032's established format — decided as part of the implementation plan, not pre-written here.

---

## Exit Criteria

- `UModelHolder` builds, is tested, and correctly sits in the `UBaseComponent`/`UBaseEditableHolder` chain per the placement decision made during implementation.
- `UInputText` builds as an attribute directive (`[uInputText]`), passes CVA/reactive-forms/template-driven-forms tests, and reflects `invalid`/`fluid`/`variant`/`filled` state via host attributes and CSS classes matching real PrimeNG's verified behavior.
- Zero duplicate CVA/value-binding logic between `UModelHolder` and `UInputText` (the entire point of building the tier).
- `UInputText` passes the same CI gate bar as the existing 8-component proof set: `boundary:validate`, coverage-regression gate, bundle-size-regression gate, accessibility scan (Track A), cross-browser Playwright (Track A) — no new CI job required, existing gates already cover any new package content.
- `BLUEPRINT.md` is not modified.
