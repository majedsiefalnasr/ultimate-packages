export const style = /*css*/ `
    .u-inputnumber {
        display: inline-flex;
        position: relative;
    }

    .u-inputnumber-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        cursor: pointer;
        background: dt('inputnumber.button.background');
        color: dt('inputnumber.button.color');
        width: dt('inputnumber.button.width');
        transition:
            background dt('inputnumber.transition.duration'),
            color dt('inputnumber.transition.duration'),
            border-color dt('inputnumber.transition.duration'),
            outline-color dt('inputnumber.transition.duration');
    }

    .u-inputnumber-button:disabled {
        cursor: auto;
    }

    .u-inputnumber-button:not(:disabled):hover {
        background: dt('inputnumber.button.hover.background');
        color: dt('inputnumber.button.hover.color');
    }

    .u-inputnumber-button:not(:disabled):active {
        background: dt('inputnumber.button.active.background');
        color: dt('inputnumber.button.active.color');
    }

    .u-inputnumber-stacked .u-inputnumber-button {
        position: relative;
        flex: 1 1 auto;
        border: 0 none;
    }

    .u-inputnumber-stacked .u-inputnumber-button-group {
        display: flex;
        flex-direction: column;
        position: absolute;
        inset-block-start: 1px;
        inset-inline-end: 1px;
        height: calc(100% - 2px);
        z-index: 1;
    }

    .u-inputnumber-stacked .u-inputnumber-increment-button {
        padding: 0;
        border-start-end-radius: calc(dt('inputnumber.button.border.radius') - 1px);
    }

    .u-inputnumber-stacked .u-inputnumber-decrement-button {
        padding: 0;
        border-end-end-radius: calc(dt('inputnumber.button.border.radius') - 1px);
    }

    .u-inputnumber-stacked .u-inputnumber-input {
        padding-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }

    .u-inputnumber-horizontal .u-inputnumber-button {
        border: 1px solid dt('inputnumber.button.border.color');
    }

    .u-inputnumber-horizontal .u-inputnumber-button:hover {
        border-color: dt('inputnumber.button.hover.border.color');
    }

    .u-inputnumber-horizontal .u-inputnumber-button:active {
        border-color: dt('inputnumber.button.active.border.color');
    }

    .u-inputnumber-horizontal .u-inputnumber-increment-button {
        order: 3;
        border-start-end-radius: dt('inputnumber.button.border.radius');
        border-end-end-radius: dt('inputnumber.button.border.radius');
        border-inline-start: 0 none;
    }

    .u-inputnumber-horizontal .u-inputnumber-input {
        order: 2;
        border-radius: 0;
    }

    .u-inputnumber-horizontal .u-inputnumber-decrement-button {
        order: 1;
        border-start-start-radius: dt('inputnumber.button.border.radius');
        border-end-start-radius: dt('inputnumber.button.border.radius');
        border-inline-end: 0 none;
    }

    .p-floatlabel:has(.u-inputnumber-horizontal) label {
        margin-inline-start: dt('inputnumber.button.width');
    }

    .u-inputnumber-vertical {
        flex-direction: column;
    }

    .u-inputnumber-vertical .u-inputnumber-button {
        border: 1px solid dt('inputnumber.button.border.color');
        padding: dt('inputnumber.button.vertical.padding');
    }

    .u-inputnumber-vertical .u-inputnumber-button:hover {
        border-color: dt('inputnumber.button.hover.border.color');
    }

    .u-inputnumber-vertical .u-inputnumber-button:active {
        border-color: dt('inputnumber.button.active.border.color');
    }

    .u-inputnumber-vertical .u-inputnumber-increment-button {
        order: 1;
        border-start-start-radius: dt('inputnumber.button.border.radius');
        border-start-end-radius: dt('inputnumber.button.border.radius');
        width: 100%;
        border-block-end: 0 none;
    }

    .u-inputnumber-vertical .u-inputnumber-input {
        order: 2;
        border-radius: 0;
        text-align: center;
    }

    .u-inputnumber-vertical .u-inputnumber-decrement-button {
        order: 3;
        border-end-start-radius: dt('inputnumber.button.border.radius');
        border-end-end-radius: dt('inputnumber.button.border.radius');
        width: 100%;
        border-block-start: 0 none;
    }

    .u-inputnumber-input {
        flex: 1 1 auto;
    }

    .u-inputnumber-fluid {
        width: 100%;
    }

    .u-inputnumber-fluid .u-inputnumber-input {
        width: 1%;
    }

    .u-inputnumber-fluid.u-inputnumber-vertical .u-inputnumber-input {
        width: 100%;
    }

    .u-inputnumber:has(.p-inputtext-sm) .u-inputnumber-button .p-icon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
    }

    .u-inputnumber:has(.p-inputtext-lg) .u-inputnumber-button .p-icon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
    }

    .u-inputnumber-clear-icon {
        position: absolute;
        top: 50%;
        margin-top: -0.5rem;
        cursor: pointer;
        inset-inline-end: dt('form.field.padding.x');
        color: dt('form.field.icon.color');
    }

    .u-inputnumber:has(.u-inputnumber-clear-icon) .u-inputnumber-input {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .u-inputnumber-stacked .u-inputnumber-clear-icon {
        inset-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }

    .u-inputnumber-stacked:has(.u-inputnumber-clear-icon) .u-inputnumber-input {
        padding-inline-end: calc(dt('inputnumber.button.width') + (dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .u-inputnumber-horizontal .u-inputnumber-clear-icon {
        inset-inline-end: calc(dt('inputnumber.button.width') + dt('form.field.padding.x'));
    }
`;
