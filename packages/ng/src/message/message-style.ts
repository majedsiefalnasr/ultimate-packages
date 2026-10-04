/**
 * Ultimate-owned adaptation of PrimeNG's `MessageStyle` (see
 * `.vendor-extracted/ng/message/style/messagestyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/message` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `fieldsetStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-message{display: grid;grid-template-rows: 1fr;border-radius: dt('message.border.radius');outline-width: dt('message.border.width');outline-style: solid;}
.u-message-content{display: flex;align-items: center;padding: dt('message.content.padding');gap: dt('message.content.gap');}
.u-message-icon{flex-shrink: 0;}
.u-message-close-button{display: flex;align-items: center;justify-content: center;flex-shrink: 0;margin-inline-start: auto;overflow: hidden;position: relative;width: dt('message.close.button.width');height: dt('message.close.button.height');border-radius: dt('message.close.button.border.radius');background: transparent;transition: background dt('message.transition.duration'), color dt('message.transition.duration'), outline-color dt('message.transition.duration'), box-shadow dt('message.transition.duration'), opacity 0.3s;outline-color: transparent;color: inherit;padding: 0;border: none;cursor: pointer;user-select: none;}
.u-message-close-button:focus-visible{outline-width: dt('message.close.button.focus.ring.width');outline-style: dt('message.close.button.focus.ring.style');outline-offset: dt('message.close.button.focus.ring.offset');}
.u-message-info{background: dt('message.info.background');outline-color: dt('message.info.border.color');color: dt('message.info.color');box-shadow: dt('message.info.shadow');}
.u-message-info .u-message-close-button:focus-visible{outline-color: dt('message.info.close.button.focus.ring.color');box-shadow: dt('message.info.close.button.focus.ring.shadow');}
.u-message-info .u-message-close-button:hover{background: dt('message.info.close.button.hover.background');}
.u-message-success{background: dt('message.success.background');outline-color: dt('message.success.border.color');color: dt('message.success.color');box-shadow: dt('message.success.shadow');}
.u-message-success .u-message-close-button:focus-visible{outline-color: dt('message.success.close.button.focus.ring.color');box-shadow: dt('message.success.close.button.focus.ring.shadow');}
.u-message-success .u-message-close-button:hover{background: dt('message.success.close.button.hover.background');}
.u-message-warn{background: dt('message.warn.background');outline-color: dt('message.warn.border.color');color: dt('message.warn.color');box-shadow: dt('message.warn.shadow');}
.u-message-warn .u-message-close-button:focus-visible{outline-color: dt('message.warn.close.button.focus.ring.color');box-shadow: dt('message.warn.close.button.focus.ring.shadow');}
.u-message-warn .u-message-close-button:hover{background: dt('message.warn.close.button.hover.background');}
.u-message-error{background: dt('message.error.background');outline-color: dt('message.error.border.color');color: dt('message.error.color');box-shadow: dt('message.error.shadow');}
.u-message-error .u-message-close-button:focus-visible{outline-color: dt('message.error.close.button.focus.ring.color');box-shadow: dt('message.error.close.button.focus.ring.shadow');}
.u-message-error .u-message-close-button:hover{background: dt('message.error.close.button.hover.background');}
.u-message-secondary{background: dt('message.secondary.background');outline-color: dt('message.secondary.border.color');color: dt('message.secondary.color');box-shadow: dt('message.secondary.shadow');}
.u-message-secondary .u-message-close-button:focus-visible{outline-color: dt('message.secondary.close.button.focus.ring.color');box-shadow: dt('message.secondary.close.button.focus.ring.shadow');}
.u-message-secondary .u-message-close-button:hover{background: dt('message.secondary.close.button.hover.background');}
.u-message-contrast{background: dt('message.contrast.background');outline-color: dt('message.contrast.border.color');color: dt('message.contrast.color');box-shadow: dt('message.contrast.shadow');}
.u-message-contrast .u-message-close-button:focus-visible{outline-color: dt('message.contrast.close.button.focus.ring.color');box-shadow: dt('message.contrast.close.button.focus.ring.shadow');}
.u-message-contrast .u-message-close-button:hover{background: dt('message.contrast.close.button.hover.background');}
.u-message-text{font-size: dt('message.text.font.size');font-weight: dt('message.text.font.weight');}
.u-message-icon{font-size: dt('message.icon.size');width: dt('message.icon.size');height: dt('message.icon.size');}
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

/** `UBaseComponent`-shaped style module for `UMessage`. */
export const messageStyleModule = { css, classes };
