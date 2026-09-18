import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `date-picker-style.ts`'s established React
 * convention (no `dt()` tokens — React has no `@ultimate/uix-styles`
 * subpath dependency the way Angular/Vue's style modules do). Selector
 * structure ported from `.vendor-extracted/uix-styles-full/src/floatlabel`
 * (the real `@primeuix/styles/floatlabel` module), `.p-floatlabel*` renamed
 * to `.u-float-label*`, `dt()` token calls replaced with literal values.
 */
const css = /*css*/ `
.u-float-label { display: block; position: relative; }
.u-float-label label {
  position: absolute;
  pointer-events: none;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.2s ease;
  line-height: 1;
  font-weight: 400;
  inset-inline-start: 0.75rem;
  color: #6b7280;
}
.u-float-label:has(.u-textarea) label { top: 1rem; transform: translateY(0); }
.u-float-label:has(input:focus) label,
.u-float-label:has(input.u-filled) label,
.u-float-label:has(input:-webkit-autofill) label,
.u-float-label:has(textarea:focus) label,
.u-float-label:has(textarea.u-filled) label,
.u-float-label:has(.u-inputwrapper-focus) label,
.u-float-label:has(.u-inputwrapper-filled) label,
.u-float-label:has(input[placeholder]) label,
.u-float-label:has(textarea[placeholder]) label {
  top: 0;
  transform: translateY(-50%);
  font-size: 0.75rem;
  font-weight: 500;
}
.u-float-label:has(input.u-filled) label,
.u-float-label:has(textarea.u-filled) label,
.u-float-label:has(.u-inputwrapper-filled) label { color: #374151; }
.u-float-label:has(input:focus) label,
.u-float-label:has(input:-webkit-autofill) label,
.u-float-label:has(textarea:focus) label,
.u-float-label:has(.u-inputwrapper-focus) label { color: #6366f1; }
.u-float-label-in .u-input-text,
.u-float-label-in .u-textarea { padding-block-start: 1.25rem; padding-block-end: 0.5rem; }
.u-float-label-in:has(input:focus) label,
.u-float-label-in:has(input.u-filled) label,
.u-float-label-in:has(input:-webkit-autofill) label,
.u-float-label-in:has(textarea:focus) label,
.u-float-label-in:has(textarea.u-filled) label,
.u-float-label-in:has(.u-inputwrapper-focus) label,
.u-float-label-in:has(.u-inputwrapper-filled) label { top: 0.75rem; }
.u-float-label-on:has(input:focus) label,
.u-float-label-on:has(input.u-filled) label,
.u-float-label-on:has(input:-webkit-autofill) label,
.u-float-label-on:has(textarea:focus) label,
.u-float-label-on:has(textarea.u-filled) label,
.u-float-label-on:has(.u-inputwrapper-focus) label,
.u-float-label-on:has(.u-inputwrapper-filled) label {
  top: 0;
  transform: translateY(-50%);
  border-radius: 4px;
  background: #ffffff;
  padding: 0 0.25rem;
}
.u-float-label:has(.u-invalid) label { color: #e24c4c; }
`;

const classes = {
  root: (params: { variant?: "in" | "over" | "on" } = {}) => [
    "u-float-label",
    {
      "u-float-label-over": params.variant === "over",
      "u-float-label-on": params.variant === "on",
      "u-float-label-in": params.variant === "in",
    },
  ],
};

export const floatLabelStyleModule: StyleModule = { css, classes };
