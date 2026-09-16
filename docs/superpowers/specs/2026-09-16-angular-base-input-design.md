# Angular `UBaseInput` Tier + `InputNumber` Proof + `writeControlValue` Bridge (GAP-038)

**Status:** Approved
**References:** `docs/architecture/BLUEPRINT.md` (frozen baseline, not modified by this spec), `docs/architecture/BLUEPRINT_GAPS.md` GAP-038, `docs/architecture/COMPONENT_INVENTORY.md` Form components table, `docs/architecture/DECISIONS.md` ADR-018/ADR-021/ADR-022/ADR-046, `docs/superpowers/specs/2026-09-16-angular-form-foundation-design.md` (GAP-018, the prior workstream this one continues)

**This is a specification, not an implementation plan.** No code changes result from this document. Implementation begins only after a separate plan is written and approved.

All PrimeNG findings below were independently verified this session by direct extraction of `.vendor-cache/primeng-21.1.9.tar.gz` (`scripts/provenance/extract-primeng-source.mjs`), not carried over from `BLUEPRINT_GAPS.md`'s own summary text.

---

## Context

GAP-018 closed on `main` at `f02e3a2`. `UModelHolder` (`packages/ng-core/src/model-holder/`) now sits in the chain `UBaseComponent → UModelHolder → UBaseEditableHolder`, and `UInputText` proved the `BaseModelHolder`-equivalent tier end-to-end. That workstream's own GAP-038 entry and ADR-046 both flagged two pieces of correctly-deferred follow-up:

1. **`UBaseInput`** — the richer tier (`fluid`/`variant`/`size`/`inputSize`/`pattern`/`min`/`max`/`step`/`minlength`/`maxlength`) that real PrimeNG's `InputMask`/`Password`/`AutoComplete`/`DatePicker`/`InputNumber`/`Select` all extend, but `InputText` does not. Deferred because no real consumer justified building it speculatively.
2. **The `writeControlValue` bridge** — real PrimeNG's `BaseEditableHolder.writeValue` calls `this.writeControlValue(value, this.writeModelValue.bind(this))`, letting subclasses populate `modelValue`/`$filled` by implementing `writeControlValue`. Ultimate's `UBaseEditableHolder` has no such bridge — `writeValue` stays a bare `abstract` method — so `modelValue`/`$filled` are inherited-but-permanently-dead on every current `UBaseEditableHolder` subclass (`UCheckbox` specifically: it writes only to its own `checked` signal, never to `writeModelValue`).

A brainstorming session scoped the next workstream to close both, using `InputNumber` as the `UBaseInput` proof consumer (chosen over `Password` — `Password` is Low risk on paper but adds overlay/strength-meter/mask-toggle concerns unrelated to proving the tier itself; `InputNumber` is Medium risk but the complexity is exactly the `fluid`/`variant`/`size`/`pattern`/`min`/`max`/`step` surface `UBaseInput` exists for).

### `writeControlValue` clarification (added after design review)

The initial design presented the bridge only at the level of "add the mechanism real PrimeNG has." A follow-up review required this spec to state the exact contract before implementation, since it touches `UCheckbox` — a real, shipped, tested component — not just new code.

**Exact signature, verified against real `baseeditableholder.ts`:**

```typescript
writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void
```

**Default behavior in `UBaseEditableHolder`:** a NOOP. Real PrimeNG's own comment states this exactly: *"NOOP - this method should be overridden in the derived classes."* `UBaseEditableHolder`'s default implementation does nothing — it exists so `writeValue` always has something to call, not so it has meaningful default behavior.

**The bridge's exact wiring, verified against real source:**

```typescript
// UBaseEditableHolder — final, not overridable by subclasses
writeValue(value: unknown): void {
  this.writeControlValue(value, this.writeModelValue.bind(this));
}
```

`writeValue` remains the one real `ControlValueAccessor` method Angular Forms calls. It is no longer implemented per-subclass (as `UCheckbox` currently does) — it becomes a fixed, non-overridden method on `UBaseEditableHolder` itself, always constructing and passing `this.writeModelValue.bind(this)` as the `setModelValue` callback. Subclasses only ever override `writeControlValue`, never `writeValue` again.

**Ownership contract, stated explicitly:**

- `setModelValue` (i.e. `writeModelValue`, per `UModelHolder`, GAP-018) is **the controlled path** for updating `modelValue`/`$filled`. A subclass's `writeControlValue` override calls it with whatever value the subclass wants reflected into `modelValue` — this is not optional plumbing, it is the entire reason the bridge exists.
- **The hook may transform the value before calling `setModelValue`**, and may call it with a value different from the raw CVA `value` argument (real PrimeNG's own contract: `writeControlValue` receives the raw form-control value, and decides what to hand `setModelValue`). A subclass may also choose to derive additional local state from `value` in the same override (e.g. `UCheckbox` will keep updating its own `checked` signal here) — but it must not bypass `setModelValue` entirely if it wants `modelValue`/`$filled` populated. There is no other path into `modelValue` from the CVA `writeValue` entry point; skipping the call to `setModelValue` inside `writeControlValue` is a valid choice (matches real PrimeNG's own NOOP default) but means `modelValue` stays unpopulated for that subclass, which is precisely the currently-live, in-fact-existing failure mode this workstream is fixing for `UCheckbox` specifically.
- `UBaseInput` (the new richer tier) **must not** introduce or duplicate any `ControlValueAccessor` surface. It extends `UBaseEditableHolder`, inheriting the CVA contract (including the now-fixed bridge) unchanged. `UBaseInput` itself adds no `writeValue`/`writeControlValue` override of its own — it is a pure input/config surface (`fluid`/`variant`/`size`/etc.) on top of the existing editable-holder contract, exactly as real PrimeNG's own `BaseInput` has no CVA-related code at all (confirmed: zero `writeValue`/`writeControlValue`/`ControlValueAccessor` references anywhere in the extracted `baseinput.ts`).

### `UCheckbox`'s specific bridge wiring

Real PrimeNG's own `Checkbox.writeControlValue` is:

```typescript
writeControlValue(value: any, setModelValue: (value: any) => void): void {
  setModelValue(value);
  this.cd.markForCheck();
}
```

Real Checkbox derives its own `checked` getter **directly from `modelValue()`** (`this.binary ? this.modelValue() === this.trueValue : contains(this.value, this.modelValue())`) — `modelValue` is real Checkbox's actual state source, not a side channel.

**Ultimate's `UCheckbox` is architecturally different and stays that way in this workstream:** `UCheckbox` has its own separate `checked` signal (`readonly checked = signal(false)`), which is the real, tested, template-bound state source today. This spec does **not** change `UCheckbox` to derive `checked` from `modelValue()` — that would be a materially larger behavioral refactor than "wire the bridge," is not what GAP-038/ADR-046 asked for, and risks the exact regression this spec's own regression criteria (below) exist to catch.

Instead, `UCheckbox`'s fix is additive:

- Remove `UCheckbox`'s current `writeValue(value: unknown): void { this.checked.set(!!value); }` override entirely (this becomes `UBaseEditableHolder`'s fixed `writeValue`, per the bridge above).
- Add `writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void` to `UCheckbox`, which does what `writeValue` used to do (`this.checked.set(!!value)`) **and** calls `setModelValue(value)` to populate `modelValue`/`$filled` in parallel.
- `UCheckbox`'s `toggle()` method (the user-interaction path — click/Space key) currently sets `checked` and calls `onModelChange`/`onModelTouched` but never touches `modelValue`. This spec requires `toggle()` to also call `this.writeModelValue(next)` (the same setter the bridge exposes), so `modelValue`/`$filled` stay in sync on **both** CVA-driven writes (`writeControlValue`) and user-driven writes (`toggle`) — not just the CVA path. Without this, `modelValue` would silently go stale the moment a user clicks the checkbox, defeating the fix's own purpose.

---

## Objective

Close GAP-038's `UBaseInput` tier and the `writeControlValue` bridge gap ADR-046 recorded, using `InputNumber` as the real proof consumer for `UBaseInput` and `UCheckbox` as the real proof consumer for the bridge.

---

## Architecture

### `UBaseInput` (new, `packages/ng-core/src/base-input/`)

Extends `UBaseEditableHolder` directly (chain becomes `UBaseComponent → UModelHolder → UBaseEditableHolder → UBaseInput`, matching real PrimeNG's `BaseComponent → BaseModelHolder → BaseEditableHolder → BaseInput` ordering exactly — the same real-source-verified insertion-point discipline GAP-018 applied to `UModelHolder`).

Real, in-scope surface (verified against real `baseinput.ts`, 75 lines):
- `fluid` (boolean), `variant` (`'filled' | 'outlined' | undefined'`), `size` (`'large' | 'small' | undefined`), `inputSize` (`number | null | undefined`), `pattern`, `min`, `max`, `step`, `minlength`, `maxlength` (all numeric/string, matching real source's exact types).
- `$variant` computed from `variant()` falling back to config — same documented, deliberate omission `UInputText` already established (`UltimateConfig`'s Option-B surface has neither `inputStyle`/`inputVariant`; expanding it is gated on config's own still-open architecture decision). Do not re-litigate this — repeat the same documented omission, do not attempt to add config fields in this workstream.
- `hasFluid` — ancestor-`UFluid` DI-detection via `inject(UFluid, { optional: true, host: true, skipSelf: true })`, the same mechanism `UInputText` already implements. `UBaseInput` is the second Ultimate class (after `UInputText`) to use this pattern — no new architectural fork, direct reuse of GAP-018's precedent.

No passthrough, no `PT` typing — matches GAP-021's three-times-convergent exclusion (now four times, counting `UInputText`).

### `writeControlValue` bridge (modify `packages/ng-core/src/base-editable-holder/base-editable-holder.ts`)

Per the "Exact signature" / "Ownership contract" sections above. `UBaseEditableHolder`'s `writeValue` becomes non-overridable (no `abstract` keyword, a real method body calling `writeControlValue`); a new `writeControlValue(value, setModelValue)` method is added with a NOOP default body, overridable by subclasses.

### `InputNumber` (new, `packages/ng/src/input-number/`)

`UInputNumber` extends `UBaseInput` directly (matching real `InputNumber extends BaseInput<InputNumberPassThrough>` exactly). Real PrimeNG's `InputNumber` (1493 lines) is materially larger than any component migrated so far — the largest single feature surface in the platform's proof set to date. This spec deliberately scopes a real, working, CVA-correct numeric input, not a full port.

**In scope, real functional surface:**
- Native `<input>`-wrapping directive/component rendering a real numeric-capable input, CVA-correct via `UBaseInput`'s inherited (and now-fixed) bridge — `writeControlValue` populates `modelValue`/`$filled` and the component's own local numeric-value state, mirroring the `UCheckbox` pattern established above (own local value state remains the template-bound source of truth; `modelValue` stays populated in parallel via the bridge).
- `min`/`max`/`step` — inherited from `UBaseInput`, real clamping behavior on value changes (real source's `validateValue` does real min/max clamping; port this specific, bounded piece of logic, verified against real source before writing).
- Basic decimal parsing/formatting for a plain numeric value (no currency, no percent, no grouping/locale-aware formatting) — real source's `formatValue`/`parseValue` are `Intl.NumberFormat`-backed and locale-aware; this spec scopes to a plain `Number()`-based parse/format pair as the minimal real numeric contract, not upstream's full locale machinery.
- Increment/decrement via native `<input type="number">` spinner semantics or a minimal up/down control — the exact mechanism (native `type="number"` vs. custom spinner buttons) is an implementation-plan decision informed by real source's `showButtons`/`spin()`/`repeat()` methods, not pre-decided here. If custom spinner buttons are built, they must be real, working, keyboard-accessible controls — not a stub.

**Explicitly out of scope (real, verified features in real `InputNumber` that this spec does not port):**
- Locale-aware `Intl.NumberFormat` parsing/formatting (`getDecimalExpression`/`getGroupingExpression`/`getCurrencyExpression`/`getPrefixExpression`/`getSuffixExpression` and their consumers) — real source's formatting is one of the largest single pieces of its 1493 lines; porting it is a future workstream's job if a real consumer needs currency/percent/locale formatting.
- Clipboard paste handling (`onPaste`), cursor/caret-position insertion logic (`insert`/`insertText`/`deleteRange`/`initCursor`/`getCharIndexes`), and the full keyboard-event interception in `onInputKeyDown`/`onInputKeyPress` (real source: ~250 lines of caret-aware digit/sign/decimal-point insertion handling) — this spec's minimal numeric input relies on the native `<input>` element's own typing/editing behavior, not a custom input-masking engine.
- `showButtons`/`buttonLayout` (`"stacked"`/`"horizontal"`/`"vertical"`) as a full configurable spinner layout system — if increment/decrement controls are built at all (see above), they are a single fixed layout, not a configurable one.
- `prefix`/`suffix`/`currency`/`currencyDisplay`/`locale`/`localeMatcher` inputs and everything they drive.
- Passthrough (`pt`/`ptm`), `NgModule` re-export wrapper, `PARENT_INSTANCE`/sibling-instance DI lookup — same platform-wide exclusions as every prior component.

This non-goals list is deliberately long and explicit because `InputNumber` is the largest component attempted so far — the goal is a real, CVA-correct, `UBaseInput`-proving numeric input, not a feature-complete port. A future workstream can extend it (locale formatting, clipboard handling, configurable spinner layout) once a real consumer need justifies each piece, per this platform's established YAGNI discipline.

### Styling

New `@ultimate/uix-styles/inputnumber` subpath and `packages/ng/src/input-number/input-number-style.ts`, following the same real-source copy-rename discipline `inputtext`'s style module now demonstrates (including the same Real-Source Verification rigor — the GAP-018 workstream's Task 3 shipped a real, review-caught CSS-fidelity bug; this workstream must extract and verify the real `@primeuix/styles/inputnumber` source directly before writing any CSS, not hand-author from memory or paraphrase).

### Testing

**`UBaseInput`** (`packages/ng-core/src/base-input/base-input.spec.ts`): tests the tier in isolation (a test-only subclass, matching `UModelHolder`'s and `UBaseEditableHolder`'s own existing spec-file convention) — `fluid`/`variant`/`size`/`min`/`max`/`step` inputs, `$variant`, `hasFluid` ancestor detection with a real `<u-fluid>` component (not mocked, matching `UInputText`'s own precedent).

**`writeControlValue` bridge — regression criteria, required, not optional:**

1. **Existing `UCheckbox` CVA behavior remains unchanged.** Every existing test in `packages/ng/src/checkbox/checkbox.spec.ts` must still pass unmodified — `renders a native input[type=checkbox]...`, `toggles ... on click`, `toggles on Space keypress`, `integrates with FormControl`, `respects the disabled input`, `respects CVA setDisabledState`, `renders the label input`. None of these tests' assertions change; if any needs modification to pass, that is a regression, not an acceptable side effect.
2. **`modelValue` synchronizes with values written through Angular Forms.** A new test: bind `UCheckbox` via `[formControl]`, call `control.setValue(true)`, assert `checkbox.modelValue()` becomes `true` (or the real underlying CVA value) — proving the bridge's `writeValue → writeControlValue → setModelValue` path actually populates `modelValue`, which it does not today.
3. **`$filled` reflects the synchronized value correctly.** A new test: after the above, assert `checkbox.$filled()` is `true`; then `control.setValue(false)`, assert `$filled()` becomes `false` — proving `$filled`'s `isNotEmpty`-derived computation genuinely tracks the bridged value, not just that `modelValue` was set once.
4. **User-driven writes (click/Space) also populate `modelValue`.** A new test: click the checkbox (no `FormControl` involved), assert `modelValue()` reflects the new checked state — proving `toggle()`'s required `writeModelValue` call (per the Architecture section above) actually fires, not just the CVA path.
5. **No double-write or feedback loop.** A new test: spy on (or count calls to) `writeModelValue`/`modelValue.set` across one `control.setValue(...)` call and assert it is called exactly once — proving the bridge doesn't cause `writeControlValue` to be invoked more than once per real CVA write, and that `UCheckbox`'s own `checked` signal update and the bridge's `modelValue` update don't trigger each other in a loop (they are independent signals with no mutual subscription, so this should be structurally impossible, but the test pins the invariant explicitly rather than assuming it).

**`InputNumber`** (`packages/ng/src/input-number/input-number.spec.ts`): reactive forms, template-driven forms (`ngModel`), `min`/`max`/`step` clamping behavior, `invalid`/`fluid`/`variant` class reflection (same pattern as `UInputText`'s own test suite), and the same CVA-correctness class of test as `UCheckbox`'s regression criteria above (adapted for a component with no prior `writeValue` to migrate away from — `InputNumber` is new, so its `writeControlValue` override is written correctly from the start, but still needs a test proving `modelValue`/`$filled` populate correctly, matching the rigor established for `UCheckbox`'s fix).

---

## Non-Goals

- `Password`, `InputMask`, `AutoComplete`, `DatePicker`, `Select` — the other 5 real `BaseInput` consumers remain future backlog, each its own future workstream.
- Locale-aware numeric formatting, clipboard handling, cursor/caret manipulation, configurable spinner layouts, currency/percent modes — see `InputNumber`'s own Non-Goals above for the full list.
- No change to `UCheckbox`'s `checked` signal as the template-bound state source — `modelValue` becomes populated in parallel, `checked` stays authoritative for rendering.
- No passthrough (`pt`/`ptm`/`ptmo`) system anywhere.
- No React or Vue changes. No audit of whether `react-core`/`vue-core` have an equivalent tier.
- No changes to `BLUEPRINT.md`.
- No `apps/playground-angular` consumer wiring (GAP-008 stays untouched, per the prior brainstorming session's decision to keep this workstream on the Form-family thread).

---

## Provenance and documentation updates (part of this workstream's scope)

- `docs/architecture/provenance/ng-core.json` — new entries for `UBaseInput` and the `UBaseEditableHolder`/`writeControlValue` bridge change.
- `docs/architecture/provenance/ng.json` — new entries for `UInputNumber` and its style module.
- `docs/architecture/COMPONENT_INVENTORY.md` — `BaseInput (foundation tier, not yet built)` row moves to built; `InputNumber` row moves from remaining to built.
- `docs/architecture/BLUEPRINT_GAPS.md` — GAP-038 marked `RESOLVED`, citing this workstream's evidence. ADR-046's "Follow-up gap, recorded not fixed" paragraph gets a closing note recording that the bridge is now built (do not delete the paragraph — it documents real history of the gap's discovery).
- A new ADR recording this workstream's `UBaseInput` insertion point, the bridge's exact contract, and `UCheckbox`'s specific fix — decided as part of the implementation plan, following ADR-046's own format.

---

## Exit Criteria

- `UBaseInput` builds, is tested, and correctly sits in the `UBaseComponent`/`UModelHolder`/`UBaseEditableHolder` chain.
- `writeControlValue` bridge lands on `UBaseEditableHolder`, matching the exact signature/contract in this spec.
- All 5 regression criteria above pass, with real (not mocked) `TestBed`-driven tests.
- Every existing `UCheckbox` test passes unmodified.
- `UInputNumber` builds, passes CVA/reactive-forms/template-driven-forms tests, and reflects `invalid`/`fluid`/`variant`/`min`/`max`/`step` state correctly, within this spec's explicit non-goals boundary.
- `UInputNumber` passes the same CI gate bar as the existing proof set: `boundary:validate`, coverage-regression gate, bundle-size-regression gate, accessibility scan, cross-browser Playwright.
- `BLUEPRINT.md` is not modified.
