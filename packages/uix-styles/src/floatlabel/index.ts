export const style = /*css*/ `
    .u-float-label {
        display: block;
        position: relative;
    }

    .u-float-label label {
        position: absolute;
        pointer-events: none;
        top: 50%;
        transform: translateY(-50%);
        transition-property: all;
        transition-timing-function: ease;
        line-height: 1;
        font-weight: dt('floatlabel.font.weight');
        inset-inline-start: dt('floatlabel.position.x');
        color: dt('floatlabel.color');
        transition-duration: dt('floatlabel.transition.duration');
    }

    .u-float-label:has(.u-textarea) label {
        top: dt('floatlabel.position.y');
        transform: translateY(0);
    }

    .u-float-label:has(.u-input-icon:first-child) label {
        inset-inline-start: calc((dt('form.field.padding.x') * 2) + dt('icon.size'));
    }

    .u-float-label:has(input:focus) label,
    .u-float-label:has(input.p-filled) label,
    .u-float-label:has(input:-webkit-autofill) label,
    .u-float-label:has(textarea:focus) label,
    .u-float-label:has(textarea.p-filled) label,
    .u-float-label:has(.p-inputwrapper-focus) label,
    .u-float-label:has(.p-inputwrapper-filled) label,
    .u-float-label:has(input[placeholder]) label,
    .u-float-label:has(textarea[placeholder]) label {
        top: dt('floatlabel.over.active.top');
        transform: translateY(0);
        font-size: dt('floatlabel.active.font.size');
        font-weight: dt('floatlabel.active.font.weight');
    }

    .u-float-label:has(input.p-filled) label,
    .u-float-label:has(textarea.p-filled) label,
    .u-float-label:has(.p-inputwrapper-filled) label {
        color: dt('floatlabel.active.color');
    }

    .u-float-label:has(input:focus) label,
    .u-float-label:has(input:-webkit-autofill) label,
    .u-float-label:has(textarea:focus) label,
    .u-float-label:has(.p-inputwrapper-focus) label {
        color: dt('floatlabel.focus.color');
    }

    .u-float-label-in .u-inputtext,
    .u-float-label-in .u-textarea,
    .u-float-label-in .u-select-label,
    .u-float-label-in .u-multi-select-label,
    .u-float-label-in .u-multi-select-label:has(.u-chip),
    .u-float-label-in .u-autocomplete-input-multiple,
    .u-float-label-in .u-cascade-select-label,
    .u-float-label-in .u-treeselect-label {
        padding-block-start: dt('floatlabel.in.input.padding.top');
        padding-block-end: dt('floatlabel.in.input.padding.bottom');
    }

    .u-float-label-in:has(input:focus) label,
    .u-float-label-in:has(input.p-filled) label,
    .u-float-label-in:has(input:-webkit-autofill) label,
    .u-float-label-in:has(textarea:focus) label,
    .u-float-label-in:has(textarea.p-filled) label,
    .u-float-label-in:has(.p-inputwrapper-focus) label,
    .u-float-label-in:has(.p-inputwrapper-filled) label,
    .u-float-label-in:has(input[placeholder]) label,
    .u-float-label-in:has(textarea[placeholder]) label {
        top: dt('floatlabel.in.active.top');
    }

    .u-float-label-on:has(input:focus) label,
    .u-float-label-on:has(input.p-filled) label,
    .u-float-label-on:has(input:-webkit-autofill) label,
    .u-float-label-on:has(textarea:focus) label,
    .u-float-label-on:has(textarea.p-filled) label,
    .u-float-label-on:has(.p-inputwrapper-focus) label,
    .u-float-label-on:has(.p-inputwrapper-filled) label,
    .u-float-label-on:has(input[placeholder]) label,
    .u-float-label-on:has(textarea[placeholder]) label {
        top: 0;
        transform: translateY(-50%);
        border-radius: dt('floatlabel.on.border.radius');
        background: dt('floatlabel.on.active.background');
        padding: dt('floatlabel.on.active.padding');
    }

    .u-float-label:has([class^='u-'][class$='-fluid']) {
        width: 100%;
    }

    .u-float-label:has(.p-invalid) label {
        color: dt('floatlabel.invalid.color');
    }
`;
