/**
 * Ultimate-owned adaptation of PrimeNG's `DynamicDialogStyle` (see
 * `.vendor-extracted/ng/dynamicdialog/dynamicdialog.ts` / `style/`), shaped
 * to match `UBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/dynamic-dialog` entry exists yet, so `css`/`classes`
 * are authored locally (same precedent as `tieredMenuStyleModule`). No
 * dedicated structural CSS is needed beyond the already-Built `UDialog`'s
 * own — this component's own root is a plain wrapper, so `css` is empty.
 */
const css = /*css*/ ``;

const classes = {
  root: () => ["u-dynamic-dialog"],
};

/** `UBaseComponent`-shaped style module for `UDynamicDialog`. */
export const dynamicDialogStyleModule = { css, classes };
