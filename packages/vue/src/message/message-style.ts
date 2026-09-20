/**
 * Ultimate-owned adaptation of PrimeVue's `MessageStyle` (see
 * `.vendor-extracted/vue/message/style/MessageStyle.js`), shaped to match
 * `vue-core`'s `createBaseComponent`'s `styleModule: {css, classes}`
 * contract. No `@ultimate/uix-styles/message` entry exists yet, so
 * `css`/`classes` are authored locally (same precedent as
 * `fieldsetStyleModule`).
 */
const css = /*css*/ `
.u-message { display: inline-flex; align-items: center; border-radius: 6px; }
.u-message-content { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; }
.u-message-icon { flex-shrink: 0; }
.u-message-text { font-size: 0.875rem; }
.u-message-close-button { display: inline-flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer; padding: 0.25rem; margin-inline-start: 0.5rem; color: inherit; }
.u-message-info { background: var(--u-message-info-bg, #dbeafe); color: var(--u-message-info-color, #1e3a8a); }
.u-message-success { background: var(--u-message-success-bg, #dcfce7); color: var(--u-message-success-color, #14532d); }
.u-message-warn { background: var(--u-message-warn-bg, #fef9c3); color: var(--u-message-warn-color, #713f12); }
.u-message-error { background: var(--u-message-error-bg, #fee2e2); color: var(--u-message-error-color, #7f1d1d); }
.u-message-secondary { background: var(--u-message-secondary-bg, #e5e7eb); color: var(--u-message-secondary-color, #1f2937); }
.u-message-contrast { background: var(--u-message-contrast-bg, #18181b); color: var(--u-message-contrast-color, #fafafa); }
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-message u-component",
    `u-message-${(params?.["severity"] as string) ?? "info"}`,
  ],
  content: "u-message-content",
  icon: "u-message-icon",
  text: "u-message-text",
  closeButton: "u-message-close-button",
};

/** `createBaseComponent`-shaped style module for `UMessage`. */
export const messageStyleModule = { css, classes };
