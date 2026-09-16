# Angular UBaseInput Tier + InputNumber + writeControlValue Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close GAP-038 — add `UBaseInput` (the richer `fluid`/`variant`/`size`/`pattern`/`min`/`max`/`step` tier) to `@ultimate/ng-core`, fix the `writeControlValue` bridge gap ADR-046 recorded (currently making `UCheckbox.modelValue()`/`$filled()` permanently dead), and migrate `InputNumber` as `@ultimate/ng`'s proof consumer for `UBaseInput`.

**Architecture:** `UBaseInput` extends `UBaseEditableHolder` directly (chain: `UBaseComponent → UModelHolder → UBaseEditableHolder → UBaseInput`), matching real PrimeNG's ordering. `UBaseEditableHolder.writeValue` becomes a fixed, non-overridable method calling `this.writeControlValue(value, this.writeModelValue.bind(this))`; subclasses override `writeControlValue` instead of `writeValue`. `UCheckbox` migrates to this pattern, keeping its own `checked` signal as the template-bound source of truth while populating `modelValue`/`$filled` in parallel. `UInputNumber` extends `UBaseInput` directly, implements `writeControlValue` the same way, and scopes to a real, CVA-correct, non-locale-aware numeric input — not a full port of real `InputNumber`'s 1493-line feature surface.

**Tech Stack:** Angular 21 standalone directives/components, Angular signals, Angular CLI Vitest builder + zoneless `TestBed`, `ng-packagr` secondary entry points, `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-styles`.

## Global Constraints

- Angular-only. No React/Vue changes (spec Non-Goals).
- No `Password`/`InputMask`/`AutoComplete`/`DatePicker`/`Select` migration — future backlog (spec Non-Goals).
- No passthrough (`pt`/`ptm`/`ptmo`) system anywhere.
- No new `NgModule` authorship (ADR-019, platform-wide).
- `writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void` is the exact signature on `UBaseEditableHolder`, NOOP default body.
- `UBaseEditableHolder.writeValue` becomes fixed (no `abstract` keyword), calling `this.writeControlValue(value, this.writeModelValue.bind(this))` — subclasses never override `writeValue` again, only `writeControlValue`.
- `UCheckbox`'s own `checked` signal remains the template-bound state source — `modelValue` populates in parallel via the bridge, `checked` is not derived from `modelValue()`.
- `UCheckbox.toggle()` must call `this.writeModelValue(next)` so user-driven writes (click/Space) populate `modelValue`, not just CVA-driven writes.
- `UBaseInput` introduces zero `ControlValueAccessor` surface — pure input/config tier only.
- `InputNumber`'s real source is 1493 lines; explicitly excluded from this workstream: locale-aware `Intl.NumberFormat` formatting, clipboard paste handling, cursor/caret-position insertion logic, configurable spinner button layouts (`showButtons`/`buttonLayout`), `prefix`/`suffix`/`currency`/`locale` inputs.
- Every existing `UCheckbox` test in `packages/ng/src/checkbox/checkbox.spec.ts` must pass unmodified.
- Every new file gets a provenance entry in `docs/architecture/provenance/ng-core.json` or `ng.json`.
- Angular CLI Vitest builder + zoneless `TestBed` for all tests (ADR-022); use `fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(false); await fixture.whenStable();` instead of a second bare `detectChanges()` call whenever a test performs two plain-property mutations on a zoneless host fixture in sequence.
- `BLUEPRINT.md` is not modified.

---

## File Structure

| File | Responsibility |
|---|---|
| `packages/ng-core/src/base-input/base-input.ts` | `UBaseInput`: `fluid`/`variant`/`size`/`inputSize`/`pattern`/`min`/`max`/`step`/`minlength`/`maxlength`, `$variant`, `hasFluid`. |
| `packages/ng-core/src/base-input/base-input.spec.ts` | Tests for `UBaseInput` in isolation. |
| `packages/ng-core/src/base-input/index.ts` | Barrel re-export. |
| `packages/ng-core/src/base-editable-holder/base-editable-holder.ts` | Modified: add `writeControlValue` bridge, `writeValue` becomes fixed. |
| `packages/ng-core/src/base-editable-holder/base-editable-holder.spec.ts` | New tests for the bridge itself. |
| `packages/ng-core/src/index.ts` | Modified: add `export * from "./base-input";`. |
| `packages/ng/src/checkbox/checkbox.ts` | Modified: remove `writeValue` override, add `writeControlValue`, wire `toggle()` to call `writeModelValue`. |
| `packages/ng/src/checkbox/checkbox.spec.ts` | Modified: add the 5 regression-criteria tests. Existing tests untouched. |
| `packages/uix-styles/src/inputnumber/index.ts` | New: re-exports/copy-renames real `@primeuix/styles` `inputnumber` CSS. |
| `packages/uix-styles/package.json` | Modified: add `./inputnumber` to `exports`. |
| `packages/ng/src/input-number/input-number.ts` | `UInputNumber` component. |
| `packages/ng/src/input-number/input-number-style.ts` | Style module. |
| `packages/ng/src/input-number/input-number.spec.ts` | Tests for `UInputNumber`. |
| `packages/ng/src/input-number/index.ts` | Barrel re-export. |
| `packages/ng/src/index.ts` | Modified: add `export * from "./input-number";` (main barrel — see Task 6's GAP-009 note). |
| `docs/architecture/provenance/ng-core.json` | New entries for `UBaseInput` + bridge change. |
| `docs/architecture/provenance/ng.json` | New entries for `UInputNumber`. |
| `docs/architecture/COMPONENT_INVENTORY.md` | `BaseInput` row moves to built; `InputNumber` row moves to built. |
| `docs/architecture/BLUEPRINT_GAPS.md` | GAP-038 marked `RESOLVED`. |
| `docs/architecture/DECISIONS.md` | New ADR recording `UBaseInput`'s insertion, the bridge contract, `UCheckbox`'s fix. |

---

### Task 1: `writeControlValue` bridge on `UBaseEditableHolder`

**Files:**
- Modify: `packages/ng-core/src/base-editable-holder/base-editable-holder.ts:1-70`
- Modify: `packages/ng-core/src/base-editable-holder/base-editable-holder.spec.ts`

**Interfaces:**
- Consumes: `UModelHolder`'s `writeModelValue(value: unknown): void` (existing, from GAP-018).
- Produces: `UBaseEditableHolder.writeValue(value: unknown): void` (fixed, calls the bridge), `UBaseEditableHolder.writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void` (NOOP default, overridable). Task 2 (`UCheckbox`) and Task 5 (`UInputNumber`) both override `writeControlValue`.

- [ ] **Step 1: Write the failing test for the bridge's default (NOOP) behavior**

```typescript
// packages/ng-core/src/base-editable-holder/base-editable-holder.spec.ts
// Add to the existing TestEditableComponent's describe block, after existing tests:

  it("writeValue calls writeControlValue with the raw value and a bound setModelValue callback", () => {
    const fixture = TestBed.createComponent(TestEditableComponent);
    const instance = fixture.componentInstance;
    let receivedValue: unknown;
    let receivedSetter: ((value: unknown) => void) | undefined;
    instance.writeControlValue = (value, setModelValue) => {
      receivedValue = value;
      receivedSetter = setModelValue;
    };
    instance.writeValue("test-value");
    expect(receivedValue).toBe("test-value");
    expect(typeof receivedSetter).toBe("function");
    receivedSetter?.("via-setter");
    expect(instance.modelValue()).toBe("via-setter");
  });

  it("default writeControlValue is a NOOP — modelValue stays unpopulated unless a subclass opts in", () => {
    const fixture = TestBed.createComponent(TestEditableComponent);
    const instance = fixture.componentInstance;
    expect(instance.modelValue()).toBeUndefined();
    // TestEditableComponent overrides writeValue directly in the existing
    // test harness — construct a second, bridge-only subclass to prove the
    // *default* writeControlValue truly does nothing:
  });
```

The second test needs its own minimal subclass that does NOT override `writeControlValue` or `writeValue`, to prove the base's default is genuinely a NOOP. Replace the second test with:

```typescript
  it("default writeControlValue is a NOOP — modelValue stays unpopulated unless a subclass opts in", () => {
    @Component({
      standalone: true,
      selector: "u-test-bridge-noop",
      template: "",
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class NoopBridgeComponent extends UBaseEditableHolder {
      protected override readonly componentName = "test-bridge-noop";
      protected override readonly styleModule = { css: "", classes: {} };
    }
    const fixture = TestBed.createComponent(NoopBridgeComponent);
    const instance = fixture.componentInstance;
    instance.writeValue("ignored");
    expect(instance.modelValue()).toBeUndefined();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx ng test --project=ng-core --include "**/base-editable-holder.spec.ts" --watch=false`
Expected: FAIL — `writeControlValue` doesn't exist yet on `UBaseEditableHolder`.

- [ ] **Step 3: Add the bridge to `UBaseEditableHolder`**

```typescript
// packages/ng-core/src/base-editable-holder/base-editable-holder.ts
import { Directive, booleanAttribute, computed, input, signal } from "@angular/core";
import { ControlValueAccessor } from "@angular/forms";
import { UModelHolder } from "../model-holder/model-holder";

/**
 * Ultimate-owned reimplementation of PrimeNG's `BaseEditableHolder`.
 *
 * Extends {@link UModelHolder} (which supplies `modelValue`/`$filled`/
 * `writeModelValue`, matching real PrimeNG's `BaseComponent →
 * BaseModelHolder → BaseEditableHolder` ordering exactly) with the
 * `ControlValueAccessor` contract shared by every editable/form-bindable
 * component: a `disabled` signal `input()`, the `writeControlValue` bridge
 * (below), and the `onModelChange`/`onModelTouched` no-op fields that
 * `registerOnChange`/`registerOnTouched` replace per the Angular Forms API
 * contract.
 *
 * `disabled` is a read-only `input()` — Angular's `input()` has no `.set()`
 * — that only reflects a template `[disabled]` binding. CVA's
 * `setDisabledState` instead writes to the separate `_disabled` signal;
 * `$disabled` is the computed value every consumer should read. This
 * matches PrimeNG's own confirmed `baseeditableholder.ts` split-signal
 * pattern exactly.
 *
 * Provides no `NG_VALUE_ACCESSOR` here — confirmed against PrimeNG's real
 * source, DI providers on a base `@Directive` do not propagate to a
 * derived `@Component`, so every leaf component (e.g. `UCheckbox`) must
 * declare its own `NG_VALUE_ACCESSOR` provider with `useExisting` pointing
 * at the concrete leaf class.
 *
 * `writeControlValue(value, setModelValue)` is the `writeControlValue`
 * bridge real PrimeNG's `BaseEditableHolder.writeValue` uses
 * (`this.writeControlValue(value, this.writeModelValue.bind(this))`),
 * matching real source exactly (GAP-038). `writeValue` is now fixed — no
 * longer `abstract` — and always constructs and passes
 * `this.writeModelValue.bind(this)` as `setModelValue`. Subclasses override
 * `writeControlValue`, never `writeValue`, to populate `modelValue`/
 * `$filled` and any local state (e.g. `UCheckbox`'s own `checked` signal)
 * from the same CVA write. The default `writeControlValue` here is a NOOP
 * (matching real PrimeNG's own documented "should be overridden in derived
 * classes") — a subclass that never overrides it inherits a working CVA
 * contract with `modelValue` simply staying unpopulated, not a broken one.
 */
@Directive({ standalone: true })
export abstract class UBaseEditableHolder extends UModelHolder implements ControlValueAccessor {
  /** Whether the control is disabled (`disabled` attribute/binding). Read-only. */
  disabled = input<boolean | undefined>(undefined, { transform: booleanAttribute });

  /** Writable half of the disabled state, set via `setDisabledState`. */
  protected readonly _disabled = signal(false);

  /** The disabled value every consumer should read. */
  readonly $disabled = computed(() => this.disabled() || this._disabled());

  protected onModelChange: (value: unknown) => void = () => {};
  protected onModelTouched: () => void = () => {};

  /**
   * Override to populate `modelValue` (via the `setModelValue` callback) and
   * any local state from a CVA write. Default is a NOOP, matching real
   * PrimeNG's own `BaseEditableHolder.writeControlValue`.
   */
  writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    // NOOP — override in derived classes.
  }

  /** Fixed CVA entry point — always bridges into `writeControlValue`. Do not override. */
  writeValue(value: unknown): void {
    this.writeControlValue(value, this.writeModelValue.bind(this));
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx ng test --project=ng-core --include "**/base-editable-holder.spec.ts" --watch=false`
Expected: PASS, all tests including the 2 new ones and the pre-existing 5.

- [ ] **Step 5: Run the full `ng-core` suite (regression check — `UCheckbox` is not yet migrated, will break here, that's expected and fixed in Task 2)**

Run: `npx ng test --project=ng-core --watch=false`
Expected: PASS for `ng-core` itself (this task only touches `ng-core`; `UCheckbox` lives in `ng` and is migrated next task — do NOT run the `ng` suite yet, it will fail until Task 2 lands).

- [ ] **Step 6: Commit**

```bash
git add packages/ng-core/src/base-editable-holder
git commit -m "feat(ng-core): add writeControlValue bridge to UBaseEditableHolder"
```

---

### Task 2: Migrate `UCheckbox` to the bridge

**Files:**
- Modify: `packages/ng/src/checkbox/checkbox.ts:1-124`
- Modify: `packages/ng/src/checkbox/checkbox.spec.ts`

**Interfaces:**
- Consumes: `UBaseEditableHolder.writeControlValue(value, setModelValue)` (Task 1).
- Produces: `UCheckbox` unchanged public surface (`binary`, `label`, `checked`) plus newly-working `modelValue()`/`$filled()` (inherited from `UModelHolder` via the chain, now actually populated). No later task consumes `UCheckbox` directly.

- [ ] **Step 1: Write the failing regression tests (all 5 from the spec)**

Add to `packages/ng/src/checkbox/checkbox.spec.ts`, inside the existing `describe("UCheckbox", ...)` block, after the existing 6 tests (do not modify any existing test):

```typescript
  it("modelValue synchronizes with values written through Angular Forms", () => {
    @Component({
      standalone: true,
      imports: [UCheckbox, ReactiveFormsModule],
      template: `<u-checkbox [formControl]="control" [binary]="true" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const checkbox = fixture.debugElement.query((de) => de.name === "u-checkbox").componentInstance as UCheckbox;

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(checkbox.modelValue()).toBe(true);
  });

  it("$filled reflects the synchronized modelValue correctly", () => {
    @Component({
      standalone: true,
      imports: [UCheckbox, ReactiveFormsModule],
      template: `<u-checkbox [formControl]="control" [binary]="true" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const checkbox = fixture.debugElement.query((de) => de.name === "u-checkbox").componentInstance as UCheckbox;

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();
    expect(checkbox.$filled()).toBe(true);

    fixture.componentInstance.control.setValue(false);
    fixture.detectChanges();
    expect(checkbox.$filled()).toBe(false);
  });

  it("user-driven writes (click) also populate modelValue, not just CVA-driven writes", () => {
    const fixture = TestBed.createComponent(UCheckbox);
    fixture.componentRef.setInput("binary", true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"]');
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.modelValue()).toBe(true);
  });

  it("writeControlValue is invoked exactly once per real CVA write — no double-write or feedback loop", () => {
    @Component({
      standalone: true,
      imports: [UCheckbox, ReactiveFormsModule],
      template: `<u-checkbox [formControl]="control" [binary]="true" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const checkbox = fixture.debugElement.query((de) => de.name === "u-checkbox").componentInstance as UCheckbox;
    const spy = vi.spyOn(checkbox, "writeControlValue");

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });
```

Add `vi` to the existing `import { describe, expect, it } from "vitest";` line, making it `import { describe, expect, it, vi } from "vitest";`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx ng test --project=ng --include "**/checkbox.spec.ts" --watch=false`
Expected: FAIL — `UCheckbox` doesn't have `writeControlValue`, `modelValue()` stays `undefined`.

- [ ] **Step 3: Migrate `UCheckbox`**

```typescript
// packages/ng/src/checkbox/checkbox.ts
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { UBaseEditableHolder } from "@ultimate/ng-core";
import { checkboxStyleModule } from "./checkbox-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Checkbox` component (see
 * `.vendor-extracted/ng/checkbox/checkbox.ts`). Renders a native
 * `<input type="checkbox">` inside a `.u-checkbox-box` wrapper (matching
 * upstream's own two-element template shape), extends `UBaseEditableHolder`
 * for the `ControlValueAccessor` contract via the `writeControlValue`
 * bridge (GAP-038).
 *
 * Deliberately excludes upstream's much larger prop surface: `value`/
 * `trueValue`/`falseValue` (multi-value/group-checkbox mode — this
 * component only implements upstream's boolean/binary mode),
 * `ariaLabelledBy`/`ariaLabel`/`tabindex`/`inputId`/`inputStyle`/
 * `styleClass`/`inputClass`/`readonly`/`autofocus`/`variant`/`size`/
 * `checkboxIcon`/`formControl` inputs, `indeterminate` state, the icon
 * `<ng-template>`/`ContentChild` template-override system, and the
 * `onChange`/`onFocus`/`onBlur` `output()`s.
 *
 * Renders no check/minus icon: upstream's checked-state icon has no
 * equivalent yet in `@ultimate/ng-core`'s icon set; the checked state is
 * instead conveyed via `.u-checkbox-checked` on the root and the native
 * input's own `checked` state/appearance.
 *
 * `providers: [NG_VALUE_ACCESSOR]` is required here (not inherited):
 * `UBaseEditableHolder` provides no `NG_VALUE_ACCESSOR` of its own — DI
 * providers on a base `@Directive` do not propagate to a derived
 * `@Component` — so every leaf component must declare its own, matching
 * upstream's own `CHECKBOX_VALUE_ACCESSOR` constant redeclared on `Checkbox`
 * rather than inherited from `BaseEditableHolder`.
 *
 * The template binds the native input's `[disabled]` to `$disabled()` (the
 * combined computed value from `UBaseEditableHolder`), never to the base
 * `disabled()` input alone — `disabled()` alone doesn't reflect
 * `setDisabledState`'s CVA-driven value.
 *
 * `writeControlValue(value, setModelValue)` replaces the previous direct
 * `writeValue` override (GAP-038's bridge migration): it populates this
 * component's own `checked` signal — the real, template-bound state source,
 * matching this component's existing architecture, NOT derived from
 * `modelValue()` the way real PrimeNG's own `Checkbox` derives `checked`
 * from `modelValue()` directly — while ALSO calling `setModelValue(value)`
 * to populate the inherited `modelValue`/`$filled` in parallel. `toggle()`
 * (the user-interaction path — click/Space) also calls `writeModelValue`
 * directly, so `modelValue`/`$filled` stay in sync on user-driven writes
 * too, not just CVA-driven ones — without this, `modelValue` would go stale
 * the instant a user clicks the checkbox.
 */
@Component({
  standalone: true,
  selector: "u-checkbox",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UCheckbox, multi: true }],
  template: `
    <input
      type="checkbox"
      [class]="cx('input')"
      [checked]="checked()"
      [disabled]="$disabled()"
      [attr.aria-label]="label()"
      (change)="handleChange()"
      (keydown.space)="handleSpace($event)"
    />
    <div [class]="cx('box')"></div>
    @if (label()) {
      <span [class]="cx('label')">{{ label() }}</span>
    }
  `,
  host: {
    "[class]": "cx('root', classesParams())",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UCheckbox extends UBaseEditableHolder {
  protected override readonly componentName = "checkbox";
  protected override readonly styleModule = checkboxStyleModule;

  /** Allows to select a boolean value instead of multiple values. */
  binary = input(false, { transform: booleanAttribute });
  /** Text label rendered next to the checkbox. */
  label = input<string>();

  /** Current checked state, reflected by the native input and CVA. */
  readonly checked = signal(false);

  protected classesParams() {
    return { checked: this.checked(), disabled: this.$disabled() };
  }

  /** Writes a CVA-driven value into `checked` and, via `setModelValue`, into `modelValue`. */
  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    this.checked.set(!!value);
    setModelValue(value);
  }

  protected handleChange(): void {
    if (this.$disabled()) {
      return;
    }
    this.toggle();
  }

  protected handleSpace(event: Event): void {
    event.preventDefault();
    if (this.$disabled()) {
      return;
    }
    this.toggle();
  }

  private toggle(): void {
    const next = !this.checked();
    this.checked.set(next);
    this.writeModelValue(next);
    this.onModelChange(next);
    this.onModelTouched();
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx ng test --project=ng --include "**/checkbox.spec.ts" --watch=false`
Expected: PASS — all 6 pre-existing tests unmodified and green, plus the 4 new regression tests.

- [ ] **Step 5: Run the full `ng-core` and `ng` suites**

Run: `npx ng test --project=ng-core --watch=false && npx ng test --project=ng --watch=false`
Expected: PASS, zero regressions anywhere.

- [ ] **Step 6: Commit**

```bash
git add packages/ng/src/checkbox
git commit -m "fix(ng): migrate UCheckbox to writeControlValue bridge, populate modelValue/\$filled"
```

---

### Task 3: `UBaseInput` foundation directive

**Files:**
- Create: `packages/ng-core/src/base-input/base-input.ts`
- Create: `packages/ng-core/src/base-input/base-input.spec.ts`
- Create: `packages/ng-core/src/base-input/index.ts`
- Modify: `packages/ng-core/src/index.ts`

**Interfaces:**
- Consumes: `UBaseEditableHolder` (Task 1's file, unchanged surface plus the bridge) — extends it directly. `UFluid` (`packages/ng/src/fluid/fluid.ts`) — DI-injected for `hasFluid`, same pattern as `UInputText`.
- Produces: `export abstract class UBaseInput extends UBaseEditableHolder { fluid: InputSignal<boolean|undefined>; variant: InputSignal<'filled'|'outlined'|undefined>; size: InputSignal<'large'|'small'|undefined>; inputSize: InputSignal<number|null|undefined>; pattern: InputSignal<string|null|undefined>; min: InputSignal<number|null|undefined>; max: InputSignal<number|null|undefined>; step: InputSignal<number|null|undefined>; minlength: InputSignal<number|null|undefined>; maxlength: InputSignal<number|null|undefined>; readonly $variant: Signal<'filled'|'outlined'|undefined>; get hasFluid(): boolean }`. Task 5 (`UInputNumber`) extends this.

**Note:** `UBaseInput` lives in `packages/ng-core` (like `UModelHolder`/`UBaseEditableHolder`), but needs `UFluid` from `packages/ng`. This is a cross-package dependency direction (`ng-core` importing from `ng`) that does NOT exist anywhere else in the codebase — `UInputText` (which also needs `UFluid`) lives in `packages/ng` itself, so its import was same-package. Verify this direction is actually allowed by `scripts/provenance/validate-boundaries.mjs` before writing any code — if `ng-core` importing from `ng` is prohibited by the boundary validator, `UBaseInput`'s `hasFluid` must instead be built without a compile-time `UFluid` import (e.g. an injection token `UFluid` itself provides, or deferring `hasFluid` to each concrete `ng`-package subclass like `UInputNumber` to implement individually, not on the shared `ng-core` tier). Do not guess — run the validator on an experimental import first and read its actual output.

- [ ] **Step 1: Check the boundary validator's rule before writing any code**

Run: `grep -n "ng-core\|ng '" scripts/provenance/validate-boundaries.mjs | head -30`

Read the matched lines to understand whether `ng-core → ng` imports are already prohibited by name, or whether the rule is inferred from `package.json` dependency direction. Report findings before proceeding to Step 2 if the direction is ambiguous — this determines the entire shape of `hasFluid` below.

- [ ] **Step 2: If `ng-core → ng` imports are prohibited, resolve via injection token (do this only if Step 1 confirms the prohibition)**

If prohibited, `packages/ng-core/src/base-input/base-input.ts` cannot `import { UFluid } from "@ultimate/ng"`. Instead:
1. Check whether `packages/ng/src/fluid/fluid.ts`'s `UFluid` component could itself provide a plain `InjectionToken<boolean>` (e.g. `FLUID_ANCESTOR`) that `UBaseInput` injects instead of the class token — this keeps `ng-core` dependency-free of `ng` while preserving the ancestor-detection mechanism. This is a real architectural decision, not pre-solved here — if Step 1 confirms the prohibition, STOP and escalate to the controller with the validator's exact output before choosing an approach; do not invent a workaround unilaterally.

- [ ] **Step 3: (Assuming Step 1 confirms `ng-core → ng` imports ARE permitted, or Step 2's escalation resolved a path forward) Write the failing test for `UBaseInput`'s basic inputs**

```typescript
// packages/ng-core/src/base-input/base-input.spec.ts
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UBaseInput } from "./base-input";

@Component({
  standalone: true,
  selector: "u-test-base-input",
  template: "",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestBaseInputComponent extends UBaseInput {
  protected override readonly componentName = "test-base-input";
  protected override readonly styleModule = { css: "", classes: {} };
  override writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void {
    setModelValue(value);
  }
}

describe("UBaseInput", () => {
  it("exposes fluid/variant/size/pattern/min/max/step/minlength/maxlength as inputs, all undefined by default", () => {
    const fixture = TestBed.createComponent(TestBaseInputComponent);
    const instance = fixture.componentInstance;
    expect(instance.fluid()).toBeUndefined();
    expect(instance.variant()).toBeUndefined();
    expect(instance.size()).toBeUndefined();
    expect(instance.inputSize()).toBeUndefined();
    expect(instance.pattern()).toBeUndefined();
    expect(instance.min()).toBeUndefined();
    expect(instance.max()).toBeUndefined();
    expect(instance.step()).toBeUndefined();
    expect(instance.minlength()).toBeUndefined();
    expect(instance.maxlength()).toBeUndefined();
  });

  it("$variant reflects the variant input directly (config fallback deliberately omitted, per UInputText's own precedent)", () => {
    const fixture = TestBed.createComponent(TestBaseInputComponent);
    fixture.componentRef.setInput("variant", "filled");
    fixture.detectChanges();
    expect(fixture.componentInstance.$variant()).toBe("filled");
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx ng test --project=ng-core --include "**/base-input.spec.ts" --watch=false`
Expected: FAIL — module doesn't exist yet.

- [ ] **Step 5: Write `UBaseInput` (basic inputs, no `hasFluid` yet)**

```typescript
// packages/ng-core/src/base-input/base-input.ts
import { Directive, booleanAttribute, computed, input } from "@angular/core";
import { UBaseEditableHolder } from "../base-editable-holder/base-editable-holder";

/**
 * Ultimate-owned reimplementation of PrimeNG's `BaseInput`.
 *
 * Extends {@link UBaseEditableHolder} with the richer input-config surface
 * real PrimeNG's `InputMask`/`Password`/`AutoComplete`/`DatePicker`/
 * `InputNumber`/`Select` all extend (unlike `InputText`, which extends
 * `BaseModelHolder` directly and skips this tier entirely — GAP-018).
 *
 * Introduces zero `ControlValueAccessor` surface of its own — pure
 * input/config tier on top of the existing editable-holder contract,
 * matching real PrimeNG's own `BaseInput` exactly (confirmed: zero
 * `writeValue`/`writeControlValue`/`ControlValueAccessor` references
 * anywhere in the extracted real source).
 *
 * `$variant`'s upstream `config.inputStyle()`/`config.inputVariant()`
 * fallback is omitted — same documented, deliberate omission `UInputText`
 * already established (GAP-018): `UltimateConfig`'s Option-B surface has
 * neither field, and expanding it is gated on config's own still-open
 * architecture decision.
 */
@Directive({ standalone: true })
export abstract class UBaseInput extends UBaseEditableHolder {
  /** Spans 100% width of the container when enabled. */
  fluid = input<boolean | undefined>(undefined, { transform: booleanAttribute });
  /** Specifies the input variant of the component. */
  variant = input<"filled" | "outlined" | undefined>();
  /** Specifies the size of the component. */
  size = input<"large" | "small" | undefined>();
  /** Specifies the visible width of the input element in characters. */
  inputSize = input<number | null | undefined>();
  /** Specifies the value must match the pattern. */
  pattern = input<string | null | undefined>();
  /** The value must be greater than or equal to this value. */
  min = input<number | null | undefined>();
  /** The value must be less than or equal to this value. */
  max = input<number | null | undefined>();
  /** Unless step is "any", the value must be min + an integral multiple of step. */
  step = input<number | null | undefined>();
  /** The number of characters must not be less than this value, if non-empty. */
  minlength = input<number | null | undefined>();
  /** The number of characters must not exceed this value. */
  maxlength = input<number | null | undefined>();

  readonly $variant = computed(() => this.variant());
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx ng test --project=ng-core --include "**/base-input.spec.ts" --watch=false`
Expected: PASS (2 tests).

- [ ] **Step 7: Write the failing test for `hasFluid` ancestor detection**

Only proceed with this step once Step 1/2's boundary-direction question is resolved. Assuming `ng-core → ng` imports are permitted (or Step 2's escalation resolved an injection-token path — adjust the test/import accordingly), add to `base-input.spec.ts`:

```typescript
  it("hasFluid is true when an ancestor UFluid is present, even without the fluid input", () => {
    // Import UFluid per whichever path Step 1/2 established.
    @Component({
      standalone: true,
      imports: [TestBaseInputComponent, UFluid],
      template: `<u-fluid><u-test-base-input /></u-fluid>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const instance = fixture.debugElement.query((de) => de.name === "u-test-base-input").componentInstance;
    expect(instance.hasFluid).toBe(true);
  });

  it("hasFluid is false with no ancestor UFluid and no fluid input", () => {
    const fixture = TestBed.createComponent(TestBaseInputComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.hasFluid).toBe(false);
  });
```

- [ ] **Step 8: Run tests to verify they fail**

Run: `npx ng test --project=ng-core --include "**/base-input.spec.ts" --watch=false`
Expected: FAIL — `hasFluid` doesn't exist yet.

- [ ] **Step 9: Add `hasFluid` to `UBaseInput`**

Add to the imports and class body of `base-input.ts` (exact import path per Step 1/2's resolution):

```typescript
import { inject } from "@angular/core";
import { UFluid } from "@ultimate/ng"; // or the resolved alternative path

// inside the class:
  private readonly pcFluid: UFluid | null = inject(UFluid, {
    optional: true,
    host: true,
    skipSelf: true,
  });

  /** True when `fluid()` is explicitly set, or an ancestor `<u-fluid>` wrapper is detected via DI. */
  get hasFluid(): boolean {
    return this.fluid() ?? !!this.pcFluid;
  }
```

- [ ] **Step 10: Run tests to verify they pass**

Run: `npx ng test --project=ng-core --include "**/base-input.spec.ts" --watch=false`
Expected: PASS (4 tests total).

- [ ] **Step 11: Create the barrel file**

```typescript
// packages/ng-core/src/base-input/index.ts
export { UBaseInput } from "./base-input";
```

- [ ] **Step 12: Update `packages/ng-core/src/index.ts`**

Add `export * from "./base-input";` to the existing barrel exports.

- [ ] **Step 13: Run the full `ng-core` suite**

Run: `npx ng test --project=ng-core --watch=false`
Expected: PASS, all tests including new ones.

- [ ] **Step 14: Commit**

```bash
git add packages/ng-core/src/base-input packages/ng-core/src/index.ts
git commit -m "feat(ng-core): add UBaseInput foundation directive"
```

---

### Task 4: `@ultimate/uix-styles/inputnumber` subpath

**Files:**
- Create: `packages/uix-styles/src/inputnumber/index.ts`
- Create: `packages/uix-styles/test/inputnumber.test.ts`
- Modify: `packages/uix-styles/package.json`
- Modify: `packages/uix-styles/test/scope-guard.test.ts`

**Interfaces:**
- Consumes: real pinned PrimeUIX `inputnumber` CSS (extracted from `.vendor-cache/@primeuix__styles-2.0.3.tar.gz` via `scripts/provenance/extract-source.mjs`, matching the exact same process used for `inputtext` in the prior GAP-018 workstream — that workstream's Task 3 shipped a real CSS-fidelity bug initially, caught only by direct comparison against extracted real source; this task must extract and read the real source FIRST, not hand-author or paraphrase from memory).
- Produces: `export const style: string` — a plain CSS string. Task 6 imports this.

- [ ] **Step 1: Extract real pinned source before writing anything**

Run:
```bash
mkdir -p /tmp/task4-research
node scripts/provenance/extract-source.mjs .vendor-cache/@primeuix__styles-2.0.3.tar.gz /tmp/task4-research/extracted
```

Then read `/tmp/task4-research/extracted/src/inputnumber/index.ts` in full — this is the real, complete CSS content to copy-rename. Do not proceed to Step 2 until you have read this file's actual content.

- [ ] **Step 2: Write the failing test**

```typescript
// packages/uix-styles/test/inputnumber.test.ts
import { describe, expect, it } from "vitest";
import { style } from "../src/inputnumber";

describe("uix-styles/inputnumber", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-styles test -- inputnumber`
Expected: FAIL — module doesn't exist.

- [ ] **Step 4: Write `inputnumber/index.ts` as a faithful copy-rename of the real extracted source**

Copy the real content read in Step 1 verbatim, renaming only the base selector (`.p-inputnumber` → `.u-inputnumber`, matching `.u-inputtext`'s no-hyphen precedent for a two-word component name) — keep every structural modifier class (whatever `p-*` classes the real source uses for invalid/disabled/filled/fluid/size states) unrenamed, matching `inputtext/index.ts`'s and `checkbox/index.ts`'s established convention exactly. Do not invent, drop, or reorder any rule — this must be a byte-for-byte match to the real source except for the base-selector rename, the same standard the GAP-018 workstream's fix commit (`3da383d`) established and its re-review verified line-by-line.

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-styles test -- inputnumber`
Expected: PASS.

- [ ] **Step 6: Add the `./inputnumber` export to `package.json`**

Insert alphabetically in `packages/uix-styles/package.json`'s `exports` map (between whichever existing entries alphabetically bracket it — check the current file's exact entries first, do not assume `checkbox`/`dialog`/`inputtext`/`menu`'s exact current order).

- [ ] **Step 7: Update `scope-guard.test.ts`**

Add `inputnumber` to the module-count array and add a selector-fidelity assertion (`expect(inputnumberStyle).not.toMatch(/\.p-inputnumber/)`), matching the exact pattern the file already uses for `inputtext`/`checkbox`/etc. — read the file's current exact content first (it already has an `inputtext` entry from the prior workstream) before editing.

- [ ] **Step 8: Build and verify the subpath resolves**

Run: `pnpm --filter @ultimate/uix-styles build && node --input-type=module -e "import('@ultimate/uix-styles/inputnumber').then(m => console.log(typeof m.style))"`
Expected: build succeeds; logs `string`.

- [ ] **Step 9: Run the full `uix-styles` suite**

Run: `pnpm --filter @ultimate/uix-styles test`
Expected: PASS, all tests including the new `inputnumber` one and the updated `scope-guard` tests.

- [ ] **Step 10: Clean up scratch extraction and commit**

```bash
rm -rf /tmp/task4-research
git add packages/uix-styles/src/inputnumber packages/uix-styles/test/inputnumber.test.ts packages/uix-styles/test/scope-guard.test.ts packages/uix-styles/package.json
git commit -m "feat(uix-styles): add inputnumber subpath"
```

---

### Task 5: `UInputNumber` component

**Files:**
- Create: `packages/ng/src/input-number/input-number.ts`
- Create: `packages/ng/src/input-number/input-number-style.ts`
- Create: `packages/ng/src/input-number/index.ts`
- Create: `packages/ng/src/input-number/input-number.spec.ts`

**Interfaces:**
- Consumes: `UBaseInput` (Task 3, `@ultimate/ng-core`), `@ultimate/uix-styles/inputnumber`'s `style` export (Task 4).
- Produces: `export class UInputNumber extends UBaseInput { value: number | null; writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void }`, selector `u-input-number`. Real PrimeNG's `InputNumber` (confirmed by direct extraction this session: `packages/primeng/src/inputnumber/inputnumber.ts`) is a `@Component` with selector `p-inputNumber, p-inputnumber, p-input-number` — NOT an attribute directive like `UInputText`. `UInputNumber` follows the same `@Component` shape, selector `u-input-number`, matching `u-checkbox`'s existing single-selector convention (Ultimate components use one selector, not real PrimeNG's multi-alias `p-x, p-X, p-x-y` pattern — confirmed by `UCheckbox`'s own `selector: "u-checkbox"` versus real `Checkbox`'s `'p-checkbox, p-checkBox, p-check-box'`).

- [ ] **Step 1: Extract and read real `InputNumber` source's core value-handling before writing anything**

Run:
```bash
mkdir -p /tmp/task5-research
node scripts/provenance/extract-primeng-source.mjs .vendor-cache/primeng-21.1.9.tar.gz "inputnumber" /tmp/task5-research/inputnumber
```

Read `/tmp/task5-research/inputnumber/inputnumber.ts`'s `@Component` decorator (selector, template, host bindings), its `value`/`writeControlValue`/`updateModel`/`validateValue` methods, and its constructor/injected dependencies. This spec's Non-Goals list already excludes locale formatting, clipboard handling, caret manipulation, and configurable spinner layouts — confirm your understanding of what real `min`/`max`/`step` clamping (`validateValue`) actually does before implementing your own scoped-down version.

- [ ] **Step 2: Write the style module**

Follow `input-text-style.ts`'s exact pattern (import `style` from `@ultimate/uix-styles/inputnumber`, wrap in a `css` template literal, define a `classes.root` resolver reshaping the real `InputNumberStyle`'s class-name logic to `UBaseComponent`'s `cx(key, params)` plain-object contract — read the real `inputnumberstyle.ts` from the same extraction if it exists, or derive the classes object from the real component's own `[class]`/`cx()` template bindings if a separate style file isn't present in the extraction).

- [ ] **Step 3: Write the failing tests for basic rendering, CVA, and min/max clamping**

```typescript
// packages/ng/src/input-number/input-number.spec.ts
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it, vi } from "vitest";
import { UInputNumber } from "./input-number";

describe("UInputNumber", () => {
  it("renders a native numeric-capable input", () => {
    const fixture = TestBed.createComponent(UInputNumber);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input).not.toBeNull();
  });

  it("does not implement a second, competing ControlValueAccessor surface beyond its own NG_VALUE_ACCESSOR provider", () => {
    // UInputNumber DOES implement ControlValueAccessor (unlike UInputText) —
    // matching real PrimeNG's own InputNumber, which provides
    // INPUTNUMBER_VALUE_ACCESSOR and implements writeControlValue directly.
    // This test just confirms writeControlValue exists and is callable.
    const fixture = TestBed.createComponent(UInputNumber);
    fixture.detectChanges();
    expect(typeof fixture.componentInstance.writeControlValue).toBe("function");
  });

  it("integrates with reactive forms — FormControl value flows in and populates modelValue", () => {
    @Component({
      standalone: true,
      imports: [UInputNumber, ReactiveFormsModule],
      template: `<u-input-number [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<number | null>(5);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const inputNumber = fixture.debugElement.query((de) => de.name === "u-input-number")
      .componentInstance as UInputNumber;
    expect(inputNumber.modelValue()).toBe(5);

    fixture.componentInstance.control.setValue(10);
    fixture.detectChanges();
    expect(inputNumber.modelValue()).toBe(10);
  });

  it("clamps to min when a written value is below it", () => {
    @Component({
      standalone: true,
      imports: [UInputNumber, ReactiveFormsModule],
      template: `<u-input-number [formControl]="control" [min]="0" />`,
    })
    class HostComponent {
      control = new FormControl<number | null>(5);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.componentInstance.control.setValue(-5);
    fixture.detectChanges();
    const inputNumber = fixture.debugElement.query((de) => de.name === "u-input-number")
      .componentInstance as UInputNumber;
    expect(inputNumber.value).toBe(0);
  });

  it("clamps to max when a written value is above it", () => {
    @Component({
      standalone: true,
      imports: [UInputNumber, ReactiveFormsModule],
      template: `<u-input-number [formControl]="control" [max]="100" />`,
    })
    class HostComponent {
      control = new FormControl<number | null>(5);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.componentInstance.control.setValue(500);
    fixture.detectChanges();
    const inputNumber = fixture.debugElement.query((de) => de.name === "u-input-number")
      .componentInstance as UInputNumber;
    expect(inputNumber.value).toBe(100);
  });

  it("reflects the invalid input via the invalid class", () => {
    const fixture = TestBed.createComponent(UInputNumber);
    fixture.componentRef.setInput("invalid", true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input.classList.contains("p-invalid")).toBe(true);
  });
});
```

Selector is `u-input-number` (confirmed, per the Interfaces section above — not a placeholder to verify).

- [ ] **Step 4: Run tests to verify they fail**

Run: `npx ng test --project=ng --include "**/input-number.spec.ts" --watch=false`
Expected: FAIL — module doesn't exist.

- [ ] **Step 5: Write `UInputNumber`**

Base the shape on Step 1's real-source findings and `UBaseInput`'s inherited surface. Core requirements, regardless of exact template shape:
- `extends UBaseInput`.
- Own `value: number | null` field (or equivalent local numeric state) — the template-bound source of truth, matching real `InputNumber`'s own `this.value` field and `UCheckbox`'s established own-local-state-plus-bridge pattern (Task 2).
- `providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UInputNumber, multi: true }]` — real `InputNumber` DOES implement its own CVA accessor (confirmed: `INPUTNUMBER_VALUE_ACCESSOR`), unlike `UInputText`. This is a genuine, confirmed real-source difference between the two components, not an inconsistency to resolve.
- `writeControlValue(value: unknown, setModelValue: (value: unknown) => void): void` implementing real source's exact pattern: `this.value = value ? Number(value) : (value as number | null); setModelValue(value);` — parse to a plain `Number()`, no locale/currency formatting (per this spec's Non-Goals).
- `min`/`max` clamping on value changes — a `validateValue`-equivalent method (real source's `validateValue`, ported for the `min`/`max` case only, not currency/percent).
- `invalid`/`fluid`/`variant` class reflection, matching `UInputText`'s own `classesParams()`/`cx()` pattern.
- No passthrough, no `NgModule`, no `pSize`, no `PARENT_INSTANCE` lookup — same platform-wide exclusions as every prior component.

- [ ] **Step 6: Create the barrel file**

```typescript
// packages/ng/src/input-number/index.ts
export { UInputNumber } from "./input-number";
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx ng test --project=ng --include "**/input-number.spec.ts" --watch=false`
Expected: PASS.

- [ ] **Step 8: Clean up scratch extraction**

```bash
rm -rf /tmp/task5-research
```

- [ ] **Step 9: Commit**

```bash
git add packages/ng/src/input-number
git commit -m "feat(ng): add UInputNumber component"
```

---

### Task 6: `UInputNumber` — template-driven forms, additional regression coverage, and packaging

**Files:**
- Modify: `packages/ng/src/input-number/input-number.spec.ts`
- Modify: `packages/ng/src/index.ts`
- Possibly create: `packages/ng/input-number/ng-package.json` (see GAP-009 note below — only if the boundary check passes)
- Possibly modify: `packages/ng/package.json` (see GAP-009 note below — only if the boundary check passes)

**Interfaces:**
- Consumes: `UInputNumber` (Task 5).
- Produces: nothing new — packaging and additional test coverage only.

**Important, carried over from the prior GAP-018 workstream's own Task 4 finding:** `UInputText` hit a confirmed, real `ng-packagr`/`ShimReferenceTagger` build defect (a 5th instance of GAP-009) specifically because its mandated ancestor-`UFluid` DI injection cross-imports `fluid`, itself a secondary entry point — the resolution was to ship `UInputText` via the main `@ultimate/ng` barrel only, not a secondary entry point. `UInputNumber` ALSO needs ancestor-`UFluid` detection (inherited from `UBaseInput`, Task 3) — **this task is very likely to hit the exact same defect for the exact same reason.** Do not assume a secondary entry point will work; attempt it, and if it crashes with the `ShimReferenceTagger` error, stop and follow the same resolution GAP-009's registry already documents (main-barrel-only), rather than treating it as a novel problem requiring a fresh escalation.

- [ ] **Step 1: Add template-driven forms test**

Add to `packages/ng/src/input-number/input-number.spec.ts`:

```typescript
  it("integrates with template-driven forms — ngModel value flows in and populates modelValue", async () => {
    const { FormsModule } = await import("@angular/forms");
    @Component({
      standalone: true,
      imports: [UInputNumber, FormsModule],
      template: `<u-input-number [(ngModel)]="value" />`,
    })
    class TemplateHostComponent {
      value: number | null = 5;
    }
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const inputNumber = fixture.debugElement.query((de) => de.name === "u-input-number")
      .componentInstance as UInputNumber;
    expect(inputNumber.modelValue()).toBe(5);
  });
```


- [ ] **Step 2: Run test to verify it passes**

Run: `npx ng test --project=ng --include "**/input-number.spec.ts" --watch=false`
Expected: PASS.

- [ ] **Step 3: Attempt the `ng-packagr` secondary entry point**

```json
// packages/ng/input-number/ng-package.json
{
  "$schema": "../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "../src/input-number/index.ts"
  }
}
```

Add the matching `./input-number` entry to `packages/ng/package.json`'s `exports` map (following the exact shape of existing entries — `types`/`default` pointing at `./dist/types/ultimate-ng-input-number.d.ts`/`./dist/fesm2022/ultimate-ng-input-number.mjs`).

Run: `pnpm --filter @ultimate/ng build`

- [ ] **Step 4: If the build crashes with a `ShimReferenceTagger`-shaped error (expected, per the note above)**

Delete `packages/ng/input-number/ng-package.json` and revert the `./input-number` exports entry. Instead, add `export * from "./input-number";` to `packages/ng/src/index.ts` (the main barrel), matching `UInputText`'s exact resolution. Rebuild (`pnpm --filter @ultimate/ng build`) and confirm the main barrel succeeds with `UInputNumber` present in its output, and that all other existing secondary entry points still build.

- [ ] **Step 5: If the build succeeds as a real secondary entry point (i.e. Step 4 was not needed)**

Confirm `UInputNumber` is NOT also duplicated into the main barrel (`packages/ng/src/index.ts` should not export it if it has its own working secondary entry point, matching `checkbox`/`paginator`/etc.'s existing pattern of NOT being in the main barrel either — verify this by reading `packages/ng/src/index.ts`'s current content first).

- [ ] **Step 6: Run the full `ng` test suite**

Run: `npx ng test --project=ng --watch=false`
Expected: PASS, zero regressions across all existing components.

- [ ] **Step 7: Commit**

```bash
git add packages/ng/src/input-number packages/ng/package.json packages/ng/src/index.ts
git commit -m "feat(ng): ship UInputNumber (main barrel or secondary entry point, per build result)"
```

(If Task 6 Step 3's `ng-package.json` file was created then deleted in Step 4, ensure it is not staged — `git status` should show no trace of it in the final commit.)

---

### Task 7: Provenance manifests

**Files:**
- Modify: `docs/architecture/provenance/ng-core.json`
- Modify: `docs/architecture/provenance/ng.json`

**Interfaces:**
- Consumes: nothing — documentation-only task.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Read the current exact state of both files**

Read `docs/architecture/provenance/ng-core.json` and `docs/architecture/provenance/ng.json` in full to confirm their current entry count, exact JSON shape, and formatting conventions before adding anything.

- [ ] **Step 2: Add `UBaseInput` and the bridge-change entries to `ng-core.json`**

Following the exact shape of the existing `model-holder`/`base-editable-holder` entries (4 required fields: `originalPath`, `ultimateDestination`, `modificationStatus`, `modificationDescription`):

```json
  {
    "originalPath": "packages/primeng/src/baseinput/baseinput.ts",
    "ultimateDestination": "packages/ng-core/src/base-input/base-input.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Ultimate-owned reimplementation of PrimeNG's BaseInput, extending UBaseEditableHolder. Adds fluid/variant/size/inputSize/pattern/min/max/step/minlength/maxlength inputs and hasFluid ancestor-UFluid DI detection (second Ultimate component to use this mechanism, after UInputText). Introduces zero ControlValueAccessor surface -- pure input/config tier, matching real BaseInput exactly (confirmed: zero writeValue/writeControlValue references in real source). $variant's config.inputStyle()/config.inputVariant() fallback omitted, same documented reason as UInputText (GAP-018)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/ng-core/src/base-input/base-input.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream. Verifies input surface, $variant, and hasFluid ancestor detection via a real <u-fluid> component."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/ng-core/src/base-input/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent file."
  },
```

Update the EXISTING `base-editable-holder.ts` entry's `modificationDescription` to record the bridge addition (read the current exact text first, then append or revise to describe the new `writeControlValue` method and the now-fixed, non-abstract `writeValue`).

- [ ] **Step 3: Add `UInputNumber` entries to `ng.json`**

Following the same shape as the `input-text`/`input-text-style` entries, citing `packages/primeng/src/inputnumber/inputnumber.ts` at commit `c493b1c6d9f7cdffbe1c4dc195493dd73d733593`, describing the real scope boundary (extends `UBaseInput`, real CVA via `writeControlValue`, min/max clamping ported, locale/clipboard/caret/spinner-layout features explicitly excluded per this workstream's spec).

- [ ] **Step 4: Validate the provenance manifests**

Run whichever validation command Task 6 of the prior GAP-018 plan used successfully (check `package.json`'s root `scripts` block for the exact name first, e.g. `pnpm provenance:validate` or `node scripts/provenance/validate-provenance.mjs`).

Expected: PASS (the pre-existing, unrelated `auto-focus.stories.ts` provenance-validator failure the prior workstream confirmed and traced to a specific unrelated commit may still be present — if so, confirm it is the SAME pre-existing failure, not a new one, before treating the run as clean).

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/provenance/ng-core.json docs/architecture/provenance/ng.json
git commit -m "docs(provenance): record UBaseInput, writeControlValue bridge, and UInputNumber"
```

---

### Task 8: `COMPONENT_INVENTORY.md`, `BLUEPRINT_GAPS.md`, and a new ADR

**Files:**
- Modify: `docs/architecture/COMPONENT_INVENTORY.md`
- Modify: `docs/architecture/BLUEPRINT_GAPS.md`
- Modify: `docs/architecture/DECISIONS.md`

**Interfaces:**
- Consumes: nothing — documentation-only, final task in this plan.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Read current exact state of all three files**

Read `COMPONENT_INVENTORY.md`'s `BaseInput`/`InputNumber` rows and its summary reconciliation line (the prior workstream updated it to "16 + 2 + 99 = 117" — find the current exact text, since this task changes it again). Read `BLUEPRINT_GAPS.md`'s GAP-038 entry and its highest current GAP number (confirm the next free number, do not assume). Read `DECISIONS.md`'s highest current ADR number (confirm the next free number — the prior workstream added ADR-046, so this is likely ADR-047, but verify directly).

- [ ] **Step 2: Update `COMPONENT_INVENTORY.md`**

Move the `BaseInput (foundation tier, not yet built)` row (added by the prior workstream) to built — update its "Migration phase" and "Risk" columns, matching the style the prior workstream used for `BaseModelHolder`'s equivalent row. Move `InputNumber`'s row from remaining to built. Update the file's summary reconciliation arithmetic — read the exact current numbers first, then recompute: 2 more directories move from remaining to built (`baseinput`, `inputnumber`), so remaining decreases by 2 and built increases by 2 from whatever the current "16 + 2 + 99 = 117" baseline is.

- [ ] **Step 3: Update GAP-038 in `BLUEPRINT_GAPS.md`**

Mark `RESOLVED`, following the exact pattern GAP-018 itself used when it closed (a `**Status:**` update plus resolution evidence citing this workstream's spec/plan/ADR, keeping all other fields but updating `Expected state`/`What it blocks`/`Recommended resolution direction` to reflect resolution).

- [ ] **Step 4: Update ADR-046's "Follow-up gap, recorded not fixed" paragraph**

Do NOT delete this paragraph — it documents real history. Add a closing sentence noting the bridge is now built by this workstream, with a pointer to the new ADR (Step 5).

- [ ] **Step 5: Add the new ADR to `DECISIONS.md`**

Insert after the current last entry (confirmed in Step 1), recording: `UBaseInput`'s insertion point and real-source-verified surface; the exact `writeControlValue` bridge contract (signature, NOOP default, `writeValue` becoming fixed); `UCheckbox`'s specific migration (own `checked` signal stays authoritative, `writeControlValue` populates `modelValue` in parallel, `toggle()` also calls `writeModelValue`); `UInputNumber`'s real, verified CVA-implementing shape (a genuine, confirmed difference from `UInputText`, which implements no CVA at all) and its explicit scope boundary (locale/clipboard/caret/spinner-layout excluded).

- [ ] **Step 6: Run whole-workspace verification**

Run: `pnpm -r run typecheck` and whichever boundary-validation command the prior workstream's Task 7 used successfully (check its exact name in `package.json` first).

Expected: PASS, zero regressions across the whole workspace.

- [ ] **Step 7: Commit**

```bash
git add docs/architecture/COMPONENT_INVENTORY.md docs/architecture/BLUEPRINT_GAPS.md docs/architecture/DECISIONS.md
git commit -m "docs(architecture): resolve GAP-038, record UBaseInput/writeControlValue bridge ADR"
```

---

## Final Verification

- [ ] **Run the full workspace test suite**

Run: `pnpm -r test`
Expected: PASS, zero regressions in any package — including every pre-existing `UCheckbox` test, unmodified.

- [ ] **Run the full workspace build**

Run: `pnpm -r build`
Expected: PASS, including `@ultimate/uix-styles`'s new `inputnumber` subpath and `@ultimate/ng`'s `UInputNumber` (secondary entry point or main barrel, per Task 6's actual outcome).

- [ ] **Confirm `BLUEPRINT.md` was not touched**

Run: `git diff main -- docs/architecture/BLUEPRINT.md`
Expected: empty output.

- [ ] **Commit any final cleanup, then stop — do not open a PR or merge without the user's explicit instruction.**
