import type { StyleModule } from "@ultimate/react-core";
import { style as iconFieldStyle } from "@ultimate/uix-styles/iconfield";

/**
 * `useComponentBase`-shaped style modules for `UIconField` and `UInputIcon`.
 * The structural CSS is the shared `@ultimate/uix-styles/iconfield` module
 * (ADR-082), so it reads the Aura `iconfield` tokens (ADR-067) and matches
 * Angular and Vue. Real `InputIconBase` carries `classes` only, so
 * `.u-input-icon` is styled by the IconField module.
 */
const css = /*css*/ `
    ${iconFieldStyle}
`;

const classes = {
  root: (params: { iconPosition?: "left" | "right" } = {}) => [
    "u-icon-field",
    {
      "u-icon-field-left": params.iconPosition === "left",
      "u-icon-field-right": params.iconPosition === "right",
    },
  ],
};

/** `useComponentBase`-shaped style module for `UIconField` — owns the shared `.u-icon-field`/`.u-input-icon` CSS. */
export const iconFieldStyleModule: StyleModule = { css, classes };

/** `useComponentBase`-shaped style module for `UInputIcon` — classes only, empty `css`. */
export const inputIconStyleModule: StyleModule = {
  css: "",
  classes: { root: "u-input-icon" },
};
