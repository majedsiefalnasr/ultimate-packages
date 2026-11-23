import type { StyleModule } from "@ultimate/react-core";
import { style as inputGroupStyle } from "@ultimate/uix-styles/inputgroup";

/**
 * `useComponentBase`-shaped style modules for `UInputGroup` and
 * `UInputGroupAddon`. The structural CSS is the shared
 * `@ultimate/uix-styles/inputgroup` module (ADR-082), so it reads the Aura
 * `inputgroup` tokens (ADR-067) and matches Angular and Vue. PrimeReact ships
 * no InputGroup component (ADR-092).
 */
const css = /*css*/ `
    ${inputGroupStyle}
`;

/** `useComponentBase`-shaped style module for `UInputGroup` — owns the shared CSS. */
export const inputGroupStyleModule: StyleModule = {
  css,
  classes: { root: "u-input-group" },
};

/** `useComponentBase`-shaped style module for `UInputGroupAddon` — classes only, empty `css`. */
export const inputGroupAddonStyleModule: StyleModule = {
  css: "",
  classes: { root: "u-input-group-addon" },
};
