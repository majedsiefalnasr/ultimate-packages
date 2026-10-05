/**
 * Ultimate-owned adaptation of PrimeNG's `CardStyle` (see
 * `.vendor-extracted/ng/card/style/cardstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/card` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `contextMenuStyleModule`).
 * GAP-064 G3-B: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3b-port.mjs).
 */
const css = /*css*/ `
.u-card{background: dt('card.background');color: dt('card.color');box-shadow: dt('card.shadow');border-radius: dt('card.border.radius');display: flex;flex-direction: column;}
.u-card-body{padding: dt('card.body.padding');display: flex;flex-direction: column;gap: dt('card.body.gap');}
.u-card-title{font-size: dt('card.title.font.size');font-weight: dt('card.title.font.weight');}
.u-card-subtitle{color: dt('card.subtitle.color');}
`;

const classes = {
  root: () => ["u-card u-component"],
  header: "u-card-header",
  body: "u-card-body",
  title: "u-card-title",
  subtitle: "u-card-subtitle",
  content: "u-card-content",
  footer: "u-card-footer",
};

/** `UBaseComponent`-shaped style module for `UCard`. */
export const cardStyleModule = { css, classes };
