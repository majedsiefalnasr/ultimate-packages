/**
 * Ultimate-owned adaptation of PrimeNG's `DividerStyle` (see
 * `.vendor-extracted/ng/divider/style/dividerstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/divider` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `cardStyleModule`).
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-divider-horizontal{display: flex;width: 100%;position: relative;align-items: center;margin: dt('divider.horizontal.margin');padding: dt('divider.horizontal.padding');}
.u-divider-horizontal:before{position: absolute;display: block;inset-block-start: 50%;inset-inline-start: 0;width: 100%;content: '';border-block-start: 1px solid dt('divider.border.color');}
.u-divider-horizontal .u-divider-content{padding: dt('divider.horizontal.content.padding');}
.u-divider-vertical{min-height: 100%;display: flex;position: relative;justify-content: center;margin: dt('divider.vertical.margin');padding: dt('divider.vertical.padding');}
.u-divider-vertical:before{position: absolute;display: block;inset-block-start: 0;inset-inline-start: 50%;height: 100%;content: '';border-inline-start: 1px solid dt('divider.border.color');}
.u-divider.u-divider-vertical .u-divider-content{padding: dt('divider.vertical.content.padding');}
.u-divider-content{z-index: 1;background: dt('divider.content.background');color: dt('divider.content.color');}
.u-divider-horizontal{justify-content: center;}
.u-divider-vertical{align-items: center;}
`;

const classes = {
  root: (params?: Record<string, unknown>) => [
    "u-divider u-component",
    { "u-divider-horizontal": params?.["layout"] !== "vertical" },
    { "u-divider-vertical": params?.["layout"] === "vertical" },
  ],
  content: "u-divider-content",
};

/** `UBaseComponent`-shaped style module for `UDivider`. */
export const dividerStyleModule = { css, classes };
