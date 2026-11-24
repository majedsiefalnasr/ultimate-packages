import { style as chipStyle } from "@ultimate/uix-styles/chip";

/**
 * Ultimate-owned adaptation of PrimeVue's `ChipStyle` (see
 * `.vendor-extracted/vue/chip/style`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. The
 * structural CSS is the shared `@ultimate/uix-styles/chip` module (ADR-082),
 * so it reads the Aura `chip` tokens and matches Angular and React.
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

/** `createBaseComponent`-shaped style module for `UChip`. */
export const chipStyleModule = { css, classes };
