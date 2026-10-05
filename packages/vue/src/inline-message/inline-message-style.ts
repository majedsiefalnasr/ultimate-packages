/**
 * Ultimate-owned adaptation of PrimeVue's `InlineMessageStyle` (see
 * `.vendor-extracted/vue/inlinemessage/style/InlineMessageStyle.js`),
 * shaped to match `vue-core`'s `createBaseComponent`'s
 * `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/inlinemessage` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `messageStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-inline-message{display: inline-flex;align-items: center;justify-content: center;padding: dt('inlinemessage.padding');border-radius: dt('inlinemessage.border.radius');gap: dt('inlinemessage.gap');}
.u-inline-message-text{font-weight: dt('inlinemessage.text.font.weight');}
.u-inline-message-icon{flex-shrink: 0;font-size: dt('inlinemessage.icon.size');width: dt('inlinemessage.icon.size');height: dt('inlinemessage.icon.size');}
.u-inline-message-info{background: dt('inlinemessage.info.background');border: 1px solid dt('inlinemessage.info.border.color');color: dt('inlinemessage.info.color');box-shadow: dt('inlinemessage.info.shadow');}
.u-inline-message-info .u-inline-message-icon{color: dt('inlinemessage.info.color');}
.u-inline-message-success{background: dt('inlinemessage.success.background');border: 1px solid dt('inlinemessage.success.border.color');color: dt('inlinemessage.success.color');box-shadow: dt('inlinemessage.success.shadow');}
.u-inline-message-success .u-inline-message-icon{color: dt('inlinemessage.success.color');}
.u-inline-message-warn{background: dt('inlinemessage.warn.background');border: 1px solid dt('inlinemessage.warn.border.color');color: dt('inlinemessage.warn.color');box-shadow: dt('inlinemessage.warn.shadow');}
.u-inline-message-warn .u-inline-message-icon{color: dt('inlinemessage.warn.color');}
.u-inline-message-error{background: dt('inlinemessage.error.background');border: 1px solid dt('inlinemessage.error.border.color');color: dt('inlinemessage.error.color');box-shadow: dt('inlinemessage.error.shadow');}
.u-inline-message-error .u-inline-message-icon{color: dt('inlinemessage.error.color');}
.u-inline-message-secondary{background: dt('inlinemessage.secondary.background');border: 1px solid dt('inlinemessage.secondary.border.color');color: dt('inlinemessage.secondary.color');box-shadow: dt('inlinemessage.secondary.shadow');}
.u-inline-message-secondary .u-inline-message-icon{color: dt('inlinemessage.secondary.color');}
.u-inline-message-contrast{background: dt('inlinemessage.contrast.background');border: 1px solid dt('inlinemessage.contrast.border.color');color: dt('inlinemessage.contrast.color');box-shadow: dt('inlinemessage.contrast.shadow');}
.u-inline-message-contrast .u-inline-message-icon{color: dt('inlinemessage.contrast.color');}
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
