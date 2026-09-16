# Angular Form Foundation Tier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close GAP-018's real, narrower scope — add `UModelHolder` (model-value state: `modelValue`/`$filled`/`writeModelValue`) to `@ultimate/ng-core`, then migrate `InputText` as `@ultimate/ng`'s first native-input Form component, proving the tier end-to-end.

**Architecture:** `UModelHolder` is a new abstract `@Directive` inserted between `UBaseComponent` and `UBaseEditableHolder` (`UBaseComponent → UModelHolder → UBaseEditableHolder`), matching real PrimeNG's `BaseComponent → BaseModelHolder → BaseEditableHolder` ordering exactly. `UInputText` is a new attribute directive (`[uInputText]`, applied to a native `<input>`) extending `UModelHolder` directly — skipping `UBaseEditableHolder` entirely, matching real `InputText extends BaseModelHolder` exactly. `UInputText` reads `NgControl` read-only to sync `UModelHolder` state; it never implements `ControlValueAccessor` itself — Angular's native `DefaultValueAccessor` remains the sole accessor for the `<input>` element.

**Tech Stack:** Angular 21 standalone directives/components, Angular signals (`input()`, `signal()`, `computed()`, `effect()`), Angular CLI Vitest builder + zoneless `TestBed`, `ng-packagr` secondary entry points, `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-styles`.

## Global Constraints

- Angular-only. No React/Vue changes (spec Non-Goals).
- No `BaseInput`-equivalent tier, no second Form component beyond `InputText` (spec Non-Goals).
- No passthrough (`pt`/`ptm`/`ptmo`) system anywhere (GAP-021, spec Non-Goals).
- No new `NgModule` authorship (ADR-019, platform-wide).
- `UModelHolder` owns model-value state only (`modelValue`/`$filled`/`writeModelValue`) — no `ControlValueAccessor` methods (spec amendment).
- `UInputText` does not implement `ControlValueAccessor` and provides no `NG_VALUE_ACCESSOR` (spec amendment).
- `BLUEPRINT.md` is not modified (spec Non-Goals).
- Every new file gets a provenance entry in `docs/architecture/provenance/ng-core.json` or `ng.json` (repo-wide convention, confirmed via existing entries).
- Angular CLI Vitest builder + zoneless `TestBed` for all tests (ADR-022); use `fixture.changeDetectorRef.markForCheck(); fixture.detectChanges(false); await fixture.whenStable();` instead of a second bare `detectChanges()` call whenever a test performs two plain-property mutations on a zoneless host fixture in sequence (ADR-022's documented `NG0100` fix).

---

## File Structure

| File | Responsibility |
|---|---|
| `packages/ng-core/src/model-holder/model-holder.ts` | `UModelHolder` abstract directive: `modelValue`, `$filled`, `writeModelValue`. |
| `packages/ng-core/src/model-holder/model-holder.spec.ts` | Tests for `UModelHolder` in isolation. |
| `packages/ng-core/src/model-holder/index.ts` | Barrel re-export. |
| `packages/ng-core/src/base-editable-holder/base-editable-holder.ts` | Modified: `UBaseEditableHolder extends UModelHolder` (was `extends UBaseComponent`). |
| `packages/ng-core/src/index.ts` | Modified: add `export * from "./model-holder";`. |
| `packages/uix-styles/src/inputtext/index.ts` | New: re-exports `style` from `@primeuix/styles/inputtext`, matching `checkbox/index.ts`'s pattern. |
| `packages/uix-styles/package.json` | Modified: add `./inputtext` to `exports`. |
| `packages/ng/src/input-text/input-text.ts` | `UInputText` attribute directive. |
| `packages/ng/src/input-text/input-text-style.ts` | Style module (`css`, `classes`), matching `checkbox-style.ts`'s shape. |
| `packages/ng/src/input-text/input-text.spec.ts` | Tests for `UInputText`. |
| `packages/ng/src/input-text/index.ts` | Barrel re-export. |
| `packages/ng/input-text/ng-package.json` | `ng-packagr` secondary entry point config, matching `packages/ng/checkbox/ng-package.json`. |
| `packages/ng/package.json` | Modified: add `./input-text` to `exports`. |
| `docs/architecture/provenance/ng-core.json` | New entries for `UModelHolder` + its spec/index files. |
| `docs/architecture/provenance/ng.json` | New entries for `UInputText` + its style/spec/index files. |
| `docs/architecture/COMPONENT_INVENTORY.md` | Split the `BaseModelHolder / BaseInput` row; move `InputText` row to built table. |
| `docs/architecture/BLUEPRINT_GAPS.md` | Mark GAP-018 `RESOLVED` for the `BaseModelHolder` slice; add GAP-038 for the deferred `BaseInput` slice. |
| `docs/architecture/DECISIONS.md` | New ADR-046 recording the two-tier finding, `UModelHolder` placement, and the Fluid-ancestor-detection first-implementation. |

---

### Task 1: `UModelHolder` foundation directive

**Files:**
- Create: `packages/ng-core/src/model-holder/model-holder.ts`
- Create: `packages/ng-core/src/model-holder/model-holder.spec.ts`
- Create: `packages/ng-core/src/model-holder/index.ts`
- Modify: `packages/ng-core/src/index.ts`

**Interfaces:**
- Consumes: `UBaseComponent` (`packages/ng-core/src/basecomponent/base-component.ts`) — extends it directly.
- Produces: `export abstract class UModelHolder extends UBaseComponent { modelValue: WritableSignal<unknown>; readonly $filled: Signal<boolean>; writeModelValue(value: unknown): void }`. Task 2 (`UBaseEditableHolder`) and Task 4 (`UInputText`) both extend this.

- [ ] **Step 1: Write the failing test for `modelValue`/`writeModelValue`**

```typescript
// packages/ng-core/src/model-holder/model-holder.spec.ts
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UModelHolder } from "./model-holder";

@Component({
  standalone: true,
  selector: "u-test-model-holder",
  template: "",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestModelHolderComponent extends UModelHolder {
  protected override readonly componentName = "test-model-holder";
  protected override readonly styleModule = { css: "", classes: {} };
}

describe("UModelHolder", () => {
  it("writeModelValue sets modelValue, readable via the signal", () => {
    const fixture = TestBed.createComponent(TestModelHolderComponent);
    const instance = fixture.componentInstance;
    expect(instance.modelValue()).toBeUndefined();
    instance.writeModelValue("hello");
    expect(instance.modelValue()).toBe("hello");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng-core test -- model-holder.spec.ts`
Expected: FAIL with `Cannot find module './model-holder'` or similar.

- [ ] **Step 3: Write `UModelHolder`**

```typescript
// packages/ng-core/src/model-holder/model-holder.ts
import { Directive, computed, signal } from "@angular/core";
import { isNotEmpty } from "@ultimate/uix-utils/object";
import { UBaseComponent } from "../basecomponent/base-component";

/**
 * Ultimate-owned reimplementation of PrimeNG's `BaseModelHolder`.
 *
 * Owns model-value *state* only — `modelValue`, `$filled`,
 * `writeModelValue`. No `ControlValueAccessor` methods and no Angular
 * Forms integration of any kind: real `BaseModelHolder` doesn't implement
 * `ControlValueAccessor` either (only `BaseEditableHolder`, one tier up,
 * does).
 */
@Directive({ standalone: true })
export abstract class UModelHolder extends UBaseComponent {
  readonly modelValue = signal<unknown>(undefined);

  readonly $filled = computed(() => isNotEmpty(this.modelValue()));

  writeModelValue(value: unknown): void {
    this.modelValue.set(value);
  }
}
```

- [ ] **Step 4: Create the barrel file**

```typescript
// packages/ng-core/src/model-holder/index.ts
export { UModelHolder } from "./model-holder";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng-core test -- model-holder.spec.ts`
Expected: PASS (1 test).

- [ ] **Step 6: Write the failing test for `$filled`**

Add to `packages/ng-core/src/model-holder/model-holder.spec.ts`, inside the existing `describe("UModelHolder", ...)` block:

```typescript
  it("$filled is false when modelValue is undefined, empty string, or empty array; true otherwise", () => {
    const fixture = TestBed.createComponent(TestModelHolderComponent);
    const instance = fixture.componentInstance;
    expect(instance.$filled()).toBe(false);

    instance.writeModelValue("");
    expect(instance.$filled()).toBe(false);

    instance.writeModelValue([]);
    expect(instance.$filled()).toBe(false);

    instance.writeModelValue("hello");
    expect(instance.$filled()).toBe(true);

    instance.writeModelValue(0);
    expect(instance.$filled()).toBe(true);
  });
```

- [ ] **Step 7: Run test to verify it fails or passes**

Run: `pnpm --filter @ultimate/ng-core test -- model-holder.spec.ts`
Expected: PASS immediately if `isNotEmpty` semantics already match (verify `packages/uix-utils/src/object/methods/isEmpty.ts`'s exact behavior for `0` and numbers before assuming — real PrimeNG's `isNotEmpty` returns `true` for `0`). If it fails, the mismatch is between `@ultimate/uix-utils`'s `isEmpty` and real PrimeNG's `isEmpty` semantics — read `packages/uix-utils/src/object/methods/isEmpty.ts` directly and adjust the test to match Ultimate's real, already-shipped `isEmpty` behavior (do not modify `isEmpty` itself — it is shared, existing infrastructure Task 43 of Phase 1 already proved out).

- [ ] **Step 8: Update `packages/ng-core/src/index.ts`**

```typescript
export * from "./basecomponent";
export * from "./base-editable-holder";
export * from "./overlay";
export * from "./focus-trap";
export * from "./config";
export * from "./bind";
export * from "./icons";
export * from "./api";
export * from "./id/component-id-generator";
export * from "./model-holder";
```

- [ ] **Step 9: Run the full `ng-core` test suite**

Run: `pnpm --filter @ultimate/ng-core test`
Expected: PASS, all existing tests still green.

- [ ] **Step 10: Commit**

```bash
git add packages/ng-core/src/model-holder packages/ng-core/src/index.ts
git commit -m "feat(ng-core): add UModelHolder foundation directive"
```

---

### Task 2: Insert `UModelHolder` into the `UBaseEditableHolder` chain

**Files:**
- Modify: `packages/ng-core/src/base-editable-holder/base-editable-holder.ts:1-29`
- Modify: `packages/ng-core/src/base-editable-holder/base-editable-holder.spec.ts` (no test changes expected, run as regression check)

**Interfaces:**
- Consumes: `UModelHolder` (Task 1) — `UBaseEditableHolder` now extends it instead of `UBaseComponent` directly.
- Produces: `UBaseEditableHolder` unchanged public surface (`disabled`, `$disabled`, CVA methods) plus newly-inherited `modelValue`/`$filled`/`writeModelValue` from `UModelHolder`. Existing consumers (`UCheckbox`) are unaffected — `UModelHolder`'s additions are purely additive.

- [ ] **Step 1: Write the failing test proving `UBaseEditableHolder` now has `modelValue`/`$filled`**

Add to `packages/ng-core/src/base-editable-holder/base-editable-holder.spec.ts`, inside the existing `describe("UBaseEditableHolder", ...)` block:

```typescript
  it("inherits modelValue/$filled/writeModelValue from UModelHolder", () => {
    const fixture = TestBed.createComponent(TestEditableComponent);
    const instance = fixture.componentInstance;
    expect(instance.$filled()).toBe(false);
    instance.writeModelValue("x");
    expect(instance.modelValue()).toBe("x");
    expect(instance.$filled()).toBe(true);
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng-core test -- base-editable-holder.spec.ts`
Expected: FAIL — `instance.writeModelValue is not a function` (or `modelValue`/`$filled` undefined).

- [ ] **Step 3: Change `UBaseEditableHolder`'s base class**

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
 * component (e.g. `UCheckbox`): a `disabled` signal `input()`, `writeValue()`
 * left abstract for subclasses to implement, and the
 * `onModelChange`/`onModelTouched` no-op fields that
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

  abstract writeValue(value: unknown): void;

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

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng-core test -- base-editable-holder.spec.ts`
Expected: PASS, all tests in the file (including the new one and the 4 pre-existing ones).

- [ ] **Step 5: Run the full `ng-core` and `ng` test suites (regression check for `UCheckbox`)**

Run: `pnpm --filter @ultimate/ng-core test && pnpm --filter @ultimate/ng test`
Expected: PASS — `UCheckbox` (the only existing `UBaseEditableHolder` consumer) is unaffected since `UModelHolder`'s additions are purely additive to the chain.

- [ ] **Step 6: Commit**

```bash
git add packages/ng-core/src/base-editable-holder
git commit -m "feat(ng-core): UBaseEditableHolder extends UModelHolder"
```

---

### Task 3: `@ultimate/uix-styles/inputtext` subpath

**Files:**
- Create: `packages/uix-styles/src/inputtext/index.ts`
- Modify: `packages/uix-styles/package.json:10-52` (add `./inputtext` to `exports`)

**Interfaces:**
- Consumes: `@primeuix/styles/inputtext` (existing pinned dependency, per `packages/uix-styles`'s existing pattern — no new dependency added).
- Produces: `export { style } from "@ultimate/uix-styles/inputtext"` — a plain CSS string. Task 5 imports this.

- [ ] **Step 1: Write the failing test**

```typescript
// packages/uix-styles/src/inputtext/index.test.ts
import { describe, expect, it } from "vitest";
import { style } from "./index";

describe("uix-styles/inputtext", () => {
  it("exports a non-empty style string", () => {
    expect(typeof style).toBe("string");
    expect(style.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @ultimate/uix-styles test -- inputtext`
Expected: FAIL — `Cannot find module './index'`.

- [ ] **Step 3: Create the subpath, matching `checkbox/index.ts`'s pattern**

```bash
cat packages/uix-styles/src/checkbox/index.ts
```

Confirm its exact shape (a single `export { style } from "@primeuix/styles/checkbox";` line or similar), then write:

```typescript
// packages/uix-styles/src/inputtext/index.ts
export { style } from "@primeuix/styles/inputtext";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @ultimate/uix-styles test -- inputtext`
Expected: PASS.

- [ ] **Step 5: Add the `./inputtext` export to `package.json`**

```json
    "./inputtext": {
      "types": "./dist/inputtext/index.d.mts",
      "import": "./dist/inputtext/index.mjs",
      "default": "./dist/inputtext/index.mjs"
    },
```

Insert alphabetically between the `"./dialog"` and `"./menu"` entries in `packages/uix-styles/package.json`'s `exports` map.

- [ ] **Step 6: Build and verify the subpath resolves**

Run: `pnpm --filter @ultimate/uix-styles build && node -e "console.log(typeof require('@ultimate/uix-styles/inputtext'))"`
Expected: build succeeds; the resolved module logs `object` (or run the equivalent ESM `import()` check if `require` fails under `"type": "module"` — use `node --input-type=module -e "import('@ultimate/uix-styles/inputtext').then(m => console.log(typeof m.style))"` instead).

- [ ] **Step 7: Commit**

```bash
git add packages/uix-styles/src/inputtext packages/uix-styles/package.json
git commit -m "feat(uix-styles): add inputtext subpath"
```

---

### Task 4: `UInputText` component

**Files:**
- Create: `packages/ng/src/input-text/input-text.ts`
- Create: `packages/ng/src/input-text/input-text-style.ts`
- Create: `packages/ng/src/input-text/index.ts`
- Create: `packages/ng/input-text/ng-package.json`
- Modify: `packages/ng/package.json` (add `./input-text` to `exports`)

**Interfaces:**
- Consumes: `UModelHolder` (Task 1, `@ultimate/ng-core`), `UFluid` (`packages/ng/src/fluid/fluid.ts`, existing), `@ultimate/uix-styles/inputtext`'s `style` export (Task 3).
- Produces: `export class UInputText extends UModelHolder { variant: InputSignal<'filled'|'outlined'|undefined>; fluid: InputSignal<boolean|undefined>; invalid: InputSignal<boolean|undefined>; readonly $variant: Signal<'filled'|'outlined'|undefined>; get hasFluid(): boolean }`, selector `[uInputText]`. Task 5 tests this directly; no later task consumes it.

- [ ] **Step 1: Write the style module**

```typescript
// packages/ng/src/input-text/input-text-style.ts
import { style as inputTextStyle } from "@ultimate/uix-styles/inputtext";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputTextStyle`, shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. `.p-inputtext*`
 * selectors renamed to `.u-input-text*`. `p-filled`/`p-invalid`/
 * `p-inputtext-fluid`/`p-variant-filled` structural modifier classes are
 * kept unrenamed — confirmed against `@ultimate/uix-styles/inputtext`'s own
 * CSS, which references these literal class names (same precedent as
 * `checkbox-style.ts`'s `p-highlight`/`p-disabled`).
 */
const css = /*css*/ `
    ${inputTextStyle}
`;

/** Params `UInputText` passes into `cx('root', params)`. */
export interface InputTextClassesParams {
  filled?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  variantFilled?: boolean;
}

const classes = {
  root: (params: InputTextClassesParams = {}) => {
    const { filled, invalid, fluid, variantFilled } = params;
    return [
      "u-input-text u-component",
      {
        "p-filled": filled,
        "p-invalid": invalid,
        "p-inputtext-fluid": fluid,
        "p-variant-filled": variantFilled,
      },
    ];
  },
};

/** `UBaseComponent`-shaped style module for `UInputText`. */
export const inputTextStyleModule = { css, classes };
```

- [ ] **Step 2: Write the failing test for basic rendering and `$filled`-driven class**

```typescript
// packages/ng/src/input-text/input-text.spec.ts
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UInputText } from "./input-text";

describe("UInputText", () => {
  it("applies to a native input via the [uInputText] selector", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input).not.toBeNull();
    expect(input.classList.contains("u-input-text")).toBe(true);
  });

  it("updates modelValue/$filled when the input's value changes", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText #ref="uInputText" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    const directive = fixture.debugElement.children[0].injector.get(UInputText);
    expect(directive.$filled()).toBe(false);

    input.value = "hello";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(directive.modelValue()).toBe("hello");
    expect(directive.$filled()).toBe(true);
    expect(input.classList.contains("p-filled")).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @ultimate/ng test -- input-text.spec.ts`
Expected: FAIL — `Cannot find module './input-text'`.

- [ ] **Step 4: Write `UInputText`**

```typescript
// packages/ng/src/input-text/input-text.ts
import {
  Directive,
  HostListener,
  booleanAttribute,
  computed,
  inject,
  input,
} from "@angular/core";
import { NgControl } from "@angular/forms";
import { UModelHolder } from "@ultimate/ng-core";
import { UFluid } from "../fluid/fluid";
import { inputTextStyleModule } from "./input-text-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputText` directive (real
 * `packages/primeng/src/inputtext/inputtext.ts`, selector `[pInputText]`).
 * An attribute directive applied to a native `<input>` — not a wrapping
 * component — matching real PrimeNG's actual architecture exactly. Extends
 * `UModelHolder` directly (skipping `UBaseEditableHolder`), matching real
 * `InputText extends BaseModelHolder` exactly: real `InputText` has no
 * `disabled` input of its own either (confirmed absent from its extracted
 * source), a genuine real-source asymmetry, not an oversight.
 *
 * Reads `NgControl` (optional, self) read-only, purely to synchronize
 * `UModelHolder`'s `modelValue`/`$filled` state for styling (`p-filled`).
 * Does NOT implement `ControlValueAccessor` and provides no
 * `NG_VALUE_ACCESSOR` — Angular's native `DefaultValueAccessor` (provided
 * automatically by `@angular/forms` for any native `<input>` bound via
 * `ngModel`/`formControl`/`formControlName`) remains the sole accessor.
 *
 * `hasFluid` DI-injects an ancestor `UFluid` (`optional, host, skipSelf`) —
 * the first Ultimate component to implement this ancestor-lookup mechanism;
 * `UButton` deliberately excludes it (see `UButton`'s own doc comment).
 *
 * Deliberately excludes PrimeNG's passthrough (`pt`/`ptInputText`/
 * `pInputTextPT`/`pInputTextUnstyled`) system and `Bind` host-directive
 * wiring, `hostName`/`$pcInputText` sibling-instance lookup, `PARENT_INSTANCE`
 * DI-token lookup (all excluded platform-wide per ADR-018's Option B), and
 * `pSize`/`inputSize`/the `NgModule` re-export wrapper (ADR-019 forbids new
 * `NgModule` authorship).
 */
@Directive({
  standalone: true,
  selector: "[uInputText]",
  exportAs: "uInputText",
  host: {
    "[class]": "cx('root', classesParams())",
    "[attr.data-p]": "dataP",
  },
})
export class UInputText extends UModelHolder {
  protected override readonly componentName = "input-text";
  protected override readonly styleModule = inputTextStyleModule;

  private readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly pcFluid: UFluid | null = inject(UFluid, {
    optional: true,
    host: true,
    skipSelf: true,
  });

  /** Specifies the input variant of the component. */
  variant = input<"filled" | "outlined" | undefined>();
  /** Spans 100% width of the container when enabled. */
  fluid = input(undefined, { transform: booleanAttribute });
  /** When present, specifies the component should have invalid state style. */
  invalid = input(undefined, { transform: booleanAttribute });

  readonly $variant = computed(() => this.variant());

  get hasFluid(): boolean {
    return this.fluid() ?? !!this.pcFluid;
  }

  protected classesParams() {
    return {
      filled: this.$filled(),
      invalid: this.invalid(),
      fluid: this.hasFluid,
      variantFilled: this.$variant() === "filled",
    };
  }

  protected get dataP(): string | undefined {
    return this.cx("root", this.classesParams());
  }

  ngAfterViewInit(): void {
    this.syncModelValue();
  }

  ngDoCheck(): void {
    this.syncModelValue();
  }

  @HostListener("input")
  protected onInput(): void {
    this.syncModelValue();
  }

  private syncModelValue(): void {
    const nativeValue = (this.el.nativeElement as HTMLInputElement).value;
    this.writeModelValue(this.ngControl?.value ?? nativeValue);
  }
}
```

- [ ] **Step 5: Create the barrel file**

```typescript
// packages/ng/src/input-text/index.ts
export { UInputText } from "./input-text";
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm --filter @ultimate/ng test -- input-text.spec.ts`
Expected: PASS (2 tests). If `cx()`/`el` are `protected` on `UBaseComponent` and inaccessible from `UInputText`, verify `packages/ng-core/src/basecomponent/base-component.ts`'s exact access modifiers directly and adjust — `protected` members are accessible from subclasses, which `UInputText` is (via `UModelHolder`), so this should work without changes; if the build fails on this point, re-read `base-component.ts` before altering anything.

- [ ] **Step 7: Add the `ng-packagr` secondary entry point**

```json
// packages/ng/input-text/ng-package.json
{
  "$schema": "../node_modules/ng-packagr/ng-entrypoint.schema.json",
  "lib": {
    "entryFile": "../src/input-text/index.ts"
  }
}
```

- [ ] **Step 8: Add the `./input-text` export to `packages/ng/package.json`**

Insert alphabetically among the existing per-component `exports` entries:

```json
    "./input-text": {
      "types": "./dist/types/ultimate-ng-input-text.d.ts",
      "default": "./dist/fesm2022/ultimate-ng-input-text.mjs"
    },
```

- [ ] **Step 9: Build `@ultimate/ng` and verify the secondary entry point compiles**

Run: `pnpm --filter @ultimate/ng build`
Expected: build succeeds, no `ng-packagr` errors. If a `ShimReferenceTagger`-shaped crash occurs (the same defect GAP-009 documents for `button`/`dialog`/`menu`/`table`), stop and re-check whether `input-text` accidentally imports from one of those 4 excluded components — `UFluid` is not one of them, so this should not occur; if it does, investigate before working around it.

- [ ] **Step 10: Commit**

```bash
git add packages/ng/src/input-text packages/ng/input-text packages/ng/package.json
git commit -m "feat(ng): add UInputText component"
```

---

### Task 5: `UInputText` — Reactive Forms, template-driven forms, invalid/fluid/variant coverage

**Files:**
- Modify: `packages/ng/src/input-text/input-text.spec.ts`

**Interfaces:**
- Consumes: `UInputText` (Task 4).
- Produces: nothing new — this task only adds test coverage.

- [ ] **Step 1: Write the failing tests**

Add to `packages/ng/src/input-text/input-text.spec.ts`, inside the existing `describe("UInputText", ...)` block:

```typescript
  it("integrates with reactive forms — FormControl value flows in and out", async () => {
    const { Component: Comp } = await import("@angular/core");
    const { ReactiveFormsModule, FormControl } = await import("@angular/forms");
    @Comp({
      standalone: true,
      imports: [UInputText, ReactiveFormsModule],
      template: `<input uInputText [formControl]="control" />`,
    })
    class ReactiveHostComponent {
      control = new FormControl("initial");
    }
    const fixture = TestBed.createComponent(ReactiveHostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input.value).toBe("initial");

    input.value = "typed";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("typed");
  });

  it("integrates with template-driven forms — ngModel value flows in and out", async () => {
    const { Component: Comp } = await import("@angular/core");
    const { FormsModule } = await import("@angular/forms");
    @Comp({
      standalone: true,
      imports: [UInputText, FormsModule],
      template: `<input uInputText [(ngModel)]="value" />`,
    })
    class TemplateHostComponent {
      value = "initial";
    }
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector("input");
    expect(input.value).toBe("initial");

    input.value = "typed";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.value).toBe("typed");
  });

  it("reflects the invalid input via the p-invalid class", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText [invalid]="true" />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input.classList.contains("p-invalid")).toBe(true);
  });

  it("hasFluid is true when an ancestor UFluid is present, even without the fluid input", () => {
    @Component({
      standalone: true,
      imports: [UInputText, UFluid],
      template: `<u-fluid><input uInputText #ref="uInputText" /></u-fluid>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.query(
      (de) => de.name === "input"
    ).injector.get(UInputText);
    expect(directive.hasFluid).toBe(true);
  });

  it("does not implement ControlValueAccessor", () => {
    @Component({
      standalone: true,
      imports: [UInputText],
      template: `<input uInputText />`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const directive = fixture.debugElement.query((de) => de.name === "input").injector.get(UInputText);
    expect((directive as unknown as { writeValue?: unknown }).writeValue).toBeUndefined();
    expect((directive as unknown as { registerOnChange?: unknown }).registerOnChange).toBeUndefined();
  });
```

Add the `UFluid` import at the top of the file:

```typescript
import { UFluid } from "../fluid/fluid";
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @ultimate/ng test -- input-text.spec.ts`
Expected: the `hasFluid`/ancestor test and the reactive-forms test should already pass if Task 4 was implemented correctly (this step is a regression/completeness check, not new-feature TDD) — the `does not implement ControlValueAccessor` test is the one most likely to genuinely fail if `UInputText` accidentally picked up CVA methods from an incorrect base-class choice. If any test fails unexpectedly, read `packages/ng/src/input-text/input-text.ts` directly before assuming which line is wrong.

- [ ] **Step 3: Fix any failures found in Step 2**

If `hasFluid` incorrectly returns `false` with an ancestor `UFluid` present, verify the `inject(UFluid, { optional: true, host: true, skipSelf: true })` call matches `UFluid`'s own selector (`u-fluid`, a `@Component`, confirmed injectable as a host ancestor via Angular's `host: true` DI flag — components are valid injection targets the same way directives are).

- [ ] **Step 4: Run the full `ng` test suite**

Run: `pnpm --filter @ultimate/ng test`
Expected: PASS, all tests including `input-text.spec.ts`'s full set and every pre-existing component's tests (regression check).

- [ ] **Step 5: Commit**

```bash
git add packages/ng/src/input-text/input-text.spec.ts
git commit -m "test(ng): cover UInputText forms integration, invalid/fluid state, CVA non-implementation"
```

---

### Task 6: Provenance manifests

**Files:**
- Modify: `docs/architecture/provenance/ng-core.json`
- Modify: `docs/architecture/provenance/ng.json`

**Interfaces:**
- Consumes: nothing — documentation-only task.
- Produces: nothing consumed by later tasks — documentation-only task.

- [ ] **Step 1: Add `UModelHolder` entries to `ng-core.json`**

Insert after the existing `base-editable-holder`-related entries (matching that block's own JSON array position), following the exact shape of the `basecomponent`/`base-editable-holder` entries read during plan research:

```json
  {
    "originalPath": "packages/primeng/src/basemodelholder/basemodelholder.ts",
    "ultimateDestination": "packages/ng-core/src/model-holder/model-holder.ts",
    "modificationStatus": "reimplemented-with-reference",
    "modificationDescription": "Ultimate-owned reimplementation of PrimeNG's BaseModelHolder, inserted between UBaseComponent and UBaseEditableHolder to match real PrimeNG's BaseComponent -> BaseModelHolder -> BaseEditableHolder ordering exactly. Owns model-value state only (modelValue signal, $filled computed via @ultimate/uix-utils's isNotEmpty, writeModelValue) -- no ControlValueAccessor methods, matching real BaseModelHolder's own scope exactly (BaseEditableHolder, one tier up, owns CVA, not BaseModelHolder)."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/ng-core/src/model-holder/model-holder.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream. Verifies modelValue/writeModelValue and the $filled computed's isNotEmpty-derived truthiness across undefined/empty-string/empty-array/non-empty-string/zero."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/ng-core/src/model-holder/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent file."
  },
```

- [ ] **Step 2: Update the existing `base-editable-holder.ts` entry's `modificationDescription`**

Find the existing entry (`ultimateDestination: "packages/ng-core/src/base-editable-holder/base-editable-holder.ts"`) and replace its `modificationDescription` value with:

```
"Ultimate-owned reimplementation of PrimeNG's BaseEditableHolder, extending UModelHolder (was UBaseComponent directly prior to this workstream -- GAP-018's BaseModelHolder-equivalent tier). Preserves the confirmed split-signal pattern for disabled state (disabled is a read-only input(), setDisabledState writes to a separate writable _disabled signal, $disabled computed combines both) since Angular's input() has no .set(). Does not provide NG_VALUE_ACCESSOR on the base class -- confirmed against real PrimeNG source that every leaf component (e.g. Checkbox) redeclares its own provider rather than inheriting one."
```

- [ ] **Step 3: Add `UInputText` entries to `ng.json`**

Insert following the exact shape of the `checkbox.ts` entry read during plan research:

```json
  {
    "originalPath": "packages/primeng/src/inputtext/inputtext.ts",
    "ultimateDestination": "packages/ng/src/input-text/input-text.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Extracted via extract-primeng-source.mjs from primeng@21.1.9. InputText->UInputText, selector [pInputText]->[uInputText], extends UModelHolder directly (matching real InputText extends BaseModelHolder exactly -- InputText does not use BaseEditableHolder or BaseInput). Reads NgControl (optional, self) read-only to sync modelValue/$filled for p-filled styling -- does NOT implement ControlValueAccessor, provides no NG_VALUE_ACCESSOR; Angular's native DefaultValueAccessor remains the sole accessor. hasFluid DI-injects an ancestor UFluid (optional, host, skipSelf) -- the first Ultimate component to implement this ancestor-lookup mechanism (UButton deliberately excludes it, see UButton's own doc comment). Deliberately excludes upstream's pt/ptInputText/pInputTextPT/pInputTextUnstyled passthrough system and Bind host-directive wiring, hostName/$pcInputText sibling-instance lookup, PARENT_INSTANCE DI-token lookup (all excluded platform-wide per ADR-018's Option B), and pSize/inputSize/the NgModule re-export wrapper (ADR-019 forbids new NgModule authorship)."
  },
  {
    "originalPath": "packages/primeng/src/inputtext/style/inputtextstyle.ts",
    "ultimateDestination": "packages/ng/src/input-text/input-text-style.ts",
    "modificationStatus": "adapted",
    "modificationDescription": "Extracted via extract-primeng-source.mjs from primeng@21.1.9. InputTextStyle's classes.root resolver ported, .p-inputtext* renamed to .u-input-text*; p-filled/p-invalid/p-inputtext-fluid/p-variant-filled kept unrenamed to match @ultimate/uix-styles/inputtext's own literal CSS selectors (same precedent as checkbox-style.ts's p-highlight/p-disabled). Reshaped to UBaseComponent's cx(key, params) plain-object contract rather than upstream's ({instance}) => ... resolver shape."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/ng/src/input-text/input-text.spec.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored test, not derived from upstream's inputtext.spec.ts's non-PassThrough blocks. Verifies native-input rendering, modelValue/$filled sync on input events, reactive-forms FormControl integration, invalid/fluid/variant class reflection, ancestor-UFluid detection, and explicit non-implementation of ControlValueAccessor."
  },
  {
    "originalPath": "n/a",
    "ultimateDestination": "packages/ng/src/input-text/index.ts",
    "modificationStatus": "authored",
    "modificationDescription": "Ultimate-authored barrel re-export, no upstream equivalent file."
  },
```

- [ ] **Step 4: Validate the provenance manifests parse and pass CI's validator**

Run: `node scripts/provenance/validate-provenance.mjs`
Expected: PASS (or the equivalent npm script — check `package.json`'s root `scripts` block for the exact invocation, e.g. `pnpm provenance:validate`, before assuming the raw `node` invocation is correct).

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/provenance/ng-core.json docs/architecture/provenance/ng.json
git commit -m "docs(provenance): record UModelHolder and UInputText"
```

---

### Task 7: `COMPONENT_INVENTORY.md`, `BLUEPRINT_GAPS.md`, and a new ADR

**Files:**
- Modify: `docs/architecture/COMPONENT_INVENTORY.md:46,61`
- Modify: `docs/architecture/BLUEPRINT_GAPS.md` (GAP-018 entry, plus new GAP-038)
- Modify: `docs/architecture/DECISIONS.md` (new ADR-046)

**Interfaces:**
- Consumes: nothing — documentation-only task.
- Produces: nothing consumed by later tasks — documentation-only, final task in this plan.

- [ ] **Step 1: Split the `COMPONENT_INVENTORY.md` foundation-tier row**

Replace line 46 (`| BaseModelHolder / BaseInput (foundation tier, not yet built) | ...`) with two rows — a built row and a narrower still-remaining row:

```
| BaseModelHolder (foundation tier, built)                     | `packages/primeng/src/basemodelholder/`                                    | Foundation | extends `UBaseComponent` (built, Phase 2)        | uix-utils                                                    | shared `modelValue`/`$filled` state tier `InputText`/`Textarea` extend directly, per real PrimeNG's own `BaseComponent -> BaseModelHolder -> BaseEditableHolder` ordering (GAP-018, resolved)                                    | n/a (infrastructure) | n/a                                                 | ADAPT          | Built — this workstream                                                               | N/A — built                                                                        |
| BaseInput (foundation tier, not yet built)                    | `packages/primeng/src/baseinput/`                                          | Foundation | extends `UBaseEditableHolder` (built, Phase 2)   | uix-utils, uix-styled | richer `fluid`/`variant`/`size`/`pattern`/`min`/`max`/`step`/`minlength`/`maxlength` tier only `InputMask`/`Password`/`AutoComplete`/`DatePicker`/`InputNumber`/`Select` extend — correctly deferred, no real consumer yet (GAP-038) | n/a (infrastructure) | n/a                                                 | ADAPT          | Later Phase — first real consumer is the first of InputMask/Password/AutoComplete/DatePicker/InputNumber/Select to migrate | Low — pattern already proven once by `UModelHolder`/`UInputText` in this workstream |
```

- [ ] **Step 2: Move the `InputText` row from remaining to built**

Confirm the exact current text of line 61 by reading it directly, then move that row (with `Later Phase` corrected to `Built — this workstream` and `Risk` corrected to `N/A — built`) into whichever table in `COMPONENT_INVENTORY.md` holds already-built Form components (locate this table by reading the file's structure directly — do not guess its heading text), removing it from the still-remaining Form components table.

- [ ] **Step 3: Update the file's own summary count**

`COMPONENT_INVENTORY.md`'s own reconciliation line (originally "14 exclusively built... 101 exclusively remaining... 14 + 2 + 101 = 117") needs its counts incremented by the components this workstream adds. Read that exact line directly (its precise wording is quoted in `BLUEPRINT_GAPS.md` §2's "Corrected count" — cross-reference, then verify against `COMPONENT_INVENTORY.md` itself, since the two must stay consistent) and update the arithmetic to reflect `InputText` moving from remaining to built, plus `BaseModelHolder` moving from not-built to built (whether the foundation-tier row counts toward the 117-directory total at all needs verifying directly against how the existing `BaseModelHolder / BaseInput` combined row was counted before this split — read the summary line's exact accounting method before changing any number).

- [ ] **Step 4: Update GAP-018 in `BLUEPRINT_GAPS.md`**

Replace the GAP-018 entry's `**Status:**` line and add resolution evidence, following GAP-009's "resolved as amended, narrower than originally scoped" pattern:

```markdown
#### GAP-018 — `BaseModelHolder`/`BaseInput` foundation tier not yet built for Angular; blocks ~20 native-input form components
- **Status:** RESOLVED (for the `BaseModelHolder`-equivalent slice specifically; see GAP-038 for the narrower, still-open `BaseInput`-equivalent remainder)
- **Type:** Foundation, Component, Framework (Angular)
- **Blocking level:** N/A (resolved for its most valuable slice)
- **Current evidence:** Direct extraction of real pinned PrimeNG 21.1.9 source during this workstream's spec found this entry's own original framing blurred two distinct tiers together: `BaseModelHolder` (minimal — `modelValue`/`$filled`/`writeModelValue`) and `BaseInput` (richer — `fluid`/`variant`/`size`/`pattern`/etc.), with `InputText`/`Textarea` extending `BaseModelHolder` directly, never `BaseInput`. `packages/ng-core/src/model-holder/model-holder.ts`'s `UModelHolder` now implements the `BaseModelHolder`-equivalent tier, inserted between `UBaseComponent` and `UBaseEditableHolder`. `packages/ng/src/input-text/input-text.ts`'s `UInputText` is the first real consumer, proving the tier end-to-end the same way `UCheckbox` proved `UBaseEditableHolder` in Phase 2.
- **Expected state:** A `modelValue`/`$filled` tier exists and has a real, tested consumer. **Met**, for this narrower, correctly-scoped slice.
- **Why it matters:** Unblocks any future Angular Form component that only needs `BaseModelHolder`-level capability (e.g. `Textarea`) without requiring the richer `BaseInput` tier.
- **What it blocks:** Nothing — resolved for its own slice. See GAP-038 for what remains.
- **Dependencies:** None.
- **Framework scope:** Angular only.
- **Existing reusable infrastructure:** N/A — resolved.
- **Recommended resolution direction:** N/A — resolved for this slice.
- **Source/evidence:** `packages/ng-core/src/model-holder/model-holder.ts`; `packages/ng/src/input-text/input-text.ts`; `docs/superpowers/specs/2026-09-16-angular-form-foundation-design.md`; `docs/superpowers/plans/2026-09-16-angular-form-foundation.md`; ADR-046.
- **Architectural decision required:** No.
```

- [ ] **Step 5: Add GAP-038 in `BLUEPRINT_GAPS.md`**

Insert as a new entry after GAP-037 (the current last entry, per this workstream's plan-research finding that GAP-037 was the highest existing number):

```markdown
#### GAP-038 (added during Angular Form Foundation workstream) — `BaseInput` foundation tier (richer `fluid`/`variant`/`size`/`pattern`/etc.) not yet built for Angular; blocks `InputMask`/`Password`/`AutoComplete`/`DatePicker`/`InputNumber`/`Select`
- **Status:** DEFERRED (correctly, by design — no real consumer yet)
- **Type:** Foundation, Component, Framework (Angular)
- **Blocking level:** MEDIUM
- **Current evidence:** Direct extraction of real pinned PrimeNG 21.1.9 source confirmed `BaseInput` (`packages/primeng/src/baseinput/baseinput.ts`) extends `BaseEditableHolder` and is extended only by `InputMask`, `Password`, `AutoComplete`, `DatePicker`, `InputNumber`, `Select` — none of which this workstream migrates. `UModelHolder`/`UInputText` (this workstream) proved the narrower `BaseModelHolder`-equivalent tier; `BaseInput`'s own tier remains unbuilt.
- **Expected state:** Built once a real consumer justifies it, per the same YAGNI reasoning GAP-018 itself was originally deferred under.
- **Why it matters:** Six Form components depend on this tier existing before they can migrate.
- **What it blocks:** `InputNumber`, `Password`, `InputMask`, `AutoComplete`, `DatePicker`, `Select` migration.
- **Dependencies:** Extends `UModelHolder`/`UBaseEditableHolder` (both now built) — no upstream blocker.
- **Framework scope:** Angular.
- **Existing reusable infrastructure:** `UModelHolder`/`UBaseEditableHolder`'s now-proven pattern is the direct template to extend.
- **Recommended resolution direction:** Build `UBaseInput`-equivalent as the first task of whichever future workstream migrates the first of the six blocked components — likely `InputNumber` or `Password`, per COMPONENT_INVENTORY.md's own risk/priority framing.
- **Source/evidence:** `docs/superpowers/specs/2026-09-16-angular-form-foundation-design.md`; real PrimeNG source (`baseinput.ts`, `inputnumber.ts`, `password.ts`, `autocomplete.ts`, `datepicker.ts`, `inputmask.ts`, `select.ts`).
- **Architectural decision required:** No — pattern already established by `UModelHolder`/`UInputText`.
```

- [ ] **Step 6: Add ADR-046 to `DECISIONS.md`**

Insert after ADR-045 (the current last entry):

```markdown
## ADR-046 — `UModelHolder` inserted between `UBaseComponent` and `UBaseEditableHolder`; `UInputText` is the first ancestor-`UFluid`-detecting component

Status: Accepted (Angular Form Foundation Tier spec, confirmed by implementation). Real PrimeNG 21.1.9's `BaseComponent -> BaseModelHolder -> BaseEditableHolder -> BaseInput` chain was found, during this workstream's Real-Source Verification Gate, to be two distinct tiers GAP-018's original registry text had blurred together — `BaseModelHolder` (minimal: `modelValue`/`$filled`/`writeModelValue`) and `BaseInput` (richer: `fluid`/`variant`/`size`/etc.), with `InputText`/`Textarea` extending `BaseModelHolder` directly, never `BaseEditableHolder` or `BaseInput`. `UModelHolder` is inserted into Angular's existing `UBaseComponent -> UBaseEditableHolder` chain at the position matching real PrimeNG's own ordering (`UBaseComponent -> UModelHolder -> UBaseEditableHolder`), and owns model-value state only — no `ControlValueAccessor` methods, matching real `BaseModelHolder`'s own scope exactly. `UInputText` extends `UModelHolder` directly (skipping `UBaseEditableHolder`), reads `NgControl` read-only purely to sync `UModelHolder` state, and does not implement `ControlValueAccessor` itself — Angular's native `DefaultValueAccessor` remains the sole accessor for the underlying `<input>` element, matching real `InputText`'s own architecture (an attribute directive, not a CVA-implementing wrapper). Separately, this workstream's `hasFluid` (ancestor `UFluid` DI-lookup via `inject(UFluid, {optional, host, skipSelf})`) is the first Ultimate component to actually implement this mechanism — `UButton`'s own doc comment (Phase 3) documents that it deliberately excludes this exact pattern as "a host-DI-lookup mechanism `UBaseComponent`'s scoped-down Option B architecture has no equivalent for." `UInputText` closes that gap for itself specifically, without retroactively adding it to `UButton`. The richer `BaseInput`-equivalent tier remains deferred (GAP-038) — no real consumer in this workstream justifies building it speculatively.
```

- [ ] **Step 7: Run the whole-workspace boundary/typecheck verification suite**

Run: `pnpm -r run typecheck && pnpm -r run boundary:validate`

(Verify these are the exact script names by checking each affected package's `package.json` `scripts` block directly — `ng-core`, `ng`, `uix-styles` — before running; the Global Constraints section's existing-convention note means these gates already exist, but their exact invocation strings must be confirmed, not assumed.)

Expected: PASS, zero regressions across the whole workspace.

- [ ] **Step 8: Commit**

```bash
git add docs/architecture/COMPONENT_INVENTORY.md docs/architecture/BLUEPRINT_GAPS.md docs/architecture/DECISIONS.md
git commit -m "docs(architecture): resolve GAP-018's BaseModelHolder slice, record GAP-038 and ADR-046"
```

---

## Final Verification

- [ ] **Run the full workspace test suite**

Run: `pnpm -r test`
Expected: PASS, zero regressions in any package.

- [ ] **Run the full workspace build**

Run: `pnpm -r build`
Expected: PASS, including `@ultimate/ng`'s new `input-text` secondary entry point and `@ultimate/uix-styles`'s new `inputtext` subpath.

- [ ] **Confirm `BLUEPRINT.md` was not touched**

Run: `git diff main -- docs/architecture/BLUEPRINT.md`
Expected: empty output.

- [ ] **Commit any final cleanup, then stop — do not open a PR or merge without the user's explicit instruction.**
