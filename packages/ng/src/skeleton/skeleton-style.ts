/**
 * Ultimate-owned adaptation of PrimeNG's `SkeletonStyle` (see
 * `.vendor-extracted/ng/skeleton/style/skeletonstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/skeleton` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 */
const css = /*css*/ `
.u-skeleton { display: block; overflow: hidden; background-color: var(--u-skeleton-bg, #e5e7eb); }
.u-skeleton-circle { border-radius: 50%; }
.u-skeleton-wave::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: u-skeleton-wave-animation 1.5s infinite;
}
.u-skeleton { position: relative; }
@keyframes u-skeleton-wave-animation {
  0% { transform: translateX(-100%); }
  50%, 100% { transform: translateX(100%); }
}
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-skeleton u-component",
    params?.["shape"] === "circle" ? "u-skeleton-circle" : "",
    params?.["animation"] === "wave" ? "u-skeleton-wave" : "",
  ].filter(Boolean),
};

/** `UBaseComponent`-shaped style module for `USkeleton`. */
export const skeletonStyleModule = { css, classes };
