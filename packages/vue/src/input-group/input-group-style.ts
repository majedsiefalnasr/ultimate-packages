import type { StyleModule } from "@ultimate/vue-core";
import { style as inputGroupStyle } from "@ultimate/uix-styles/inputgroup";

/**
 * `createBaseComponent`-shaped style modules for `UInputGroup` and
 * `UInputGroupAddon`. The structural CSS is the shared
 * `@ultimate/uix-styles/inputgroup` module (ADR-082), so it reads the Aura
 * `inputgroup` tokens and matches Angular. The addon owns no CSS of its own.
 */
const css = /*css*/ `
    ${inputGroupStyle}
`;

/** `createBaseComponent`-shaped style module for `UInputGroup` — owns the shared CSS. */
export const inputGroupStyleModule: StyleModule = {
  css,
  classes: { root: "u-input-group" },
};

/**
 * `createBaseComponent`-shaped style module for `UInputGroupAddon` —
 * classes only, matching PrimeVue's `InputGroupAddonStyle`.
 */
export const inputGroupAddonStyleModule: StyleModule = {
  css: "",
  classes: { root: "u-input-group-addon" },
};
