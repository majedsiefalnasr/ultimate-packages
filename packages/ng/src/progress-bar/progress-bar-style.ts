/**
 * Ultimate-owned adaptation of PrimeNG's `ProgressBarStyle` (see
 * `.vendor-extracted/ng/progressbar/style/progressbarstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/progressbar` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `fieldsetStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-progress-bar{display: block;position: relative;overflow: hidden;height: dt('progressbar.height');background: dt('progressbar.background');border-radius: dt('progressbar.border.radius');}
.u-progress-bar-value{margin: 0;background: dt('progressbar.value.background');}
.u-progress-bar-label{color: dt('progressbar.label.color');font-size: dt('progressbar.label.font.size');font-weight: dt('progressbar.label.font.weight');}
.u-progress-bar:not(.u-progress-bar-indeterminate) .u-progress-bar-value{height: 100%;width: 0%;position: absolute;display: none;display: flex;align-items: center;justify-content: center;overflow: hidden;transition: width 1s ease-in-out;}
.u-progress-bar:not(.u-progress-bar-indeterminate) .u-progress-bar-label{display: inline-flex;}
.u-progress-bar-indeterminate .u-progress-bar-value::before{content: '';position: absolute;background: inherit;inset-block-start: 0;inset-inline-start: 0;inset-block-end: 0;will-change: inset-inline-start, inset-inline-end;animation: u-progressbar-indeterminate-anim 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;}
.u-progress-bar-indeterminate .u-progress-bar-value::after{content: '';position: absolute;background: inherit;inset-block-start: 0;inset-inline-start: 0;inset-block-end: 0;will-change: inset-inline-start, inset-inline-end;animation: u-progressbar-indeterminate-anim-short 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;animation-delay: 1.15s;}
@keyframes u-progressbar-indeterminate-anim{0%{inset-inline-start: -35%;inset-inline-end: 100%;}60%{inset-inline-start: 100%;inset-inline-end: -90%;}100%{inset-inline-start: 100%;inset-inline-end: -90%;}}
@-webkit-keyframes u-progressbar-indeterminate-anim{0%{inset-inline-start: -35%;inset-inline-end: 100%;}60%{inset-inline-start: 100%;inset-inline-end: -90%;}100%{inset-inline-start: 100%;inset-inline-end: -90%;}}
@keyframes u-progressbar-indeterminate-anim-short{0%{inset-inline-start: -200%;inset-inline-end: 100%;}60%{inset-inline-start: 107%;inset-inline-end: -8%;}100%{inset-inline-start: 107%;inset-inline-end: -8%;}}
@-webkit-keyframes u-progressbar-indeterminate-anim-short{0%{inset-inline-start: -200%;inset-inline-end: 100%;}60%{inset-inline-start: 107%;inset-inline-end: -8%;}100%{inset-inline-start: 107%;inset-inline-end: -8%;}}
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-progress-bar u-component",
    { "u-progress-bar-indeterminate": params?.["mode"] === "indeterminate" },
  ],
  value: "u-progress-bar-value",
  label: "u-progress-bar-label",
};

/** `UBaseComponent`-shaped style module for `UProgressBar`. */
export const progressBarStyleModule = { css, classes };
