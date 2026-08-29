import { style as dialogStyle } from "@ultimate/uix-styles/dialog";

/**
 * Ultimate-owned adaptation of PrimeNG's `DialogStyle` (see
 * `.vendor-extracted/ng/dialog/style/dialogstyle.ts`), shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract (Task 4's
 * `base-component.spec.ts` — a plain object field, not an `@Injectable`
 * service; PrimeNG's own `Dialog` DI-injects its style service via
 * `_componentStyle = inject(DialogStyle)`, but this project's scoped-down
 * Option B architecture does not).
 *
 * Per Task 3's corrected finding that `@primeuix/styles` never exports a
 * `classes` object, `@ultimate/uix-styles/dialog` exports only `style`
 * (verified: `packages/uix-styles/src/dialog/index.ts`) — the `classes`
 * class-name-slot resolver is ported here instead, locally, from the
 * extracted reference file's own `const classes = {...}`, with
 * `.p-dialog*` selectors renamed to `.u-dialog*`, matching the pattern
 * `ButtonStyle`/`TooltipStyle`/`CheckboxStyle`/`BadgeStyle` already
 * establish.
 *
 * The extracted `classes.mask`/`classes.root` resolvers take `({ instance })`
 * and read PrimeNG's `instance.position`/`instance.modal`/
 * `instance.maximizable`/`instance.maximized` fields directly off the
 * component instance — dropped here since `UBaseComponent.cx(key, params)`
 * invokes `styleModule.classes[key](params)` with a flat params object the
 * caller passes (confirmed against `packages/ng-core/src/basecomponent/
 * base-component.ts`), not an `{ instance }` wrapper — matching the same
 * adaptation already made by `ButtonStyle`/`TooltipStyle`. `UDialog` has no
 * `position`/`maximizable`/`maximized` inputs per this task's Interfaces
 * section, so those position/maximized-aware branches are dropped from
 * `classes.mask`/`classes.root`.
 *
 * `inlineStyles` (upstream's `mask`/`root` inline `position: fixed` etc.)
 * is not ported: this task's Interfaces section defines no inline-style
 * input surface for `UDialog`, and `UOverlay` (Task 6) already owns
 * positioning/z-index for the moved-to-body host element.
 */
const css = /*css*/ `
    ${dialogStyle}
`;

/** Params `UDialog` passes into `cx('mask'|'root', params)` — see `UBaseComponent.cx()`. */
export interface DialogClassesParams {
  modal?: boolean;
}

/**
 * Class-name-slot resolver for `UDialog`, ported from the extracted
 * `DialogStyle`'s own `classes` object (`.p-dialog*` renamed to
 * `.u-dialog*`, `{ instance }`-wrapped position/maximized-aware branches
 * dropped per this task's smaller input surface).
 */
const classes = {
  mask: (params: DialogClassesParams = {}) => {
    const { modal } = params;

    return ["u-dialog-mask", { "u-overlay-mask": modal }];
  },
  root: () => ["u-dialog u-component"],
  header: "u-dialog-header",
  title: "u-dialog-title",
  resizeHandle: "u-resizable-handle",
  headerActions: "u-dialog-header-actions",
  pcMaximizeButton: "u-dialog-maximize-button",
  pcCloseButton: "u-dialog-close-button",
  content: () => ["u-dialog-content"],
  footer: "u-dialog-footer",
};

/** `UBaseComponent`-shaped style module for `UDialog`. */
export const dialogStyleModule = { css, classes };
