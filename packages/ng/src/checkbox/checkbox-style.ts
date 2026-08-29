import { style as checkboxStyle } from "@ultimate/uix-styles/checkbox";

/**
 * Ultimate-owned adaptation of PrimeNG's `CheckboxStyle` (see
 * `.vendor-extracted/ng/checkbox/style/checkboxstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract (Task 4's
 * `base-component.spec.ts` — a plain object field, not an `@Injectable`
 * service; PrimeNG's own `BaseComponent` DI-injects its style service via
 * `_componentStyle = inject(CheckboxStyle)`, but this project's scoped-down
 * Option B architecture does not).
 *
 * Per Task 3's corrected finding that `@primeuix/styles` never exports a
 * `classes` object, this package's `@ultimate/uix-styles/checkbox` subpath
 * exports only `style` (verified: `packages/uix-styles/src/checkbox/index.ts`)
 * — the `classes` class-name-slot resolver is ported here instead, locally,
 * from the extracted reference file's own `const classes = {...}`, with
 * `.p-checkbox*` selectors renamed to `.u-checkbox*`. The extracted
 * reference's `root` resolver takes `({ instance })` and reads
 * `instance.checked`/`instance.$disabled()`/`instance.invalid()`/
 * `instance.$variant()`/`instance.size()` directly off the component
 * instance; reshaped here to take a plain params object, matching
 * `UBaseComponent.cx(key, params)`'s real call contract (confirmed against
 * `packages/ng-core/src/basecomponent/base-component.ts`), the same pattern
 * already established by `ButtonStyle`/`BadgeStyle`/`TooltipStyle`.
 *
 * `invalid`/`$variant`/`size` are dropped from the params shape: this task's
 * Interfaces section defines `UCheckbox` with only `binary`/`label` (plus
 * inherited `disabled`) — no `invalid`, `variant`, or `size` input exists on
 * `UCheckbox`, so only `checked`/`disabled` drive `classes.root` here.
 *
 * `p-highlight`/`p-disabled` are kept unrenamed (not `.u-highlight`/
 * `.u-disabled`): confirmed against `@ultimate/uix-styles/checkbox`'s own
 * `style` export (`packages/uix-styles/src/checkbox/index.ts`), whose CSS
 * selectors reference `.p-disabled`/`.p-invalid`/`.p-variant-filled`
 * literally, unrenamed — these are PrimeNG-wide structural/shared modifier
 * classes (not `checkbox`-namespaced), so this style module must emit the
 * matching literal class names for the CSS selectors to apply.
 */
const css = /*css*/ `
    ${checkboxStyle}
`;

/** Params `UCheckbox` passes into `cx('root', params)` — see `UBaseComponent.cx()`. */
export interface CheckboxClassesParams {
  checked?: boolean;
  disabled?: boolean;
}

/**
 * Class-name-slot resolver for `UCheckbox`, ported from the extracted
 * `CheckboxStyle`'s own `classes` object (`.p-checkbox*` renamed to
 * `.u-checkbox*`; `p-highlight`/`p-disabled` kept unrenamed to match the
 * literal selectors in `@ultimate/uix-styles/checkbox`'s CSS — see file
 * header. `invalid`/`$variant`/`size` params dropped — no matching inputs
 * on `UCheckbox` per this task's Interfaces section).
 */
const classes = {
  root: (params: CheckboxClassesParams = {}) => {
    const { checked, disabled } = params;

    return [
      "u-checkbox u-component",
      {
        "u-checkbox-checked p-highlight": checked,
        "p-disabled": disabled,
      },
    ];
  },
  box: "u-checkbox-box",
  input: "u-checkbox-input",
  icon: "u-checkbox-icon",
};

/** `UBaseComponent`-shaped style module for `UCheckbox`. */
export const checkboxStyleModule = { css, classes };
