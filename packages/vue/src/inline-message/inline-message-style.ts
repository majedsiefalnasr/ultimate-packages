/**
 * Ultimate-owned adaptation of PrimeVue's `InlineMessageStyle` (see
 * `.vendor-extracted/vue/inlinemessage/style/InlineMessageStyle.js`),
 * shaped to match `vue-core`'s `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/inlinemessage` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `messageStyleModule`).
 */
const css = /*css*/ `
.u-inline-message { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 6px; }
.u-inline-message-icon { flex-shrink: 0; }
.u-inline-message-text { font-size: 0.875rem; }
.u-inline-message-info { background: var(--u-inline-message-info-bg, #dbeafe); color: var(--u-inline-message-info-color, #1e3a8a); }
.u-inline-message-success { background: var(--u-inline-message-success-bg, #dcfce7); color: var(--u-inline-message-success-color, #14532d); }
.u-inline-message-warn { background: var(--u-inline-message-warn-bg, #fef9c3); color: var(--u-inline-message-warn-color, #713f12); }
.u-inline-message-error { background: var(--u-inline-message-error-bg, #fee2e2); color: var(--u-inline-message-error-color, #7f1d1d); }
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-inline-message u-component",
    `u-inline-message-${(params?.["severity"] as string) ?? "error"}`,
  ],
  icon: "u-inline-message-icon",
  text: "u-inline-message-text",
};

/** `createBaseComponent`-shaped style module for `UInlineMessage`. */
export const inlineMessageStyleModule = { css, classes };
