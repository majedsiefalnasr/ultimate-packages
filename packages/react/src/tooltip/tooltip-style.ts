import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-tooltip { position: absolute; padding: .25em .5rem; top: -9999px; left: -9999px; }
.u-tooltip-text { white-space: pre-line; word-break: break-word; }
`;

const classes = {
  root: (params: { position?: string } = {}) => [
    "u-tooltip u-component",
    `u-tooltip-${params.position ?? "right"}`,
  ],
  text: "u-tooltip-text",
};

export const tooltipStyleModule: StyleModule = { css, classes };
