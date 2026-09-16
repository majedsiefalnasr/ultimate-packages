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
 * `invalid`/`fluid` are reflected on `root` (the host element), NOT
 * `pcInputText` — matching real source's own `classes.root` resolver
 * (`inputnumberstyle.ts`), which puts both `p-inputnumber-fluid` and
 * `p-invalid` on the host, while `pcInputText` gets only the bare
 * `'p-inputnumber-input'` string with no modifiers. `u-inputnumber-fluid`
 * MUST be on root: `@ultimate/uix-styles/inputnumber`'s CSS defines
 * `.u-inputnumber-fluid { width: 100% }` (the wrapper rule) and
 * `.u-inputnumber-fluid .u-inputnumber-input { width: 1% }` (a *descendant*
 * selector) — both classes landing on the same (inner input) element would
 * make the descendant selector unmatchable and the fluid layout inert.
 */
const css = /*css*/ `
    ${inputNumberStyle}
`;

/** Params `UInputNumber` passes into `cx('root', params)`. */
export interface InputNumberClassesParams {
  invalid?: boolean;
  fluid?: boolean;
}

const classes = {
  root: (params: InputNumberClassesParams = {}) => {
    const { invalid, fluid } = params;
    return [
      "u-inputnumber u-component",
      {
        "p-invalid": invalid,
        "u-inputnumber-fluid": fluid,
      },
    ];
  },
  pcInputText: "u-inputnumber-input",
};

/** `UBaseComponent`-shaped style module for `UInputNumber`. */
export const inputNumberStyleModule = { css, classes };
