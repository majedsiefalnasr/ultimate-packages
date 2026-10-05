/**
 * Ultimate-owned adaptation of PrimeNG's `DockStyle` (see
 * `.vendor-extracted/ng/dock/style/dockstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/dock` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `tieredMenuStyleModule`).
 *
 * The hover/focus magnification effect is a CSS `:hover`/`[data-u-active]`
 * `transform: scale(...)` transition on `.u-dock-item-link`, scoped to
 * adjacent siblings via the general sibling combinator (`~`) so hovering
 * one icon also (subtly) scales its immediate neighbors — matching the
 * "macOS-dock-style magnified icon bar" visual, driven entirely by CSS, not
 * JS-computed scale math (see `dock.ts`'s doc comment for why: real
 * PrimeNG 21.1.9's own `Dock` component tracks a hover `currentIndex` but
 * never reads it for any scale/transform styling — the effect, where
 * present at all in real Prime source, is CSS-only).
 * GAP-064 G3-C1: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3c1-port.mjs).
 */
const css = /*css*/ `
.u-dock-item-disabled, .u-dock-item-disabled *{cursor: default;pointer-events: none;user-select: none;}
.u-dock-item-disabled{opacity: dt('disabled.opacity');}
.u-dock{position: absolute;z-index: 1;display: flex;justify-content: center;align-items: center;pointer-events: none;}
.u-dock-list-container{display: flex;pointer-events: auto;background: dt('dock.background');border: 1px solid dt('dock.border.color');padding: dt('dock.padding');border-radius: dt('dock.border.radius');}
.u-dock-list{margin: 0;padding: 0;list-style: none;display: flex;align-items: center;justify-content: center;outline: 0 none;}
.u-dock-item{transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);will-change: transform;padding: dt('dock.item.padding');border-radius: dt('dock.item.border.radius');}
.u-dock-item-link{display: flex;flex-direction: column;align-items: center;justify-content: center;position: relative;overflow: hidden;cursor: default;width: dt('dock.item.size');height: dt('dock.item.size');}
.u-dock-top{left: 0;top: 0;width: 100%;}
.u-dock-bottom{left: 0;bottom: 0;width: 100%;}
.u-dock-right{right: 0;top: 0;height: 100%;}
.u-dock-right .u-dock-list{flex-direction: column;}
.u-dock-left{left: 0;top: 0;height: 100%;}
.u-dock-left .u-dock-list{flex-direction: column;}
.u-dock-item-link{transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);transform-origin: bottom center;}
.u-dock-item-link:hover, .u-dock-item-link[data-u-active="true"]{transform: scale(1.5);}
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

export const dockStyleModule = { css, classes };
