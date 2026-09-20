import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { avatarGroupStyleModule } from "./avatar-group-style";

export interface UAvatarGroupProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `AvatarGroup` component (real
 * source: `components/lib/avatargroup/AvatarGroup.js`). A helper component
 * for `UAvatar` — a trivial content-wrapping `<span role="group">`, matching
 * real source's own minimal surface (no props beyond `className`/`style`,
 * both of which this port reduces to `className`, same "smaller surface
 * than upstream" precedent as every sibling component). The
 * overlapping-avatars visual is CSS-only (see `avatar-group-style.ts`).
 */
export const UAvatarGroup = React.forwardRef<HTMLSpanElement, UAvatarGroupProps>(
  function UAvatarGroup({ children, className }, ref) {
    const { cx } = useComponentBase({
      componentName: "avatar-group",
      styleModule: avatarGroupStyleModule,
    });

    return (
      <span ref={ref} role="group" className={[cx("root"), className].filter(Boolean).join(" ")}>
        {children}
      </span>
    );
  }
);
