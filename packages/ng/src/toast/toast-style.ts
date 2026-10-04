/**
 * Ultimate-owned adaptation of PrimeNG's `ToastStyle` (see
 * `.vendor-extracted/ng/toast/style/toaststyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/toast` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-toast{width: dt('toast.width');white-space: pre-line;word-break: break-word;}
.u-toast-message{margin: 0 0 1rem 0;display: grid;grid-template-rows: 1fr;}
.u-toast-message-content{display: flex;align-items: flex-start;padding: dt('toast.content.padding');gap: dt('toast.content.gap');min-height: 0;overflow: hidden;transition: padding 250ms ease-in;}
.u-toast-summary{font-weight: dt('toast.summary.font.weight');font-size: dt('toast.summary.font.size');}
.u-toast-detail{font-weight: dt('toast.detail.font.weight');font-size: dt('toast.detail.font.size');}
.u-toast-close-button{display: flex;align-items: center;justify-content: center;overflow: hidden;position: relative;cursor: pointer;background: transparent;transition: background dt('toast.transition.duration'), color dt('toast.transition.duration'), outline-color dt('toast.transition.duration'), box-shadow dt('toast.transition.duration');outline-color: transparent;color: inherit;width: dt('toast.close.button.width');height: dt('toast.close.button.height');border-radius: dt('toast.close.button.border.radius');margin: -25% 0 0 0;right: -25%;padding: 0;border: none;user-select: none;}
.u-toast-close-button:dir(rtl){margin: -25% 0 0 auto;left: -25%;right: auto;}
.u-toast-message-info, .u-toast-message-success, .u-toast-message-warn, .u-toast-message-error, .u-toast-message-secondary, .u-toast-message-contrast{border-width: dt('toast.border.width');border-style: solid;backdrop-filter: blur(dt('toast.blur'));border-radius: dt('toast.border.radius');}
.u-toast-close-button:focus-visible{outline-width: dt('focus.ring.width');outline-style: dt('focus.ring.style');outline-offset: dt('focus.ring.offset');}
.u-toast-message-info{background: dt('toast.info.background');border-color: dt('toast.info.border.color');color: dt('toast.info.color');box-shadow: dt('toast.info.shadow');}
.u-toast-message-info .u-toast-detail{color: dt('toast.info.detail.color');}
.u-toast-message-info .u-toast-close-button:focus-visible{outline-color: dt('toast.info.close.button.focus.ring.color');box-shadow: dt('toast.info.close.button.focus.ring.shadow');}
.u-toast-message-info .u-toast-close-button:hover{background: dt('toast.info.close.button.hover.background');}
.u-toast-message-success{background: dt('toast.success.background');border-color: dt('toast.success.border.color');color: dt('toast.success.color');box-shadow: dt('toast.success.shadow');}
.u-toast-message-success .u-toast-detail{color: dt('toast.success.detail.color');}
.u-toast-message-success .u-toast-close-button:focus-visible{outline-color: dt('toast.success.close.button.focus.ring.color');box-shadow: dt('toast.success.close.button.focus.ring.shadow');}
.u-toast-message-success .u-toast-close-button:hover{background: dt('toast.success.close.button.hover.background');}
.u-toast-message-warn{background: dt('toast.warn.background');border-color: dt('toast.warn.border.color');color: dt('toast.warn.color');box-shadow: dt('toast.warn.shadow');}
.u-toast-message-warn .u-toast-detail{color: dt('toast.warn.detail.color');}
.u-toast-message-warn .u-toast-close-button:focus-visible{outline-color: dt('toast.warn.close.button.focus.ring.color');box-shadow: dt('toast.warn.close.button.focus.ring.shadow');}
.u-toast-message-warn .u-toast-close-button:hover{background: dt('toast.warn.close.button.hover.background');}
.u-toast-message-error{background: dt('toast.error.background');border-color: dt('toast.error.border.color');color: dt('toast.error.color');box-shadow: dt('toast.error.shadow');}
.u-toast-message-error .u-toast-detail{color: dt('toast.error.detail.color');}
.u-toast-message-error .u-toast-close-button:focus-visible{outline-color: dt('toast.error.close.button.focus.ring.color');box-shadow: dt('toast.error.close.button.focus.ring.shadow');}
.u-toast-message-error .u-toast-close-button:hover{background: dt('toast.error.close.button.hover.background');}
.u-toast-message-secondary{background: dt('toast.secondary.background');border-color: dt('toast.secondary.border.color');color: dt('toast.secondary.color');box-shadow: dt('toast.secondary.shadow');}
.u-toast-message-secondary .u-toast-detail{color: dt('toast.secondary.detail.color');}
.u-toast-message-secondary .u-toast-close-button:focus-visible{outline-color: dt('toast.secondary.close.button.focus.ring.color');box-shadow: dt('toast.secondary.close.button.focus.ring.shadow');}
.u-toast-message-secondary .u-toast-close-button:hover{background: dt('toast.secondary.close.button.hover.background');}
.u-toast-message-contrast{background: dt('toast.contrast.background');border-color: dt('toast.contrast.border.color');color: dt('toast.contrast.color');box-shadow: dt('toast.contrast.shadow');}
.u-toast-message-contrast .u-toast-detail{color: dt('toast.contrast.detail.color');}
.u-toast-message-contrast .u-toast-close-button:focus-visible{outline-color: dt('toast.contrast.close.button.focus.ring.color');box-shadow: dt('toast.contrast.close.button.focus.ring.shadow');}
.u-toast-message-contrast .u-toast-close-button:hover{background: dt('toast.contrast.close.button.hover.background');}
.u-toast-top-center{transform: translateX(-50%);}
.u-toast-bottom-center{transform: translateX(-50%);}
.u-toast-center{min-width: 20vw;transform: translate(-50%, -50%);}
.u-toast{position: fixed;z-index: 1200;max-width: calc(100vw - 2rem);}
.u-toast-top-right{top: 1rem;right: 1rem;}
.u-toast-top-left{top: 1rem;left: 1rem;}
.u-toast-bottom-right{bottom: 1rem;right: 1rem;}
.u-toast-bottom-left{bottom: 1rem;left: 1rem;}
.u-toast-top-center{top: 1rem;left: 50%;}
.u-toast-bottom-center{bottom: 1rem;left: 50%;}
.u-toast-center{top: 50%;left: 50%;}
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-toast u-component",
    `u-toast-${(params?.["position"] as string) ?? "top-right"}`,
  ],
  message: (params?: Record<string, unknown>) => [
    "u-toast-message",
    `u-toast-message-${(params?.["severity"] as string) ?? "info"}`,
  ],
  messageContent: "u-toast-message-content",
  summary: "u-toast-summary",
  detail: "u-toast-detail",
  closeButton: "u-toast-close-button",
};

/** `UBaseComponent`-shaped style module for `UToast`. */
export const toastStyleModule = { css, classes };
