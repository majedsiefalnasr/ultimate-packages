import type { StyleModule } from "@ultimate/react-core";

/**
 * Ultimate-owned adaptation of PrimeReact's `StepsBase` style (see
 * `.vendor-extracted/react/steps/StepsBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/steps` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as this same capability's Angular
 * `steps-style.ts` sibling).
 */
const css = /*css*/ `
.u-steps { position: relative; }
.u-steps-list { display: flex; margin: 0; padding: 0; list-style: none; }
.u-steps-item { position: relative; display: flex; justify-content: center; flex: 1 1 auto; }
.u-steps-item[data-u-disabled="true"] { pointer-events: none; opacity: 0.6; }
.u-steps-item-link { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-decoration: none; overflow: hidden; cursor: pointer; }
.u-steps-item[data-u-disabled="true"] .u-steps-item-link { cursor: default; }
.u-steps-item-number { display: flex; align-items: center; justify-content: center; border-radius: 50%; }
.u-steps-item-label { text-align: center; }
`;

const classes = {
  root: () => ["u-steps u-component"],
  list: "u-steps-list",
  item: (params: { active?: boolean; disabled?: boolean } = {}) => [
    "u-steps-item",
    { "u-steps-item-active": params.active, "u-steps-item-disabled": params.disabled },
  ],
  itemLink: "u-steps-item-link",
  itemNumber: "u-steps-item-number",
  itemLabel: "u-steps-item-label",
};

export const stepsStyleModule: StyleModule = { css, classes };
