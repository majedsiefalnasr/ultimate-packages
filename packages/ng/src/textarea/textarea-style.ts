/**
 * Ultimate-owned adaptation of PrimeNG's `TextareaStyle` (real source
 * extracted this session from `.vendor-cache/primeng-21.1.9.tar.gz`'s
 * `packages/primeng/src/textarea/style/textareastyle.ts`, and its real CSS
 * from `.vendor-cache/@primeuix__styles-2.0.3.tar.gz`'s
 * `package/dist/textarea/index.mjs`), shaped to match `UBaseComponent`'s
 * `styleModule: {css, classes}` contract — same pattern already established
 * by `radioButtonStyleModule`/`toggleButtonStyleModule`/
 * `toggleSwitchStyleModule` (`packages/ng/src/{radio-button,toggle-button,
 * toggle-switch}/*-style.ts`).
 *
 * Per the same finding already documented for those three siblings
 * (`@ultimate/uix-styles` never exports a `classes` object, only a plain CSS
 * `style` string, and this task's hard constraints forbid touching any file
 * outside `packages/ng/`, `packages/react/`, `packages/vue/` — meaning no new
 * `@ultimate/uix-styles/textarea` subpath can be added here), this file
 * hand-ports the real `@primeuix/styles/textarea` CSS content directly, with
 * `.p-textarea*` selectors renamed to `.u-textarea*` (matching the same
 * `p-` -> `u-` translation `radioButtonStyleModule` established), while
 * `p-invalid`/`p-variant-filled`/`p-disabled` shared structural modifier
 * classes are kept unrenamed — same precedent as every sibling style module.
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

    .u-textarea.p-variant-filled:enabled:hover {
        background: dt('textarea.filled.hover.background');
    }

    .u-textarea.p-variant-filled:enabled:focus {
        background: dt('textarea.filled.focus.background');
    }

    .u-textarea:disabled {
        opacity: 1;
        background: dt('textarea.disabled.background');
        color: dt('textarea.disabled.color');
    }

    .u-textarea::placeholder {
        color: dt('textarea.placeholder.color');
    }

    .u-textarea.p-invalid::placeholder {
        color: dt('textarea.invalid.placeholder.color');
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
  invalid?: boolean;
  fluid?: boolean;
  variantFilled?: boolean;
  autoResize?: boolean;
}

const classes = {
  root: (params: TextareaClassesParams = {}) => {
    const { invalid, fluid, variantFilled, autoResize } = params;
    return [
      "u-textarea u-component",
      {
        "p-invalid": invalid,
        "u-textarea-fluid": fluid,
        "p-variant-filled": variantFilled,
        "u-textarea-resizable": autoResize,
      },
    ];
  },
};

/** `UBaseComponent`-shaped style module for `UTextarea`. */
export const textareaStyleModule = { css, classes };
