/**
 * Ultimate-owned adaptation of PrimeReact's `ProgressSpinnerBase` css,
 * shaped to match `react-core`'s `useComponentBase`'s
 * `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/progressspinner` entry exists yet, so
 * `css`/`classes` are authored locally (same precedent as
 * `fieldsetStyleModule`).
 */
const css = /*css*/ `
.u-progress-spinner { width: 2rem; height: 2rem; display: inline-block; }
.u-progress-spinner-spin { animation: u-progress-spinner-rotate 2s linear infinite; width: 100%; height: 100%; }
.u-progress-spinner-circle { stroke: var(--u-progress-spinner-color, #3b82f6); animation: u-progress-spinner-dash 1.5s ease-in-out infinite, u-progress-spinner-color 6s ease-in-out infinite; stroke-linecap: round; }
@keyframes u-progress-spinner-rotate { 100% { transform: rotate(360deg); } }
@keyframes u-progress-spinner-dash {
  0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 89, 200; stroke-dashoffset: -35px; }
  100% { stroke-dasharray: 89, 200; stroke-dashoffset: -124px; }
}
@keyframes u-progress-spinner-color {
  100%, 0% { stroke: var(--u-progress-spinner-color, #3b82f6); }
  40% { stroke: var(--u-progress-spinner-color-2, #22c55e); }
  66% { stroke: var(--u-progress-spinner-color-3, #f59e0b); }
  80%, 90% { stroke: var(--u-progress-spinner-color-4, #ef4444); }
}
`;

const classes = {
  root: "u-progress-spinner u-component",
  spin: "u-progress-spinner-spin",
  circle: "u-progress-spinner-circle",
};

/** `useComponentBase`-shaped style module for `UProgressSpinner`. */
export const progressSpinnerStyleModule = { css, classes };
