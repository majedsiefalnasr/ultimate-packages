import type { StyleModule } from "@ultimate/react-core";
import { style as chipStyle } from "@ultimate/uix-styles/chip";

/**
 * Ultimate-owned adaptation of PrimeReact's `ChipBase` style (real source:
 * `components/lib/chip/ChipBase.js`'s `css`/`classes`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. The structural
 * CSS is the shared `@ultimate/uix-styles/chip` module (ADR-082), so it reads
 * the Aura `chip` tokens (ADR-067) and matches Angular and Vue.
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

/** `useComponentBase`-shaped style module for `UChip`. */
export const chipStyleModule: StyleModule = { css, classes };
