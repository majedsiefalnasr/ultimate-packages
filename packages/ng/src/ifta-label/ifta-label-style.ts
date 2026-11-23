import { style as iftaLabelStyle } from "@ultimate/uix-styles/iftalabel";

/**
 * `UBaseComponent`-shaped style module for `UIftaLabel`. The structural CSS
 * is the shared `@ultimate/uix-styles/iftalabel` module (ADR-082), so it
 * reads the Aura `iftalabel` tokens and matches Vue.
 *
 * The `.ng-invalid.ng-dirty` rule is Angular-only (PrimeNG
 * `iftalabelstyle.ts`): Angular forms mark a control invalid through those
 * classes, which Vue has no counterpart for.
 */
const css = /*css*/ `
    ${iftaLabelStyle}

    .u-ifta-label:has(.ng-invalid.ng-dirty) label {
        color: dt('iftalabel.invalid.color');
    }
`;

/** `UBaseComponent`-shaped style module for `UIftaLabel`. */
export const iftaLabelStyleModule = {
  css,
  classes: {
    root: "u-ifta-label",
  },
};
