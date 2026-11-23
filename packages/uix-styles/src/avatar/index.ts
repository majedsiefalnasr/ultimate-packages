export const style = /*css*/ `
    .u-avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: dt('avatar.width');
        height: dt('avatar.height');
        font-size: dt('avatar.font.size');
        background: dt('avatar.background');
        color: dt('avatar.color');
        border-radius: dt('avatar.border.radius');
    }

    .u-avatar-image {
        background: transparent;
    }

    .u-avatar-clickable {
        cursor: pointer;
    }

    .u-avatar-circle {
        border-radius: 50%;
    }

    .u-avatar-circle img {
        border-radius: 50%;
    }

    .u-avatar-icon {
        font-size: dt('avatar.icon.size');
        width: dt('avatar.icon.size');
        height: dt('avatar.icon.size');
    }

    .u-avatar img {
        width: 100%;
        height: 100%;
    }

    .u-avatar-lg {
        width: dt('avatar.lg.width');
        height: dt('avatar.lg.width');
        font-size: dt('avatar.lg.font.size');
    }

    .u-avatar-lg .u-avatar-icon {
        font-size: dt('avatar.lg.icon.size');
        width: dt('avatar.lg.icon.size');
        height: dt('avatar.lg.icon.size');
    }

    .u-avatar-xl {
        width: dt('avatar.xl.width');
        height: dt('avatar.xl.width');
        font-size: dt('avatar.xl.font.size');
    }

    .u-avatar-xl .u-avatar-icon {
        font-size: dt('avatar.xl.icon.size');
        width: dt('avatar.xl.icon.size');
        height: dt('avatar.xl.icon.size');
    }

    .u-avatar-group {
        display: flex;
        align-items: center;
    }

    .u-avatar-group .u-avatar + .u-avatar {
        margin-inline-start: dt('avatar.group.offset');
    }

    .u-avatar-group .u-avatar {
        border: 2px solid dt('avatar.group.border.color');
    }

    .u-avatar-group .u-avatar-lg + .u-avatar-lg {
        margin-inline-start: dt('avatar.lg.group.offset');
    }

    .u-avatar-group .u-avatar-xl + .u-avatar-xl {
        margin-inline-start: dt('avatar.xl.group.offset');
    }
`;
