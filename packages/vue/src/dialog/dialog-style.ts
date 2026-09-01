import type { StyleModule } from "@ultimate/vue-core";
import { style as dialogCss } from "@ultimate/uix-styles/dialog";

/**
 * Implementation-time verification finding (this task's Step 2, same
 * mismatch already found for `@ultimate/uix-styles/button` in Task 17,
 * `.../tooltip` in Task 18, and `.../checkbox` in Task 19): the brief's
 * draft assumed `@ultimate/uix-styles/dialog` exports a `dialogStyle` object
 * already shaped as `StyleModule`'s `{ css, classes }` contract. The real
 * file (`packages/uix-styles/src/dialog/index.ts`) only exports a plain
 * `style: string` — raw CSS with `dt()` token references, no `classes`
 * resolver map at all. `StyleModule` (`packages/vue-core/src/base/base-component.ts`)
 * requires both `css` and a `classes` map of per-slot resolvers. The
 * `classes` map below is therefore authored locally here, not re-exported
 * from uix-styles — following the same adaptation already established for
 * button/tooltip/checkbox.
 *
 * The `mask`/`root`/`header`/`title`/`headerActions`/`closeButton`/`content`/
 * `footer` slot names mirror real upstream `DialogStyle.js`
 * (`.vendor-extracted/vue/dialog/style/DialogStyle.js` — not present in this
 * vendor extraction since only `Dialog.vue`/`BaseDialog.vue` were pulled;
 * slot names instead cross-checked against Dialog.vue's own `cx(...)` call
 * sites read during this task's Step 1: 'mask', 'root', 'header', 'title',
 * 'headerActions', 'content', 'footer', plus 'pcCloseButton' — renamed here
 * to `closeButton` since this implementation renders a plain native
 * `<button>`, not a `UButton` subcomponent), adapted to this project's
 * `u-dialog*` class-name convention instead of upstream's `p-dialog*`
 * prefix, and to this project's plain-string-array `cx()` contract instead
 * of upstream's `{ instance, props }` params shape. `pcMaximizeButton` has
 * no equivalent here — maximizable is out of Phase 4 scope (spec §15).
 */
const css = /*css*/ `
    ${dialogCss}

    .u-dialog-mask {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
`;

/** Params `UDialog` passes into `cx('root', params)` — see `createBaseComponent`'s `cx()`. */
export interface DialogClassesParams {
  modal?: boolean;
  position?: string;
}

const classes = {
  mask: (params: DialogClassesParams = {}) => {
    const { modal, position } = params;
    return [
      "u-dialog-mask",
      {
        "u-overlay-mask": Boolean(modal),
        [`u-dialog-${position}`]: Boolean(position) && position !== "center",
      },
    ];
  },
  root: "u-dialog",
  header: "u-dialog-header",
  title: "u-dialog-title",
  headerActions: "u-dialog-header-actions",
  closeButton: "u-dialog-close-button",
  content: "u-dialog-content",
  footer: "u-dialog-footer",
};

export const dialogStyleModule: StyleModule = { css, classes };
