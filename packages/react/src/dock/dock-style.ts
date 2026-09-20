import type { StyleModule } from "@ultimate/react-core";

/**
 * Ultimate-owned adaptation of PrimeReact's `DockBase` style (see
 * `.vendor-extracted/react/dock/DockBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/dock` entry exists yet, so `css`/`classes` are
 * authored locally. Magnification-on-hover is CSS-only — see this same
 * capability's Angular `dock-style.ts` sibling's doc comment for the
 * cross-framework finding this mirrors (real PrimeReact 10.9.9's own
 * `Dock` also tracks a hover index purely for bookkeeping, never for
 * scale/transform styling).
 */
const css = /*css*/ `
.u-dock { position: absolute; z-index: 1; display: flex; justify-content: center; align-items: center; pointer-events: none; }
.u-dock-top { left: 0; top: 0; width: 100%; }
.u-dock-bottom { left: 0; bottom: 0; width: 100%; }
.u-dock-left { left: 0; top: 0; height: 100%; }
.u-dock-right { right: 0; top: 0; height: 100%; }
.u-dock-left .u-dock-list, .u-dock-right .u-dock-list { flex-direction: column; }
.u-dock-list-container { display: flex; pointer-events: auto; background: rgba(0, 0, 0, 0.05); border: 1px solid rgba(0, 0, 0, 0.1); padding: 0.5rem; border-radius: 1rem; }
.u-dock-list { margin: 0; padding: 0; list-style: none; display: flex; align-items: center; justify-content: center; outline: 0 none; }
.u-dock-item { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.u-dock-item[data-u-disabled="true"] { pointer-events: none; opacity: 0.5; }
.u-dock-item-link { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; cursor: pointer; width: 3rem; height: 3rem; text-decoration: none; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: bottom center; }
.u-dock-item-link:hover, .u-dock-item-link[data-u-active="true"] { transform: scale(1.5); }
.u-dock-item-link:hover ~ .u-dock-item-link, .u-dock-item[data-u-disabled="true"] .u-dock-item-link { transform: scale(1); }
`;

const classes = {
  root: (params: { position?: string } = {}) => ["u-dock u-component", `u-dock-${params.position ?? "bottom"}`],
  listContainer: "u-dock-list-container",
  list: "u-dock-list",
  item: (params: { active?: boolean; disabled?: boolean } = {}) => [
    "u-dock-item",
    { "u-dock-item-active": params.active, "u-dock-item-disabled": params.disabled },
  ],
  itemLink: "u-dock-item-link",
  itemIcon: "u-dock-item-icon",
};

export const dockStyleModule: StyleModule = { css, classes };
