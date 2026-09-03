import { style as tableStyle } from "@ultimate/uix-styles/table";

const css = /*css*/ `
    ${tableStyle}
`;

const classes = {
  root: () => "u-table u-component",
  table: () => "u-table-table",
  thead: () => "u-table-thead",
  tbody: () => "u-table-tbody",
  row: (params: { selected?: boolean } = {}) => [
    "u-table-row",
    { "u-table-row-selected": params.selected },
  ],
};

export const tableStyleModule = { css, classes };
