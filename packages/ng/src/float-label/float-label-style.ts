import { style as floatLabelStyle } from "@ultimate/uix-styles/floatlabel";

/**
 * `UBaseComponent`-shaped style module for `UFloatLabel`. The structural CSS
 * is the shared `@ultimate/uix-styles/floatlabel` module (ADR-082), so it
 * reads the Aura `floatlabel` tokens and matches React and Vue.
 *
 * The `.ng-invalid.ng-dirty` rule is Angular-only (PrimeNG
 * `floatlabelstyle.ts:8-12`): Angular forms mark a control invalid through
 * those classes, which React and Vue have no counterpart for.
 */
const css = /*css*/ `
    ${floatLabelStyle}

    .u-float-label:has(.ng-invalid.ng-dirty) label {
        color: dt('floatlabel.invalid.color');
    }
`;

/** Params `UFloatLabel` passes into `cx('root', params)` — see `UBaseComponent.cx()`. */
export interface FloatLabelClassesParams {
  variant?: "in" | "over" | "on";
}

/**
 * Class-name-slot resolver for `UFloatLabel`, ported from the extracted
 * `FloatLabelStyle`'s own `classes.root` function (`.p-floatlabel*` renamed
 * to `.u-float-label*`).
 */
const classes = {
  root: (params: FloatLabelClassesParams = {}) => {
    const { variant } = params;
    return [
      "u-float-label",
      {
        "u-float-label-over": variant === "over",
        "u-float-label-on": variant === "on",
        "u-float-label-in": variant === "in",
      },
    ];
  },
};

/** `UBaseComponent`-shaped style module for `UFloatLabel`. */
export const floatLabelStyleModule = { css, classes };
