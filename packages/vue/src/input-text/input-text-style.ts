import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `InputTextStyle` (sourced from
 * `@primeuix/styles/inputtext`), hand-ported directly (not re-exported from
 * `@ultimate/uix-styles`) — same reason already documented across
 * `radio-button-style.ts`/`checkbox-style.ts`: this task may not add a new
 * `@ultimate/uix-styles/inputtext` subpath scoped for Vue (Angular's own
 * `@ultimate/uix-styles/inputtext` subpath is Angular-only, already Built,
 * and out of this task's scope to touch). `.p-inputtext*` selectors renamed
 * to `.u-input-text*`; `p-invalid`/`p-filled`/`p-variant-filled` kept
 * unrenamed, matching the established `p-` -> `u-` translation.
 */
const css = /*css*/ `
    .u-input-text {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding-block: dt('inputtext.padding.y');
        padding-inline: dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        transition:
            background dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            outline-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration');
        appearance: none;
        border-radius: dt('inputtext.border.radius');
        outline-color: transparent;
        box-shadow: dt('inputtext.shadow');
    }

    .u-input-text:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .u-input-text:enabled:focus {
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.ring.shadow');
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
    }

    .u-input-text.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .u-input-text.p-variant-filled {
        background: dt('inputtext.filled.background');
    }

    .u-input-text:disabled {
        opacity: 1;
        color: dt('inputtext.disabled.color');
        background: dt('inputtext.disabled.background');
    }

    .u-input-text-fluid {
        width: 100%;
    }
`;

/** Params `UInputText` passes into `cx('root', params)`. */
export interface InputTextClassesParams {
  invalid?: boolean;
  fluid?: boolean;
  filled?: boolean;
}

const classes = {
  root: (params: InputTextClassesParams = {}) => {
    const { invalid, fluid, filled } = params;
    return [
      "u-input-text",
      {
        "p-invalid": Boolean(invalid),
        "u-input-text-fluid": Boolean(fluid),
        "p-variant-filled": Boolean(filled),
      },
    ];
  },
};

export const inputTextStyleModule: StyleModule = { css, classes };
