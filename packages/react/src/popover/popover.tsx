import * as React from "react";
import {
  useComponentBase,
  Portal,
  useOverlayListener,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  useZIndex,
} from "@ultimate/react-core";
import { popoverStyleModule } from "./popover-style";

export interface UPopoverProps {
  /** Whether clicking outside hides the overlay. */
  dismissable?: boolean;
  /** Callback to invoke when the overlay becomes visible. */
  onShow?: () => void;
  /** Callback to invoke when the overlay is hidden. */
  onHide?: () => void;
  children?: React.ReactNode;
}

export interface UPopoverHandle {
  toggle: (event: React.SyntheticEvent, target?: HTMLElement) => void;
  show: (event: React.SyntheticEvent, target?: HTMLElement) => void;
  hide: () => void;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `OverlayPanel` component (real
 * source names it `OverlayPanel`, `packages/lib/overlaypanel/OverlayPanel.js`
 * — the same capability PrimeNG/PrimeVue name `Popover`, confirmed via this
 * task's own Angular/Vue source reads). Confirmed against real source: an
 * imperatively-controlled overlay (`toggle`/`show`/`hide`, exposed via
 * `useImperativeHandle`, not a data-bound `visible` prop) rendered through
 * `Portal`, positioned next to a `target` element, dismissed on outside
 * click/Escape/resize.
 *
 * This port keeps that same real imperative-ref API, composing
 * `react-core`'s already-Built `Portal`/`useOverlayListener`/
 * `useGlobalEscapeKey`/`useZIndex` the same way `UMenu`
 * (`packages/react/src/menu/menu.tsx`) already does for its own popup mode,
 * and positions the panel with a `getBoundingClientRect()`-based placement
 * (simpler than porting upstream's full `DomHandler.absolutePosition()`/
 * flip algorithm — KISS, matching every sibling component's "smaller
 * surface than upstream" precedent).
 */
export const UPopover = React.forwardRef<UPopoverHandle, UPopoverProps>(function UPopover(
  { dismissable = true, onShow, onHide, children },
  ref
) {
  const { cx } = useComponentBase({ componentName: "popover", styleModule: popoverStyleModule });
  const [visible, setVisible] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const targetRef = React.useRef<HTMLElement | null>(null);
  const { set: setZIndex, clear: clearZIndex } = useZIndex();

  const isCloseOnEscape = visible;
  const displayOrder = useDisplayOrder("overlay-panel", isCloseOnEscape);

  const hide = React.useCallback(() => {
    setVisible(false);
    onHide?.();
  }, [onHide]);

  const align = React.useCallback(() => {
    const content = contentRef.current;
    const target = targetRef.current;
    if (!content || !target) return;
    const rect = target.getBoundingClientRect();
    content.style.top = `${rect.bottom + window.scrollY}px`;
    content.style.left = `${rect.left + window.scrollX}px`;
    setZIndex("overlay", content, undefined);
  }, [setZIndex]);

  const show = React.useCallback(
    (event: React.SyntheticEvent, target?: HTMLElement) => {
      event.stopPropagation();
      targetRef.current = target ?? (event.currentTarget as HTMLElement) ?? (event.target as HTMLElement);
      setVisible(true);
      onShow?.();
    },
    [onShow]
  );

  const toggle = React.useCallback(
    (event: React.SyntheticEvent, target?: HTMLElement) => {
      if (visible) hide();
      else show(event, target);
    },
    [visible, hide, show]
  );

  React.useImperativeHandle(ref, () => ({ toggle, show, hide }));

  React.useEffect(() => {
    if (visible) align();
    return () => {
      if (!visible) clearZIndex(contentRef.current);
    };
  }, [visible, align, clearZIndex]);

  useGlobalEscapeKey({
    callback: () => hide(),
    when: isCloseOnEscape,
    priority: [ESCAPE_PRIORITIES.OVERLAY_PANEL, displayOrder],
  });

  const onOverlayEvent = React.useCallback(
    (_event: Event, meta: { valid: boolean; type: string }) => {
      if (!meta.valid) return;
      if (meta.type === "resize" || dismissable) hide();
    },
    [dismissable, hide]
  );

  const [bindOverlay, unbindOverlay] = useOverlayListener({
    target: targetRef as React.RefObject<HTMLElement>,
    overlay: contentRef,
    listener: onOverlayEvent,
    when: visible,
  });

  React.useEffect(() => {
    if (visible) bindOverlay();
    return unbindOverlay;
  }, [visible, bindOverlay, unbindOverlay]);

  if (!visible) return null;

  return (
    <Portal
      visible
      element={
        <div ref={contentRef} className={cx("root")} role="dialog" aria-modal={visible}>
          <div className={cx("content")}>{children}</div>
        </div>
      }
    />
  );
});
