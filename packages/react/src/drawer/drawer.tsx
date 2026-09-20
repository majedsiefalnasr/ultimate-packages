import * as React from "react";
import {
  useComponentBase,
  Portal,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  useZIndex,
  FocusTrap,
  useUpdateEffect,
  useUnmountEffect,
  UTimesIcon,
} from "@ultimate/react-core";
import { drawerStyleModule } from "./drawer-style";

export interface UDrawerProps {
  visible: boolean;
  onHide: (event?: React.SyntheticEvent) => void;
  header?: React.ReactNode;
  children?: React.ReactNode;
  position?: "left" | "right" | "top" | "bottom" | "full";
  modal?: boolean;
  dismissible?: boolean;
  closable?: boolean;
  closeOnEscape?: boolean;
  baseZIndex?: number;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Sidebar` component (real
 * source names it `Sidebar`, `components/lib/sidebar/Sidebar.js` — the same
 * capability PrimeNG/PrimeVue name `Drawer`). Confirmed against real
 * source: a data-bound `visible`/`onHide` prop pair (not imperative, unlike
 * `OverlayPanel`), a modal mask rendered through `Portal`, positioned at
 * one of `left`/`right`/`top`/`bottom`/`full` via CSS classes, dismissed on
 * mask click, Escape, and a close button.
 *
 * Composes `react-core`'s already-Built `Portal`/`FocusTrap`/
 * `useGlobalEscapeKey`/`useZIndex` the same way `UDialog`
 * (`packages/react/src/dialog/dialog.tsx`) already does. Deliberately
 * excludes upstream's `blockScroll` body-scroll-blocking and leave-motion
 * animation timing (a plain conditional render, no `useMotion`/`CSSTransition`
 * — matching this capability's spec-mandated surface, no `onAfterHide`
 * event in this task's Interfaces section to gate a deferred unmount on).
 */
export function UDrawer({
  visible,
  onHide,
  header,
  children,
  position = "left",
  modal = true,
  dismissible = true,
  closable = true,
  closeOnEscape = true,
  baseZIndex,
}: UDrawerProps): React.ReactNode {
  const { cx } = useComponentBase({ componentName: "drawer", styleModule: drawerStyleModule });
  const maskRef = React.useRef<HTMLDivElement>(null);
  const maskMouseDownTarget = React.useRef<EventTarget | null>(null);
  const { set: setZIndex, clear: clearZIndex } = useZIndex();
  const [portalReady, setPortalReady] = React.useState(false);

  const isCloseOnEscape = visible && closeOnEscape;
  const displayOrder = useDisplayOrder("sidebar", isCloseOnEscape);

  const onClose = (event?: React.SyntheticEvent) => onHide(event);

  useGlobalEscapeKey({
    callback: (event) => onClose(event as unknown as React.SyntheticEvent),
    when: isCloseOnEscape,
    priority: [ESCAPE_PRIORITIES.SIDEBAR, displayOrder],
  });

  useUpdateEffect(() => {
    if (visible) setZIndex("modal", maskRef.current, baseZIndex);
    else clearZIndex(maskRef.current);
  }, [visible, portalReady]);

  useUnmountEffect(() => {
    clearZIndex(maskRef.current);
  });

  if (!visible) return null;

  const closeButton = closable && (
    <button type="button" aria-label="Close" className={cx("closeButton")} onClick={onClose}>
      <UTimesIcon />
    </button>
  );

  const onMaskMouseDown = (event: React.MouseEvent) => {
    maskMouseDownTarget.current = event.target;
  };
  const onMaskMouseUp = (event: React.MouseEvent) => {
    if (
      dismissible &&
      modal &&
      event.target === event.currentTarget &&
      event.target === maskMouseDownTarget.current
    ) {
      onClose(event);
    }
  };

  const rootElement = (
    <div ref={maskRef} className={cx("mask")} onMouseDown={onMaskMouseDown} onMouseUp={onMaskMouseUp}>
      <FocusTrap>
        <div role="complementary" className={cx("root", { position })}>
          <div className={cx("header")}>
            {header !== undefined && <span className={cx("title")}>{header}</span>}
            {closeButton}
          </div>
          <div className={cx("content")}>{children}</div>
          <div className={cx("footer")}></div>
        </div>
      </FocusTrap>
    </div>
  );

  return <Portal element={rootElement} visible onMount={() => setPortalReady(true)} />;
}
