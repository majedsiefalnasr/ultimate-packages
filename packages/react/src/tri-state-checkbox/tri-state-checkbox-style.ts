import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS, no `dt()` tokens, matching `checkbox-style.ts`'s
 * established React convention. Self-contained `.u-tri-state-checkbox*`
 * class family (not cross-referencing `UCheckbox`'s own classes) — same
 * reasoning as `multi-state-checkbox-style.ts`.
 */
const css = /*css*/ `
.u-tri-state-checkbox { position: relative; display: inline-flex; user-select: none; vertical-align: bottom; }
.u-tri-state-checkbox-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
}
.u-tri-state-checkbox-input { cursor: pointer; position: absolute; opacity: 0; inset: 0; margin: 0; }
.u-tri-state-checkbox-invalid .u-tri-state-checkbox-box { border-color: #e24c4c; }
.u-tri-state-checkbox-disabled .u-tri-state-checkbox-box { cursor: default; opacity: 0.6; }
`;

const classes = {
  root: (params: { disabled?: boolean; invalid?: boolean } = {}) => [
    "u-tri-state-checkbox u-component",
    { "u-tri-state-checkbox-disabled": params.disabled, "u-tri-state-checkbox-invalid": params.invalid },
  ],
  box: "u-tri-state-checkbox-box",
  input: "u-tri-state-checkbox-input",
  icon: "u-tri-state-checkbox-icon",
};

export const triStateCheckboxStyleModule: StyleModule = { css, classes };
