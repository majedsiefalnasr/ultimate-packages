import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-checkbox { position: relative; display: inline-flex; user-select: none; vertical-align: bottom; }
.u-checkbox-box { display: flex; align-items: center; justify-content: center; }
.u-checkbox-input { cursor: pointer; position: absolute; opacity: 0; inset: 0; margin: 0; }
`;

const classes = {
  root: (params: { checked?: boolean } = {}) => [
    "u-checkbox u-component",
    { "u-checkbox-checked": params.checked },
  ],
  box: (params: { checked?: boolean } = {}) => [
    "u-checkbox-box",
    { "u-checkbox-box-checked": params.checked },
  ],
  input: "u-checkbox-input",
  icon: "u-checkbox-icon",
};

export const checkboxStyleModule: StyleModule = { css, classes };
