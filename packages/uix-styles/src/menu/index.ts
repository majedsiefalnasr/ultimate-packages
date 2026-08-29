export const style = /*css*/ `
    .u-menu {
        background: dt('menu.background');
        color: dt('menu.color');
        border: 1px solid dt('menu.border.color');
        border-radius: dt('menu.border.radius');
        min-width: 12.5rem;
    }

    .u-menu-list {
        margin: 0;
        padding: dt('menu.list.padding');
        outline: 0 none;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: dt('menu.list.gap');
    }

    .u-menu-item-content {
        transition:
            background dt('menu.transition.duration'),
            color dt('menu.transition.duration');
        border-radius: dt('menu.item.border.radius');
        color: dt('menu.item.color');
        overflow: hidden;
    }

    .u-menu-item-link {
        cursor: pointer;
        display: flex;
        align-items: center;
        text-decoration: none;
        overflow: hidden;
        position: relative;
        color: inherit;
        padding: dt('menu.item.padding');
        gap: dt('menu.item.gap');
        user-select: none;
        outline: 0 none;
    }

    .u-menu-item-label {
        line-height: 1;
    }

    .u-menu-item-icon {
        color: dt('menu.item.icon.color');
    }

    .u-menu-item.p-focus .u-menu-item-content {
        color: dt('menu.item.focus.color');
        background: dt('menu.item.focus.background');
    }

    .u-menu-item.p-focus .u-menu-item-icon {
        color: dt('menu.item.icon.focus.color');
    }

    .u-menu-item:not(.p-disabled) .u-menu-item-content:hover {
        color: dt('menu.item.focus.color');
        background: dt('menu.item.focus.background');
    }

    .u-menu-item:not(.p-disabled) .u-menu-item-content:hover .u-menu-item-icon {
        color: dt('menu.item.icon.focus.color');
    }

    .u-menu-overlay {
        box-shadow: dt('menu.shadow');
    }

    .u-menu-submenu-label {
        background: dt('menu.submenu.label.background');
        padding: dt('menu.submenu.label.padding');
        color: dt('menu.submenu.label.color');
        font-weight: dt('menu.submenu.label.font.weight');
    }

    .u-menu-separator {
        border-block-start: 1px solid dt('menu.separator.border.color');
    }
`;
