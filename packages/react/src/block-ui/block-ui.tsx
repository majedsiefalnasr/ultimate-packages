import * as React from "react";
import { useComponentBase, useScrollLock, useZIndex } from "@ultimate/react-core";
import { blockUiStyleModule } from "./block-ui-style";

export interface UBlockUIProps {
  blocked?: boolean;
  autoZIndex?: boolean;
  baseZIndex?: number;
  fullScreen?: boolean;
  onBlocked?: () => void;
  onUnblocked?: () => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

let instanceCount = 0;

/**
 * Ultimate-owned adaptation of PrimeReact's `BlockUI` component (real
 * source: `components/lib/blockui/BlockUI.js`). Confirmed against real
 * source: `blocked` is a plain visibility-toggle prop (drives internal
 * `visibleState`/mask rendering via `useUpdateEffect`), not a form control
 * — no controlled-input/`onChange` value contract in any of the 3 real
 * sources; it is architecturally a mask-overlay toggle. Renders a mask over
 * its own children (real source's `target` "block another element" mode is
 * excluded here, same "smaller surface than upstream" precedent as every
 * sibling component).
 *
 * When `fullScreen` is set, blocks the whole viewport and registers a body-
 * scroll lock via `react-core`'s already-Built `useScrollLock` (the same
 * mechanism `UDialog` already uses).
 */
export const UBlockUI = React.forwardRef<HTMLDivElement, UBlockUIProps>(function UBlockUI(
  {
    blocked = false,
    autoZIndex = true,
    baseZIndex = 0,
    fullScreen = false,
    onBlocked,
    onUnblocked,
    children,
    className,
    style,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "block-ui", styleModule: blockUiStyleModule });
  const { register, unregister } = useScrollLock();
  const { set: setZIndex, clear: clearZIndex } = useZIndex();
  const maskRef = React.useRef<HTMLDivElement | null>(null);
  const lockIdRef = React.useRef(`u-block-ui-${++instanceCount}`);
  const wasBlockedRef = React.useRef(false);

  React.useEffect(() => {
    if (blocked === wasBlockedRef.current) {
      return;
    }
    wasBlockedRef.current = blocked;

    if (blocked) {
      if (fullScreen) {
        register(lockIdRef.current);
      }
      if (autoZIndex) {
        setZIndex("modal", maskRef.current, baseZIndex);
      }
      onBlocked?.();
    } else {
      if (fullScreen) {
        unregister(lockIdRef.current);
      }
      clearZIndex(maskRef.current);
      onUnblocked?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked]);

  React.useEffect(() => {
    const lockId = lockIdRef.current;
    return () => {
      if (wasBlockedRef.current && fullScreen) {
        unregister(lockId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={ref}
      aria-busy={blocked}
      className={[cx("root"), className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
      {blocked && <div ref={maskRef} className={cx("mask", { fullScreen })} />}
    </div>
  );
});
