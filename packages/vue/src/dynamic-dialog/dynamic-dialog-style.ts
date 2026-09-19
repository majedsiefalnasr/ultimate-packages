/**
 * Ultimate-owned adaptation of PrimeVue's `DynamicDialogStyle` (see
 * `.vendor-extracted/vue/dynamicdialog/DynamicDialog.vue`), shaped to match
 * `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * dedicated structural CSS is needed beyond the already-Built `UDialog`'s
 * own — this component's own root has no visible markup of its own, so
 * `css` is empty (same precedent as Angular's `dynamicDialogStyleModule`).
 */
const css = /*css*/ ``;

const classes = {
  root: () => ["u-dynamic-dialog"],
};

/** `createBaseComponent`-shaped style module for `UDynamicDialog`. */
export const dynamicDialogStyleModule = { css, classes };
