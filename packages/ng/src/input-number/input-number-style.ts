import { style as inputNumberStyle } from "@ultimate/uix-styles/inputnumber";

/**
 * Ultimate-owned adaptation of PrimeNG's `InputNumberStyle`, shaped to match
 * `UBaseComponent`'s `styleModule: {css, classes}` contract.
 *
 * `.p-inputnumber*` selectors are already renamed to `.u-inputnumber*` by
 * `@ultimate/uix-styles/inputnumber` itself (Task 4) — confirmed against
 * that subpath's own CSS (`packages/uix-styles/src/inputnumber/index.ts`),
 * which uses `.u-inputnumber`, `.u-inputnumber-button`, `.u-inputnumber-fluid`,
 * etc. The `classes` resolver below must therefore emit the literal
 * `u-inputnumber` root class (NOT `u-input-number`) for these selectors to
 * apply — matching `input-text-style.ts`'s equivalent `u-inputtext`
 * precedent exactly.
 *
 * `p-invalid` is kept unrenamed — same precedent as `input-text-style.ts`
 * and `checkbox-style.ts`.
 *
 * Real `InputNumberStyle`'s `classes.root` resolver (extracted this session,
 * `inputnumberstyle.ts`) also branches on `showButtons`/`buttonLayout`
 * (`p-inputnumber-stacked`/`-horizontal`/`-vertical`) and
 * `allowEmpty`/`focused` (`p-inputwrapper-filled`/`-focus`) — all out of
 * scope here per this task's Non-Goals (no configurable spinner button
 * layouts).
 *
 * `invalid`/`fluid` are reflected on `pcInputText` (the inner native
 * `<input>`), NOT `root` — matching real source's own template, where
 * `invalid`/`fluid` are passed down as `[invalid]`/`[fluid]` inputs to the
 * nested `pInputText` directive, which puts those classes on the `<input>`
 * element itself rather than on `InputNumber`'s own host. `UInputNumber`
 * doesn't compose a nested `UInputText` directive, so `pcInputText` derives
 * those two classes directly here instead, matching the same visible
 * result.
 */
const css = /*css*/ `
    ${inputNumberStyle}
`;

/** Params `UInputNumber` passes into `cx('pcInputText', params)`. */
export interface InputNumberClassesParams {
  invalid?: boolean;
  fluid?: boolean;
}

const classes = {
  root: "u-inputnumber u-component",
  pcInputText: (params: InputNumberClassesParams = {}) => {
    const { invalid, fluid } = params;
    return [
      "u-inputnumber-input",
      {
        "p-invalid": invalid,
        "u-inputnumber-fluid": fluid,
      },
    ];
  },
};

/** `UBaseComponent`-shaped style module for `UInputNumber`. */
export const inputNumberStyleModule = { css, classes };
