import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `PasswordStyle` (see
 * `.vendor-extracted/vue/password/style/PasswordStyle.js`, sourced from
 * `@primeuix/styles/password`), shaped to match `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. Hand-ported directly, same reason
 * documented in `packages/ng/src/password/password-style.ts`: no
 * `@ultimate/uix-styles/password` subpath exists yet and this task may not
 * add one.
 *
 * `.p-password*` selectors renamed to `.u-password*`; `p-invalid`/
 * `p-disabled`/`p-filled` kept unrenamed, matching the established
 * precedent (`packages/vue/src/toggle-switch/toggle-switch-style.ts`).
 */
const css = /*css*/ `
    .u-password {
        display: inline-flex;
        position: relative;
    }

    .u-password-input {
        width: 100%;
    }

    .u-password.u-password-fluid {
        display: flex;
    }

    .u-password-overlay {
        position: absolute;
        top: 0;
        left: 0;
        min-width: 100%;
        background: dt('password.overlay.background');
        color: dt('password.overlay.color');
        border: 1px solid dt('password.overlay.border.color');
        border-radius: dt('password.overlay.border.radius');
        box-shadow: dt('password.overlay.shadow');
        padding: dt('password.content.padding');
        gap: dt('password.content.gap');
        display: flex;
        flex-direction: column;
    }

    .u-password-meter {
        height: 10px;
        background: dt('password.meter.background');
        border-radius: dt('password.meter.border.radius');
    }

    .u-password-meter-label {
        height: 100%;
        width: 0%;
        border-radius: dt('password.meter.border.radius');
        transition: width 1s ease-in-out;
        background: dt('password.meter.weak.background');
    }

    .u-password-meter-label-weak {
        background: dt('password.strength.weak.background');
    }

    .u-password-meter-label-medium {
        background: dt('password.strength.medium.background');
    }

    .u-password-meter-label-strong {
        background: dt('password.strength.strong.background');
    }

    .u-password-meter-text {
        color: dt('password.meter.text.color');
    }

    /* Visually hidden, still exposed to assistive tech. Same declarations as
       PrimeVue's .p-hidden-accessible (packages/core/src/base/style/BaseStyle.js:7-19). */
    .u-password-hidden-accessible {
        border: 0;
        clip: rect(0 0 0 0);
        height: 1px;
        margin: -1px;
        opacity: 0;
        overflow: hidden;
        padding: 0;
        pointer-events: none;
        position: absolute;
        white-space: nowrap;
        width: 1px;
    }

    .u-password-mask-icon,
    .u-password-unmask-icon,
    .u-password-clear-icon {
        cursor: pointer;
        position: absolute;
        top: 50%;
        inset-inline-end: dt('password.icon.right');
        margin-block-start: calc(-1 * calc(dt('icon.size') / 2));
        color: dt('password.icon.color');
    }
`;

export interface PasswordClassesParams {
  filled?: boolean;
  fluid?: boolean;
  disabled?: boolean;
  strength?: string | null;
}

const classes = {
  root: (params: PasswordClassesParams = {}) => [
    "u-password u-component",
    {
      "p-filled": Boolean(params.filled),
      "u-password-fluid": Boolean(params.fluid),
      "p-disabled": Boolean(params.disabled),
    },
  ],
  pcInputText: "u-password-input",
  maskIcon: "u-password-mask-icon",
  unmaskIcon: "u-password-unmask-icon",
  clearIcon: "u-password-clear-icon",
  overlay: "u-password-overlay",
  meter: "u-password-meter",
  meterLabel: (params: PasswordClassesParams = {}) =>
    params.strength ? `u-password-meter-label u-password-meter-label-${params.strength}` : "u-password-meter-label",
  meterText: "u-password-meter-text",
  hiddenAccessible: "u-password-hidden-accessible",
};

/** `createBaseComponent`-shaped style module for `UPassword`. */
export const passwordStyleModule: StyleModule = { css, classes };
