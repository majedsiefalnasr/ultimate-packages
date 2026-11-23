export const style = /*css*/ `
    .u-input-group,
    .u-input-group .u-icon-field,
    .u-input-group .u-float-label,
    .u-input-group .u-ifta-label {
        display: flex;
        align-items: stretch;
        width: 100%;
    }

    .u-input-group .u-float-label .p-inputwrapper,
    .u-input-group .u-ifta-label .p-inputwrapper {
        display: inline-flex;
    }

    .u-input-group .u-inputtext,
    .u-input-group .p-inputwrapper {
        flex: 1 1 auto;
        width: 1%;
    }

    .u-input-group-addon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: dt('inputgroup.addon.padding');
        background: dt('inputgroup.addon.background');
        color: dt('inputgroup.addon.color');
        border-block-start: 1px solid dt('inputgroup.addon.border.color');
        border-block-end: 1px solid dt('inputgroup.addon.border.color');
        min-width: dt('inputgroup.addon.min.width');
    }

    .u-input-group-addon:first-child,
    .u-input-group-addon + .u-input-group-addon {
        border-inline-start: 1px solid dt('inputgroup.addon.border.color');
    }

    .u-input-group-addon:last-child {
        border-inline-end: 1px solid dt('inputgroup.addon.border.color');
    }

    .u-input-group-addon:has(.u-button) {
        padding: 0;
        overflow: hidden;
    }

    .u-input-group-addon .u-button {
        border-radius: 0;
    }

    .u-input-group > .u-component,
    .u-input-group > .p-inputwrapper > .u-component,
    .u-input-group > .u-icon-field > .u-component,
    .u-input-group > .u-float-label > .u-component,
    .u-input-group > .u-float-label > .p-inputwrapper > .u-component,
    .u-input-group > .u-ifta-label > .u-component,
    .u-input-group > .u-ifta-label > .p-inputwrapper > .u-component {
        border-radius: 0;
        margin: 0;
    }

    .u-input-group-addon:first-child,
    .u-input-group > .u-component:first-child,
    .u-input-group > .p-inputwrapper:first-child > .u-component,
    .u-input-group > .u-icon-field:first-child > .u-component,
    .u-input-group > .u-float-label:first-child > .u-component,
    .u-input-group > .u-float-label:first-child > .p-inputwrapper > .u-component,
    .u-input-group > .u-ifta-label:first-child > .u-component,
    .u-input-group > .u-ifta-label:first-child > .p-inputwrapper > .u-component {
        border-start-start-radius: dt('inputgroup.addon.border.radius');
        border-end-start-radius: dt('inputgroup.addon.border.radius');
    }

    .u-input-group-addon:last-child,
    .u-input-group > .u-component:last-child,
    .u-input-group > .p-inputwrapper:last-child > .u-component,
    .u-input-group > .u-icon-field:last-child > .u-component,
    .u-input-group > .u-float-label:last-child > .u-component,
    .u-input-group > .u-float-label:last-child > .p-inputwrapper > .u-component,
    .u-input-group > .u-ifta-label:last-child > .u-component,
    .u-input-group > .u-ifta-label:last-child > .p-inputwrapper > .u-component {
        border-start-end-radius: dt('inputgroup.addon.border.radius');
        border-end-end-radius: dt('inputgroup.addon.border.radius');
    }

    .u-input-group .u-component:focus,
    .u-input-group .u-component.p-focus,
    .u-input-group .p-inputwrapper-focus,
    .u-input-group .u-component:focus ~ label,
    .u-input-group .u-component.p-focus ~ label,
    .u-input-group .p-inputwrapper-focus ~ label,
    .u-input-group .u-float-label .p-inputwrapper ~ label,
    .u-input-group .u-ifta-label .p-inputwrapper ~ label {
        z-index: 1;
    }

    .u-input-group > .u-button:not(.u-button-icon-only) {
        width: auto;
    }

    .u-input-group .u-icon-field + .u-icon-field .u-inputtext {
        border-inline-start: 0;
    }
`;
