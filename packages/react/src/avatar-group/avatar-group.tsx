import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { avatarGroupStyleModule } from "./avatar-group-style";

/**
 * Ultimate-owned adaptation of PrimeReact's `AvatarGroup` (real source:
 * `components/lib/avatargroup/AvatarGroup.js`). A content-wrapping
 * `<span role="group">` for `UAvatar`; the overlapping layout is CSS-only
 * (see `avatar-group-style.ts`).
 */
export interface UAvatarGroupProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "role"> {
  children?: React.ReactNode;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the group's root element. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

export const UAvatarGroup = React.forwardRef<HTMLSpanElement, UAvatarGroupProps>(
  function UAvatarGroup(props, ref) {
    const { children, className, unstyled, pt, ptOptions, ...rest } = props;
    const { cx } = useComponentBase({
      componentName: "avatar-group",
      styleModule: avatarGroupStyleModule,
      unstyled,
    });
    const { ptm } = createPassThrough("avatar-group", { props: { pt, ptOptions } });
    const mergeProps = useMergeProps();

    return (
      <span
        ref={ref}
        {...mergeProps(
          { role: "group" },
          rest,
          { className: [cx("root"), className].filter(Boolean).join(" ") },
          ptm("root")
        )}
      >
        {children}
      </span>
    );
  }
);
