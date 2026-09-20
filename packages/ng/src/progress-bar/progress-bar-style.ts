/**
 * Ultimate-owned adaptation of PrimeNG's `ProgressBarStyle` (see
 * `.vendor-extracted/ng/progressbar/style/progressbarstyle.ts`), shaped to
 * match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/progressbar` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `fieldsetStyleModule`).
 */
const css = /*css*/ `
.u-progress-bar { position: relative; overflow: hidden; height: 1.5rem; background: var(--u-progress-bar-track-bg, #e5e7eb); border-radius: 6px; }
.u-progress-bar-value { display: flex; align-items: center; justify-content: center; height: 100%; background: var(--u-progress-bar-value-bg, #3b82f6); overflow: hidden; transition: width 1s ease-in-out; }
.u-progress-bar-label { color: var(--u-progress-bar-label-color, #fff); font-size: 0.75rem; }
.u-progress-bar-indeterminate .u-progress-bar-value { width: 100%; animation: u-progress-bar-indeterminate-anim 2.1s linear infinite; transform-origin: 0% 50%; }
@keyframes u-progress-bar-indeterminate-anim {
  0% { transform: translateX(0) scaleX(0); }
  40% { transform: translateX(0) scaleX(0.4); }
  100% { transform: translateX(100%) scaleX(0.5); }
}
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
