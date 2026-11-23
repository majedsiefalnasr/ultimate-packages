import { style as iconFieldStyle } from "@ultimate/uix-styles/iconfield";

/**
 * `UBaseComponent`-shaped style modules for `UIconField` and `UInputIcon`.
 * The structural CSS is the shared `@ultimate/uix-styles/iconfield` module
 * (ADR-082), so it reads the Aura `iconfield` tokens and matches React and
 * Vue. Real `InputIconStyle` carries `classes` only, so `.u-input-icon` is
 * styled by the IconField module.
 */
const css = /*css*/ `
    ${iconFieldStyle}
`;

/** Params `UIconField` passes into `cx('root', params)` — see `UBaseComponent.cx()`. */
export interface IconFieldClassesParams {
  iconPosition?: "left" | "right";
}

/**
 * Class-name-slot resolver for `UIconField`, ported from the extracted
 * `IconFieldStyle`'s own `classes.root` function (`.p-iconfield*` renamed to
 * `.u-icon-field*`).
 */
const classes = {
  root: (params: IconFieldClassesParams = {}) => {
    const { iconPosition } = params;
    return [
      "u-icon-field",
      {
        "u-icon-field-left": iconPosition === "left",
        "u-icon-field-right": iconPosition === "right",
      },
    ];
  },
};

/** `UBaseComponent`-shaped style module for `UIconField` — owns the shared `.u-icon-field`/`.u-input-icon` CSS. */
export const iconFieldStyleModule = { css, classes };

/**
 * `UBaseComponent`-shaped style module for `UInputIcon` — classes only, no
 * own `css` string (registers an empty style body), matching real
 * `InputIconStyle`'s own `classes`-only shape exactly: `.u-input-icon`'s
 * rules are owned by `iconFieldStyleModule.css` above, registered whenever
 * an `UIconField` mounts (always the case, since `UInputIcon` has no
 * standalone use documented in real source either).
 */
export const inputIconStyleModule = {
  css: "",
  classes: {
    root: "u-input-icon",
  },
};
