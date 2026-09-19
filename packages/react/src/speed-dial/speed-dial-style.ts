import type { StyleModule } from "@ultimate/react-core";

/**
 * Ultimate-owned adaptation of PrimeReact's `SpeedDialBase` style (see
 * `.vendor-extracted/react/speeddial/SpeedDialBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/speed-dial` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as this same capability's Angular
 * `speed-dial-style.ts` sibling).
 */
const css = /*css*/ `
.u-speeddial { position: relative; display: flex; }
.u-speeddial-list { display: flex; flex-direction: column-reverse; align-items: center; margin: 0; padding: 0; list-style: none; position: absolute; }
.u-speeddial-item { transition: transform 0.2s, opacity 0.2s; }
.u-speeddial-item[data-u-hidden="true"] { visibility: hidden; }
.u-speeddial-action { display: flex; align-items: center; justify-content: center; border-radius: 50%; cursor: pointer; width: 2.5rem; height: 2.5rem; }
.u-speeddial-action:disabled { cursor: default; opacity: 0.6; }
.u-speeddial-mask { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); }
`;

const classes = {
  root: (params: { direction?: string } = {}) => [
    "u-speeddial u-component",
    `u-speeddial-direction-${params.direction ?? "up"}`,
  ],
  pcButton: (params: { open?: boolean } = {}) => ["u-speeddial-button", { "u-speeddial-open": params.open }],
  list: "u-speeddial-list",
  item: (params: { hidden?: boolean } = {}) => ["u-speeddial-item", { "u-speeddial-item-hidden": params.hidden }],
  pcAction: "u-speeddial-action",
  actionIcon: "u-speeddial-action-icon",
  mask: "u-speeddial-mask",
};

export const speedDialStyleModule: StyleModule = { css, classes };
