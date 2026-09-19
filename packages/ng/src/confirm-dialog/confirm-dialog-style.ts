/**
 * Ultimate-owned adaptation of PrimeNG's `ConfirmDialogStyle` (see
 * `.vendor-extracted/ng/confirmdialog/confirmdialog.ts` / `style/`), shaped
 * to match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/confirm-dialog` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `tieredMenuStyleModule`).
 */
const css = /*css*/ `
.u-confirmdialog .u-dialog-content { display: flex; align-items: flex-start; gap: 1rem; }
.u-confirmdialog-icon { flex-shrink: 0; }
.u-confirmdialog-message { flex-grow: 1; }
.u-confirmdialog-footer { display: flex; justify-content: flex-end; gap: 0.5rem; }
`;

const classes = {
  root: () => ["u-confirmdialog"],
  icon: "u-confirmdialog-icon",
  message: "u-confirmdialog-message",
  footer: "u-confirmdialog-footer",
};

/** `UBaseComponent`-shaped style module for `UConfirmDialog`. */
export const confirmDialogStyleModule = { css, classes };
