export const style = /*css*/ `
    .u-inputtext {
        font-family: var(--font-family);
        font-size: dt('inputtext.font.size');
        color: dt('inputtext.color');
        background: dt('inputtext.background');
        padding: dt('inputtext.padding.y') dt('inputtext.padding.x');
        border: 1px solid dt('inputtext.border.color');
        border-radius: dt('inputtext.border.radius');
        transition:
            background-color dt('inputtext.transition.duration'),
            border-color dt('inputtext.transition.duration'),
            box-shadow dt('inputtext.transition.duration'),
            color dt('inputtext.transition.duration');
        appearance: none;
        outline: 0 none;
    }

    .u-inputtext:enabled:hover {
        border-color: dt('inputtext.hover.border.color');
    }

    .u-inputtext:enabled:focus {
        outline: dt('inputtext.focus.ring.width') dt('inputtext.focus.ring.style') dt('inputtext.focus.ring.color');
        outline-offset: dt('inputtext.focus.ring.offset');
        border-color: dt('inputtext.focus.border.color');
        box-shadow: dt('inputtext.focus.shadow');
    }

    .u-inputtext.p-filled {
        background: dt('inputtext.filled.background');
    }

    .u-inputtext.p-filled:enabled:hover {
        background: dt('inputtext.filled.hover.background');
    }

    .u-inputtext.p-filled:enabled:focus {
        background: dt('inputtext.filled.focus.background');
    }

    .u-inputtext:disabled {
        opacity: 1;
        background: dt('inputtext.disabled.background');
        color: dt('inputtext.disabled.color');
    }

    .u-inputtext.p-invalid {
        border-color: dt('inputtext.invalid.border.color');
    }

    .u-inputtext.p-invalid:enabled:focus {
        border-color: dt('inputtext.invalid.focus.border.color');
        box-shadow: dt('inputtext.invalid.focus.shadow');
    }
`;

