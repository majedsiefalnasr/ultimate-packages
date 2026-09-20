/**
 * Ultimate-owned adaptation of PrimeReact's `Toast` style (real source:
 * `components/lib/toast/ToastBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/toast` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 */
const css = /*css*/ `
.u-toast { position: fixed; z-index: 1200; width: 25rem; max-width: calc(100vw - 2rem); display: flex; flex-direction: column; gap: 0.5rem; }
.u-toast-top-right { top: 1rem; right: 1rem; }
.u-toast-top-left { top: 1rem; left: 1rem; }
.u-toast-bottom-right { bottom: 1rem; right: 1rem; }
.u-toast-bottom-left { bottom: 1rem; left: 1rem; }
.u-toast-top-center { top: 1rem; left: 50%; transform: translateX(-50%); }
.u-toast-bottom-center { bottom: 1rem; left: 50%; transform: translateX(-50%); }
.u-toast-center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
.u-toast-message { display: flex; align-items: flex-start; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.u-toast-message-info { background: var(--u-toast-info-bg, #dbeafe); color: var(--u-toast-info-color, #1e3a8a); }
.u-toast-message-success { background: var(--u-toast-success-bg, #dcfce7); color: var(--u-toast-success-color, #14532d); }
.u-toast-message-warn { background: var(--u-toast-warn-bg, #fef9c3); color: var(--u-toast-warn-color, #713f12); }
.u-toast-message-error { background: var(--u-toast-error-bg, #fee2e2); color: var(--u-toast-error-color, #7f1d1d); }
.u-toast-message-secondary { background: var(--u-toast-secondary-bg, #e5e7eb); color: var(--u-toast-secondary-color, #1f2937); }
.u-toast-message-contrast { background: var(--u-toast-contrast-bg, #18181b); color: var(--u-toast-contrast-color, #fafafa); }
.u-toast-message-content { flex: 1; }
.u-toast-summary { font-weight: 700; }
.u-toast-detail { font-size: 0.875rem; }
.u-toast-close-button { background: transparent; border: none; cursor: pointer; color: inherit; padding: 0.125rem; }
`;

const classes = {
  root: (params?: Record<string, unknown>) =>
    ["u-toast u-component", `u-toast-${(params?.["position"] as string) ?? "top-right"}`].join(" "),
  message: (params?: Record<string, unknown>) =>
    ["u-toast-message", `u-toast-message-${(params?.["severity"] as string) ?? "info"}`].join(" "),
  messageContent: "u-toast-message-content",
  summary: "u-toast-summary",
  detail: "u-toast-detail",
  closeButton: "u-toast-close-button",
};

/** `useComponentBase`-shaped style module for `UToast`. */
export const toastStyleModule = { css, classes };
