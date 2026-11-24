import { style as chipStyle } from "@ultimate/uix-styles/chip";

/**
 * Ultimate-owned adaptation of PrimeNG's `ChipStyle` (see
 * `.vendor-extracted/ng/chip/style/chipstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. The structural
 * CSS is the shared `@ultimate/uix-styles/chip` module (ADR-082), so it reads
 * the Aura `chip` tokens and matches React and Vue.
 */
const css = /*css*/ `
    ${chipStyle}
`;

const classes = {
  root: (params: { disabled?: boolean } = {}) => [
    "u-chip u-component",
    { "p-disabled": Boolean(params.disabled) },
  ],
  image: "u-chip-image",
  icon: "u-chip-icon",
  label: "u-chip-label",
  removeIcon: "u-chip-remove-icon",
};

/** `UBaseComponent`-shaped style module for `UChip`. */
export const chipStyleModule = { css, classes };
