/**
 * Ultimate-owned style module for `UInputMask`.
 *
 * Real PrimeNG's `InputMask` component renders a native `<input pInputText>`
 * (confirmed against real `inputmask.ts`'s own template — `<input #input
 * pInputText ...>`) and has NO dedicated `@primeuix/styles/inputmask`
 * package of its own — confirmed by its absence from
 * `.vendor-cache/@primeuix__styles-2.0.3.tar.gz`'s `package/dist/` listing
 * (every other Batch 1 capability in this same task has one; InputMask does
 * not). `InputMaskDirective` (the internal `[pInputMask]` helper directive
 * real source also declares) contributes only a single `p-inputmask` host
 * class with no accompanying CSS of its own either. InputMask's actual
 * visual styling is therefore entirely `pInputText`'s own `.p-inputtext`
 * rules, applied via the real template's `[class]="cx('pcInputText')"`
 * binding — the same reuse relationship `UInputOtp`'s per-segment inputs
 * have with `UInputText`'s classes (see `input-otp-style.ts`'s own doc
 * comment).
 *
 * This module therefore defines only the thin `root`/`pcInputText` class
 * wiring (mirroring `inputNumberStyleModule`'s `pcInputText` slot pattern,
 * `packages/ng/src/input-number/input-number-style.ts`) plus the
 * `u-inputmask-fluid`/`p-invalid` structural modifiers reflected on `root`.
 * No new `.u-inputmask*` CSS rules are invented — there is no real source
 * CSS to port for them.
 */
const css = /*css*/ ``;

/** Params `UInputMask` passes into `cx('root', params)`. */
export interface InputMaskClassesParams {
  invalid?: boolean;
  fluid?: boolean;
}

const classes = {
  root: (params: InputMaskClassesParams = {}) => {
    const { invalid, fluid } = params;
    return [
      "u-inputmask u-component",
      {
        "p-invalid": invalid,
        "u-inputmask-fluid": fluid,
      },
    ];
  },
  pcInputText: "u-inputtext",
};

/** `UBaseComponent`-shaped style module for `UInputMask`. */
export const inputMaskStyleModule = { css, classes };
