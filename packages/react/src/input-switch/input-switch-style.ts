import type { StyleModule } from "@ultimate/react-core";
import { style as toggleSwitchStyle } from "@ultimate/uix-styles/toggleswitch";

/**
 * Ultimate-owned adaptation of PrimeReact's `InputSwitchBase` classes (see
 * `.vendor-extracted/react/inputswitch/InputSwitchBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. The structural
 * CSS is the shared `@ultimate/uix-styles/toggleswitch` module (ADR-082), so
 * it reads the Aura `toggleswitch` tokens (ADR-067) and matches Angular and
 * Vue. PrimeReact names this capability `InputSwitch`; the class names are the
 * ToggleSwitch ones the shared module styles.
 */
const css = /*css*/ `
    ${toggleSwitchStyle}
`;

const classes = {
  root: (params: { checked?: boolean; disabled?: boolean; invalid?: boolean } = {}) => [
    "u-toggle-switch u-component",
    {
      "u-toggle-switch-checked": params.checked,
      "p-disabled": params.disabled,
      "p-invalid": params.invalid,
    },
  ],
  input: "u-toggle-switch-input",
  slider: "u-toggle-switch-slider",
  handle: "u-toggle-switch-handle",
};

/** `useComponentBase`-shaped style module for `UInputSwitch`. */
export const inputSwitchStyleModule: StyleModule = { css, classes };
