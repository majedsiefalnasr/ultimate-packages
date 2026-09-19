/**
 * Ultimate-owned adaptation of PrimeVue's `CardStyle` (see
 * `.vendor-extracted/vue/card/style/CardStyle.js`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/card` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `overlayBadgeStyleModule`).
 */
const css = /*css*/ `
.u-card { background: var(--u-card-background, #fff); color: var(--u-card-color, inherit); box-shadow: var(--u-card-shadow, 0 1px 3px rgba(0,0,0,0.12)); border-radius: 6px; }
.u-card-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; }
.u-card-caption { display: flex; flex-direction: column; gap: 0.25rem; }
.u-card-title { font-size: 1.5rem; font-weight: 700; }
.u-card-subtitle { color: var(--u-card-subtitle-color, #6c757d); font-weight: 400; }
.u-card-content { padding: 0; }
.u-card-footer { padding-top: 0.5rem; }
`;

const classes = {
  root: () => ["u-card u-component"],
  header: "u-card-header",
  body: "u-card-body",
  caption: "u-card-caption",
  title: "u-card-title",
  subtitle: "u-card-subtitle",
  content: "u-card-content",
  footer: "u-card-footer",
};

/** `createBaseComponent`-shaped style module for `UCard`. */
export const cardStyleModule = { css, classes };
