import { style as inputGroupStyle } from "@ultimate/uix-styles/inputgroup";

/**
 * `UBaseComponent`-shaped style modules for `UInputGroup` and
 * `UInputGroupAddon`. The structural CSS is the shared
 * `@ultimate/uix-styles/inputgroup` module (ADR-082), so it reads the Aura
 * `inputgroup` tokens and matches Vue. Only the Angular-specific host-element
 * rules live here: PrimeNG targets the `p-button` and `p-inputmask` host
 * elements, which Ultimate renames to `u-button` and `u-input-mask`.
 */
const css = /*css*/ `
    ${inputGroupStyle}

    .u-input-group > u-button > .u-button {
        border-radius: 0;
        margin: 0;
    }

    .u-input-group > u-button:first-child,
    .u-input-group > u-button:last-child {
        display: inline-flex;
    }

    .u-input-group:has(> u-button:first-child) .u-button {
        border-start-start-radius: dt('inputgroup.addon.border.radius');
        border-end-start-radius: dt('inputgroup.addon.border.radius');
    }

    .u-input-group:has(> u-button:last-child) .u-button {
        border-start-end-radius: dt('inputgroup.addon.border.radius');
        border-end-end-radius: dt('inputgroup.addon.border.radius');
    }

    .u-input-group > u-input-mask > .u-inputtext {
        width: 100%;
    }
`;

/** `UBaseComponent`-shaped style module for `UInputGroup` — owns the shared CSS. */
export const inputGroupStyleModule = {
  css,
  classes: {
    root: "u-input-group",
  },
};

/**
 * `UBaseComponent`-shaped style module for `UInputGroupAddon` — classes
 * only. Its rules are owned by `inputGroupStyleModule`, as PrimeNG's
 * `InputGroupAddonStyle` carries classes only.
 */
export const inputGroupAddonStyleModule = {
  css: "",
  classes: {
    root: "u-input-group-addon",
  },
};
