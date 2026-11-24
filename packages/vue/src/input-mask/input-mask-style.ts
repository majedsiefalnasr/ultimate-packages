import type { StyleModule } from "@ultimate/vue-core";

/**
 * Style module for `UInputMask`. PrimeVue's `InputMaskStyle` carries no CSS of
 * its own: the component renders a nested `UInputText`, which registers the
 * shared `@ultimate/uix-styles/inputtext` rules (ADR-082). The root class is
 * the hook for pass-through and for sibling selectors.
 */
const css = "";

const classes = {
  root: "u-inputmask",
};

export const inputMaskStyleModule: StyleModule = { css, classes };
