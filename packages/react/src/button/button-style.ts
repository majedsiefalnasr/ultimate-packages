import type { StyleModule } from "@ultimate/react-core";

const css = /*css*/ `
.u-button {
  margin: 0;
  display: inline-flex;
  cursor: pointer;
  user-select: none;
  align-items: center;
  vertical-align: bottom;
  text-align: center;
  overflow: hidden;
  position: relative;
}
.u-button-label { flex: 1 1 auto; }
.u-button-icon { pointer-events: none; }
.u-button-icon-right { order: 1; }
.u-button:disabled { cursor: default; }
.u-button-icon-only { justify-content: center; }
.u-button-icon-only .u-button-label { visibility: hidden; width: 0; flex: 0 0 auto; }
.u-button-vertical { flex-direction: column; }
`;

export interface ButtonClassesParams {
  hasIcon?: boolean;
  label?: string;
  loading?: boolean;
  severity?: string;
  raised?: boolean;
  rounded?: boolean;
  text?: boolean;
  outlined?: boolean;
  link?: boolean;
  plain?: boolean;
  size?: "small" | "large";
  iconPos?: "left" | "right" | "top" | "bottom";
}

const classes = {
  root: (params: ButtonClassesParams = {}) => {
    const {
      hasIcon,
      label,
      loading,
      severity,
      raised,
      rounded,
      text,
      outlined,
      link,
      plain,
      size,
    } = params;
    return [
      "u-button u-component",
      {
        "u-button-icon-only": hasIcon && !label,
        "u-button-loading": loading,
        [`u-button-${severity}`]: Boolean(severity),
        "u-button-raised": raised,
        "u-button-rounded": rounded,
        "u-button-text": text,
        "u-button-outlined": outlined,
        "u-button-link": link,
        "u-button-plain": plain,
        "u-button-sm": size === "small",
        "u-button-lg": size === "large",
      },
    ];
  },
  loadingIcon: "u-button-loading-icon",
  icon: (params: ButtonClassesParams = {}) => [
    "u-button-icon",
    { [`u-button-icon-${params.iconPos}`]: Boolean(params.label) },
  ],
  label: "u-button-label",
};

export const buttonStyleModule: StyleModule = { css, classes };
