/**
 * Ultimate-owned adaptation of PrimeNG's `ProgressSpinnerStyle` (see
 * `.vendor-extracted/ng/progressspinner/style/progressspinnerstyle.ts`),
 * shaped to match `UBaseComponent`'s `styleModule: {css, classes}`
 * contract. No `@ultimate/uix-styles/progressspinner` entry exists yet, so
 * `css`/`classes` are authored locally (same precedent as
 * `fieldsetStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-progress-spinner{position: relative;margin: 0 auto;width: 100px;height: 100px;display: inline-block;}
.u-progress-spinner::before{content: '';display: block;padding-top: 100%;}
.u-progress-spinner-spin{height: 100%;transform-origin: center center;width: 100%;position: absolute;top: 0;bottom: 0;left: 0;right: 0;margin: auto;animation: u-progressspinner-rotate 2s linear infinite;}
.u-progress-spinner-circle{stroke-dasharray: 89, 200;stroke-dashoffset: 0;stroke: dt('progressspinner.colorOne');animation: u-progressspinner-dash 1.5s ease-in-out infinite, u-progressspinner-color 6s ease-in-out infinite;stroke-linecap: round;}
@keyframes u-progressspinner-rotate{100%{transform: rotate(360deg);}}
@keyframes u-progressspinner-dash{0%{stroke-dasharray: 1, 200;stroke-dashoffset: 0;}50%{stroke-dasharray: 89, 200;stroke-dashoffset: -35px;}100%{stroke-dasharray: 89, 200;stroke-dashoffset: -124px;}}
@keyframes u-progressspinner-color{100%, 0%{stroke: dt('progressspinner.color.one');}40%{stroke: dt('progressspinner.color.two');}66%{stroke: dt('progressspinner.color.three');}80%, 90%{stroke: dt('progressspinner.color.four');}}
`;

const classes = {
  root: "u-progress-spinner u-component",
  spin: "u-progress-spinner-spin",
  circle: "u-progress-spinner-circle",
};

/** `UBaseComponent`-shaped style module for `UProgressSpinner`. */
export const progressSpinnerStyleModule = { css, classes };
