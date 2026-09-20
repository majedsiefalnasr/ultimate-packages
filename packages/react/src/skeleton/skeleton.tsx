import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { skeletonStyleModule } from "./skeleton-style";

export interface USkeletonProps {
  shape?: "rectangle" | "circle";
  animation?: "wave" | "none";
  borderRadius?: string;
  size?: string;
  width?: string;
  height?: string;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Skeleton` component (real
 * source: `components/lib/skeleton/Skeleton.js`/`SkeletonBase.js`).
 * Confirmed against real source: extends the bare `ComponentBase` tier (no
 * CVA) — a pure placeholder/display component with an empty body, sized via
 * inline `width`/`height`/`size`/`borderRadius` styles and an `animation`/
 * `shape` class toggle.
 *
 * Deliberately excludes real source's `pt`/passthrough system — same
 * "smaller surface than upstream" precedent as every sibling component.
 */
export const USkeleton = React.forwardRef<HTMLDivElement, USkeletonProps>(function USkeleton(
  {
    shape = "rectangle",
    animation = "wave",
    borderRadius,
    size,
    width = "100%",
    height = "1rem",
    className,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "skeleton", styleModule: skeletonStyleModule });

  const style: React.CSSProperties = size
    ? { width: size, height: size, borderRadius }
    : { width, height, borderRadius };

  return (
    <div
      ref={ref}
      className={[cx("root", { shape, animation }), className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden="true"
    />
  );
});
