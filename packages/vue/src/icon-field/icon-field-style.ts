import type { StyleModule } from "@ultimate/vue-core";
import { style as iconFieldStyle } from "@ultimate/uix-styles/iconfield";

/**
 * `createBaseComponent`-shaped style modules for `UIconField` and
 * `UInputIcon`. The structural CSS is the shared
 * `@ultimate/uix-styles/iconfield` module (ADR-082), so it reads the Aura
 * `iconfield` tokens and matches Angular and React. Real `InputIconStyle`
 * carries `classes` only, so `.u-input-icon` is styled by the IconField
 * module.
 */
const css = /*css*/ `
    ${iconFieldStyle}
`;

/** `createBaseComponent`-shaped style module for `UIconField` — owns the shared `.u-icon-field`/`.u-input-icon` CSS. */
export const iconFieldStyleModule: StyleModule = {
  css,
  classes: { root: "u-icon-field" },
};

/** `createBaseComponent`-shaped style module for `UInputIcon` — classes only, empty `css`. */
export const inputIconStyleModule: StyleModule = {
  css: "",
  classes: { root: "u-input-icon" },
};
