/**
 * Ultimate-owned adaptation of PrimeVue's `ConfirmPopupStyle` (see
 * `.vendor-extracted/vue/confirmpopup/ConfirmPopup.vue`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/confirm-popup` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as other Overlay-family components).
 */
const css = /*css*/ `
.u-confirmpopup { position: absolute; top: 0; left: 0; }
.u-confirmpopup-content { display: flex; align-items: flex-start; gap: 0.5rem; }
.u-confirmpopup-footer { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
`;

const classes = {
  root: () => ["u-confirmpopup u-component"],
  content: "u-confirmpopup-content",
  icon: "u-confirmpopup-icon",
  message: "u-confirmpopup-message",
  footer: "u-confirmpopup-footer",
};

/** `createBaseComponent`-shaped style module for `UConfirmPopup`. */
export const confirmPopupStyleModule = { css, classes };
