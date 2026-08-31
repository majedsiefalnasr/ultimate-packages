import type { StyleModule } from "@ultimate/vue-core";
import { style as buttonCss } from "@ultimate/uix-styles/button";

/**
 * Implementation-time verification finding (this task's Step 2): the brief's
 * draft assumed `@ultimate/uix-styles/button` exports a `buttonStyle` object
 * already shaped as `{ css, classes }`. The real file
 * (`packages/uix-styles/src/button/index.ts`) only exports a plain
 * `style: string` — raw CSS with `dt()` token references, no `classes`
 * resolver map at all (confirmed by that package's own
 * `test/button.test.ts`, which only asserts against the `style` string).
 * `StyleModule` (`packages/vue-core/src/base/base-component.ts`) requires
 * both `css` and a `classes` map of per-slot resolvers. The `classes` map
 * below is therefore authored locally here, not re-exported from
 * uix-styles — following the same adaptation already established for
 * Angular's `packages/ng/src/button/button-style.ts` (which hit the
 * identical mismatch and resolved it the same way: import the real `style`
 * string for `css`, author `classes` locally).
 */
const css = /*css*/ `
    ${buttonCss}
`;

/** Params `UButton` passes into `cx('root'|'icon', params)` — see `createBaseComponent`'s `cx()`. */
export interface ButtonClassesParams {
  hasIcon?: boolean;
  label?: string;
  loading?: boolean;
  severity?: string | null;
  raised?: boolean;
  rounded?: boolean;
  text?: boolean;
  outlined?: boolean;
  link?: boolean;
  size?: string | null;
  fluid?: boolean;
  iconPos?: string;
}

const classes = {
  root: (params: ButtonClassesParams = {}) => {
    const { hasIcon, label, loading, severity, raised, rounded, text, outlined, link, size, fluid } =
      params;

    return [
      "u-button",
      {
        "u-button-icon-only": Boolean(hasIcon) && !label,
        "u-button-loading": Boolean(loading),
        [`u-button-${severity}`]: Boolean(severity),
        "u-button-raised": Boolean(raised),
        "u-button-rounded": Boolean(rounded),
        "u-button-text": Boolean(text),
        "u-button-outlined": Boolean(outlined),
        "u-button-link": Boolean(link),
        "u-button-sm": size === "small",
        "u-button-lg": size === "large",
        "u-button-fluid": Boolean(fluid),
      },
    ];
  },
  loadingIcon: "u-button-loading-icon",
  icon: (params: ButtonClassesParams = {}) => [
    "u-button-icon",
    { [`u-button-icon-${params.iconPos}`]: Boolean(params.label) },
  ],
  label: "u-button-label",
  badge: "u-button-badge",
};

export const buttonStyleModule: StyleModule = { css, classes };
