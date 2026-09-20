import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS matching `select-button-style.ts`'s established React
 * convention (no `dt()` tokens).
 */
const css = /*css*/ `
.u-knob-range { fill: none; }
.u-knob-value { fill: none; }
.u-knob-text { font-size: 1.3rem; text-align: center; }
`;

const classes = {
  root: "u-knob u-component",
  range: "u-knob-range",
  value: "u-knob-value",
  text: "u-knob-text",
};

export const knobStyleModule: StyleModule = { css, classes };
