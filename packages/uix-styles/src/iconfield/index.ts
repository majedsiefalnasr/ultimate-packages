export const style = /*css*/ `
    .u-icon-field {
        position: relative;
        display: block;
    }

    .u-input-icon {
        position: absolute;
        top: 50%;
        margin-top: calc(-1 * (dt('icon.size') / 2));
        color: dt('iconfield.icon.color');
        line-height: 1;
        z-index: 1;
    }

    .u-icon-field .u-input-icon:first-child {
        inset-inline-start: dt('form.field.padding.x');
    }

    .u-icon-field .u-input-icon:last-child {
        inset-inline-end: dt('form.field.padding.x');
    }

    .u-icon-field .u-inputtext:not(:first-child),
    .u-icon-field .p-inputwrapper:not(:first-child) .u-inputtext {
        padding-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .u-icon-field .u-inputtext:not(:last-child) {
        padding-inline-end: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .u-icon-field:has(.u-inputtext-sm, .u-inputfield-sm) .u-input-icon {
        font-size: dt('form.field.sm.font.size');
        width: dt('form.field.sm.font.size');
        height: dt('form.field.sm.font.size');
        margin-top: calc(-1 * (dt('form.field.sm.font.size') / 2));
    }

    .u-icon-field:has(.u-inputtext-lg, .u-inputfield-lg) .u-input-icon {
        font-size: dt('form.field.lg.font.size');
        width: dt('form.field.lg.font.size');
        height: dt('form.field.lg.font.size');
        margin-top: calc(-1 * (dt('form.field.lg.font.size') / 2));
    }
`;
