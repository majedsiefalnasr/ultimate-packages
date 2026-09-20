import type { StyleModule } from "@ultimate/vue-core";

/**
 * Ultimate-owned adaptation of PrimeVue's `TextareaStyle` (sourced from
 * `@primeuix/styles/textarea`), hand-ported directly (not re-exported from
 * `@ultimate/uix-styles`) — same reason already documented across
 * `input-text-style.ts`/`checkbox-style.ts`. `.p-textarea*` selectors
 * renamed to `.u-textarea*`; `p-disabled`/`p-invalid` kept unrenamed,
 * matching the established `p-` -> `u-` translation.
 */
const css = /*css*/ `
    .u-textarea {
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 1rem;
        color: dt('textarea.color');
        background: dt('textarea.background');
        padding-block: dt('textarea.padding.y');
        padding-inline: dt('textarea.padding.x');
        border: 1px solid dt('textarea.border.color');
        transition:
            background dt('textarea.transition.duration'),
            color dt('textarea.transition.duration'),
            border-color dt('textarea.transition.duration'),
            outline-color dt('textarea.transition.duration'),
            box-shadow dt('textarea.transition.duration');
        appearance: none;
        border-radius: dt('textarea.border.radius');
        outline-color: transparent;
        box-shadow: dt('textarea.shadow');
    }

    .u-textarea:enabled:hover {
        border-color: dt('textarea.hover.border.color');
    }

    .u-textarea:enabled:focus {
        border-color: dt('textarea.focus.border.color');
        box-shadow: dt('textarea.focus.ring.shadow');
        outline: dt('textarea.focus.ring.width') dt('textarea.focus.ring.style') dt('textarea.focus.ring.color');
        outline-offset: dt('textarea.focus.ring.offset');
    }

    .u-textarea.p-invalid {
        border-color: dt('textarea.invalid.border.color');
    }

    .u-textarea.p-variant-filled {
        background: dt('textarea.filled.background');
    }

    .u-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .u-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .u-textarea-fluid {
        width: 100%;
    }

    .u-textarea-resizable {
        overflow: hidden;
        resize: none;
    }
`;

/** Params `UTextarea` passes into `cx('root', params)`. */
export interface TextareaClassesParams {
  filled?: boolean;
  autoResize?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  variantFilled?: boolean;
}

const classes = {
  root: (params: TextareaClassesParams = {}) => {
    const { filled, autoResize, invalid, fluid, variantFilled } = params;

    return [
      "u-textarea",
      {
        "p-filled": Boolean(filled),
        "u-textarea-resizable": Boolean(autoResize),
        "p-invalid": Boolean(invalid),
        "u-textarea-fluid": Boolean(fluid),
        "p-variant-filled": Boolean(variantFilled),
      },
    ];
  },
};

export const textareaStyleModule: StyleModule = { css, classes };
