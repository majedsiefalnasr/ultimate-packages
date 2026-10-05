/**
 * Ultimate-owned adaptation of PrimeVue's `Tag` style (see
 * `.vendor-extracted/vue/tag/style/TagStyle.js`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/tag` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-tag{display: inline-flex;align-items: center;justify-content: center;background: dt('tag.primary.background');color: dt('tag.primary.color');font-size: dt('tag.font.size');font-weight: dt('tag.font.weight');padding: dt('tag.padding');border-radius: dt('tag.border.radius');gap: dt('tag.gap');}
.u-tag-icon{font-size: dt('tag.icon.size');width: dt('tag.icon.size');height: dt('tag.icon.size');}
.u-tag-rounded{border-radius: dt('tag.rounded.border.radius');}
.u-tag-success{background: dt('tag.success.background');color: dt('tag.success.color');}
.u-tag-info{background: dt('tag.info.background');color: dt('tag.info.color');}
.u-tag-warn{background: dt('tag.warn.background');color: dt('tag.warn.color');}
.u-tag-danger{background: dt('tag.danger.background');color: dt('tag.danger.color');}
.u-tag-secondary{background: dt('tag.secondary.background');color: dt('tag.secondary.color');}
.u-tag-contrast{background: dt('tag.contrast.background');color: dt('tag.contrast.color');}
`;

const classes = {
  root: (params?: Record<string, unknown>) =>
    [
      "u-tag u-component",
      params?.["rounded"] ? "u-tag-rounded" : "",
      params?.["severity"] ? `u-tag-${params["severity"] as string}` : "",
    ]
      .filter(Boolean)
      .join(" "),
  icon: "u-tag-icon",
  label: "u-tag-label",
};

/** `createBaseComponent`-shaped style module for `UTag`. */
export const tagStyleModule = { css, classes };
