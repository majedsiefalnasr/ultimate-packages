export const style = /*css*/ `
    .u-paginator {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        background: dt('paginator.background');
        color: dt('paginator.color');
        padding: dt('paginator.padding');
        border-radius: dt('paginator.border.radius');
        gap: dt('paginator.gap');
    }

    .u-paginator-content {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: dt('paginator.gap');
    }

    .u-paginator-content-start {
        margin-inline-end: auto;
    }

    .u-paginator-content-end {
        margin-inline-start: auto;
    }

    .u-paginator-page,
    .u-paginator-next,
    .u-paginator-last,
    .u-paginator-first,
    .u-paginator-prev {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        user-select: none;
        overflow: hidden;
        position: relative;
        background: dt('paginator.nav.button.background');
        border: 0 none;
        color: dt('paginator.nav.button.color');
        min-width: dt('paginator.nav.button.width');
        height: dt('paginator.nav.button.height');
        transition:
            background dt('paginator.transition.duration'),
            color dt('paginator.transition.duration'),
            outline-color dt('paginator.transition.duration'),
            box-shadow dt('paginator.transition.duration');
        border-radius: dt('paginator.nav.button.border.radius');
        padding: 0;
        margin: 0;
    }

    .u-paginator-page:focus-visible,
    .u-paginator-next:focus-visible,
    .u-paginator-last:focus-visible,
    .u-paginator-first:focus-visible,
    .u-paginator-prev:focus-visible {
        box-shadow: dt('paginator.nav.button.focus.ring.shadow');
        outline: dt('paginator.nav.button.focus.ring.width') dt('paginator.nav.button.focus.ring.style') dt('paginator.nav.button.focus.ring.color');
        outline-offset: dt('paginator.nav.button.focus.ring.offset');
    }

    .u-paginator-page:not(.p-disabled):not(.u-paginator-page-selected):hover,
    .u-paginator-first:not(.p-disabled):hover,
    .u-paginator-prev:not(.p-disabled):hover,
    .u-paginator-next:not(.p-disabled):hover,
    .u-paginator-last:not(.p-disabled):hover {
        background: dt('paginator.nav.button.hover.background');
        color: dt('paginator.nav.button.hover.color');
    }

    .u-paginator-page.u-paginator-page-selected {
        background: dt('paginator.nav.button.selected.background');
        color: dt('paginator.nav.button.selected.color');
    }

    .u-paginator-current {
        color: dt('paginator.current.page.report.color');
    }

    .u-paginator-pages {
        display: flex;
        align-items: center;
        gap: dt('paginator.gap');
    }

    .u-paginator-first:dir(rtl),
    .u-paginator-prev:dir(rtl),
    .u-paginator-next:dir(rtl),
    .u-paginator-last:dir(rtl) {
        transform: rotate(180deg);
    }
`;
