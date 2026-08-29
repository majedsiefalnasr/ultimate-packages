export const style = /*css*/ `
    .u-checkbox {
        position: relative;
        display: inline-flex;
        user-select: none;
        vertical-align: bottom;
        width: dt('checkbox.width');
        height: dt('checkbox.height');
    }

    .u-checkbox-input {
        cursor: pointer;
        appearance: none;
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 1;
        outline: 0 none;
        border: 1px solid transparent;
        border-radius: dt('checkbox.border.radius');
    }

    .u-checkbox-box {
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: dt('checkbox.border.radius');
        border: 1px solid dt('checkbox.border.color');
        background: dt('checkbox.background');
        width: dt('checkbox.width');
        height: dt('checkbox.height');
        transition:
            background dt('checkbox.transition.duration'),
            color dt('checkbox.transition.duration'),
            border-color dt('checkbox.transition.duration'),
            box-shadow dt('checkbox.transition.duration'),
            outline-color dt('checkbox.transition.duration');
        outline-color: transparent;
        box-shadow: dt('checkbox.shadow');
    }

    .u-checkbox-icon {
        transition-duration: dt('checkbox.transition.duration');
        color: dt('checkbox.icon.color');
        font-size: dt('checkbox.icon.size');
        width: dt('checkbox.icon.size');
        height: dt('checkbox.icon.size');
    }

    .u-checkbox:not(.p-disabled):has(.u-checkbox-input:hover) .u-checkbox-box {
        border-color: dt('checkbox.hover.border.color');
    }

    .u-checkbox-checked .u-checkbox-box {
        border-color: dt('checkbox.checked.border.color');
        background: dt('checkbox.checked.background');
    }

    .u-checkbox-checked .u-checkbox-icon {
        color: dt('checkbox.icon.checked.color');
    }

    .u-checkbox-checked:not(.p-disabled):has(.u-checkbox-input:hover) .u-checkbox-box {
        background: dt('checkbox.checked.hover.background');
        border-color: dt('checkbox.checked.hover.border.color');
    }

    .u-checkbox-checked:not(.p-disabled):has(.u-checkbox-input:hover) .u-checkbox-icon {
        color: dt('checkbox.icon.checked.hover.color');
    }

    .u-checkbox:not(.p-disabled):has(.u-checkbox-input:focus-visible) .u-checkbox-box {
        border-color: dt('checkbox.focus.border.color');
        box-shadow: dt('checkbox.focus.ring.shadow');
        outline: dt('checkbox.focus.ring.width') dt('checkbox.focus.ring.style') dt('checkbox.focus.ring.color');
        outline-offset: dt('checkbox.focus.ring.offset');
    }

    .u-checkbox-checked:not(.p-disabled):has(.u-checkbox-input:focus-visible) .u-checkbox-box {
        border-color: dt('checkbox.checked.focus.border.color');
    }

    .u-checkbox.p-invalid > .u-checkbox-box {
        border-color: dt('checkbox.invalid.border.color');
    }

    .u-checkbox.p-variant-filled .u-checkbox-box {
        background: dt('checkbox.filled.background');
    }

    .u-checkbox-checked.p-variant-filled .u-checkbox-box {
        background: dt('checkbox.checked.background');
    }

    .u-checkbox-checked.p-variant-filled:not(.p-disabled):has(.u-checkbox-input:hover) .u-checkbox-box {
        background: dt('checkbox.checked.hover.background');
    }

    .u-checkbox.p-disabled {
        opacity: 1;
    }

    .u-checkbox.p-disabled .u-checkbox-box {
        background: dt('checkbox.disabled.background');
        border-color: dt('checkbox.checked.disabled.border.color');
    }

    .u-checkbox.p-disabled .u-checkbox-box .u-checkbox-icon {
        color: dt('checkbox.icon.disabled.color');
    }

    .u-checkbox-sm,
    .u-checkbox-sm .u-checkbox-box {
        width: dt('checkbox.sm.width');
        height: dt('checkbox.sm.height');
    }

    .u-checkbox-sm .u-checkbox-icon {
        font-size: dt('checkbox.icon.sm.size');
        width: dt('checkbox.icon.sm.size');
        height: dt('checkbox.icon.sm.size');
    }

    .u-checkbox-lg,
    .u-checkbox-lg .u-checkbox-box {
        width: dt('checkbox.lg.width');
        height: dt('checkbox.lg.height');
    }

    .u-checkbox-lg .u-checkbox-icon {
        font-size: dt('checkbox.icon.lg.size');
        width: dt('checkbox.icon.lg.size');
        height: dt('checkbox.icon.lg.size');
    }
`;
