import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS, no `dt()` tokens, matching `checkbox-style.ts`'s
 * established React convention — real source's own `MultiStateCheckboxBase`
 * reuses `.p-checkbox*` classes wholesale (`classNames('p-multistatecheckbox
 * p-checkbox p-component', ...)`); this port keeps a self-contained
 * `.u-multi-state-checkbox*` class family instead (not cross-referencing
 * `UCheckbox`'s own classes), matching this package's established
 * "framework-native, not verbatim" posture — same visual shape, independent
 * CSS ownership, consistent with `checkbox-style.ts`'s own box/icon
 * structure.
 */
const css = /*css*/ `
.u-multi-state-checkbox { position: relative; display: inline-flex; user-select: none; vertical-align: bottom; cursor: pointer; }
.u-multi-state-checkbox-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: #ffffff;
}
.u-multi-state-checkbox-disabled { cursor: default; opacity: 0.6; }
`;

const classes = {
  root: "u-multi-state-checkbox u-component",
  box: "u-multi-state-checkbox-box",
  icon: "u-multi-state-checkbox-icon",
};

export const multiStateCheckboxStyleModule: StyleModule = { css, classes };
