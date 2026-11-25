export const style = /*css*/ `
    .u-rating {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: dt('rating.gap');
    }

    .u-rating-option {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
        outline-color: transparent;
        border-radius: 50%;
        transition:
            background dt('rating.transition.duration'),
            color dt('rating.transition.duration'),
            border-color dt('rating.transition.duration'),
            outline-color dt('rating.transition.duration'),
            box-shadow dt('rating.transition.duration');
    }

    .u-rating-option.p-focus-visible {
        box-shadow: dt('rating.focus.ring.shadow');
        outline: dt('rating.focus.ring.width') dt('rating.focus.ring.style') dt('rating.focus.ring.color');
        outline-offset: dt('rating.focus.ring.offset');
    }

    .u-rating-icon {
        color: dt('rating.icon.color');
        transition:
            background dt('rating.transition.duration'),
            color dt('rating.transition.duration'),
            border-color dt('rating.transition.duration'),
            outline-color dt('rating.transition.duration'),
            box-shadow dt('rating.transition.duration');
        font-size: dt('rating.icon.size');
        width: dt('rating.icon.size');
        height: dt('rating.icon.size');
    }

    .u-rating:not(.p-disabled):not(.p-readonly) .u-rating-option:hover .u-rating-icon {
        color: dt('rating.icon.hover.color');
    }

    .u-rating-option-active .u-rating-icon {
        color: dt('rating.icon.active.color');
    }

    .u-rating-icon.p-invalid {
        stroke: dt('form.field.invalid.border.color');
    }

    .u-rating.p-readonly .u-rating-option {
        cursor: not-allowed;
    }
`;
