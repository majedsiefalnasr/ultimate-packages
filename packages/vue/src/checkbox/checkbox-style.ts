import type { StyleModule } from "@ultimate/vue-core";
import { style as checkboxCss } from "@ultimate/uix-styles/checkbox";

/**
 * Implementation-time verification finding (this task's Step 2, same
 * mismatch already found for `@ultimate/uix-styles/button` in Task 17 and
 * `@ultimate/uix-styles/tooltip` in Task 18): the brief's draft assumed
 * `@ultimate/uix-styles/checkbox` exports a `checkboxStyle` object already
 * shaped as `StyleModule`'s `{ css, classes }` contract. The real file
 * (`packages/uix-styles/src/checkbox/index.ts`) only exports a plain
 * `style: string` — raw CSS with `dt()` token references, no `classes`
 * resolver map at all. `StyleModule`
 * (`packages/vue-core/src/base/base-component.ts`) requires both `css` and
 * a `classes` map of per-slot resolvers. The `classes` map below is
 * therefore authored locally here, not re-exported from uix-styles —
 * following the same adaptation already established for button/tooltip.
 *
 * The `root`/`box`/`input`/`icon` slot names and the `checked`/`disabled`/
 * `invalid`/`variant-filled`/`size` params mirror real upstream
 * `CheckboxStyle.js` (`.vendor-extracted/vue/checkbox/style/CheckboxStyle.js`)
 * verbatim, adapted to this project's `u-checkbox*` class-name convention
 * instead of upstream's `p-checkbox*` prefix (matching the same
 * `p-` -> `u-` translation already established for button/tooltip), and to
 * this project's plain-string-array `cx()` contract instead of upstream's
 * `_getOptionValue`/`{ instance, props }` params shape.
 */
const css = /*css*/ `
    ${checkboxCss}
`;

/** Params `UCheckbox` passes into `cx('root', params)` — see `createBaseComponent`'s `cx()`. */
export interface CheckboxClassesParams {
  checked?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  variant?: string | null;
  size?: string | null;
}

const classes = {
  root: (params: CheckboxClassesParams = {}) => {
    const { checked, disabled, invalid, variant, size } = params;

    return [
      "u-checkbox",
      {
        "u-checkbox-checked": Boolean(checked),
        "p-disabled": Boolean(disabled),
        "p-invalid": Boolean(invalid),
        "p-variant-filled": variant === "filled",
        "u-checkbox-sm": size === "small",
        "u-checkbox-lg": size === "large",
      },
    ];
  },
  box: "u-checkbox-box",
  input: "u-checkbox-input",
  icon: "u-checkbox-icon",
};

export const checkboxStyleModule: StyleModule = { css, classes };
