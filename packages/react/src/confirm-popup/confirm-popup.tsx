import * as React from "react";
import {
  useComponentBase,
  Portal,
  confirmationEventBus,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  useZIndex,
  useOverlayListener,
  type UConfirmationOptions,
} from "@ultimate/react-core";
import { UButton } from "../button/button";
import { confirmPopupStyleModule } from "./confirm-popup-style";

export interface UConfirmPopupProps {
  /** Matches only `confirmPopup()` calls carrying the same `group` (undefined matches undefined). */
  group?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `ConfirmPopup` component (real
 * source: `components/lib/confirmpopup/ConfirmPopup.js`). Confirmed
 * against real source: same service-driven mechanism as `ConfirmDialog` —
 * subscribes to `OverlayService`'s `confirm-popup` event, renders a small
 * overlay positioned relative to the request's `target` element (typically
 * the button that called `confirmPopup()`) rather than a modal dialog.
 *
 * This port keeps that same real mechanism, using this task's own
 * `confirmationEventBus`/`confirmPopup()` (`@ultimate/react-core`),
 * composing `react-core`'s already-Built `Portal`/`useOverlayListener`/
 * `useZIndex` the same way `UPopover` already does, and positioning
 * against `target` with a `getBoundingClientRect()`-based placement
 * (matching `UPopover`'s own established precedent — simpler than porting
 * upstream's full `DomHandler.absolutePosition()`/flip algorithm).
 * Dismissed on outside click, Escape, and window resize.
 */
export function UConfirmPopup({ group }: UConfirmPopupProps): React.ReactNode {
  const { cx } = useComponentBase({
    componentName: "confirm-popup",
    styleModule: confirmPopupStyleModule,
  });
  const [confirmation, setConfirmation] = React.useState<UConfirmationOptions | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { set: setZIndex, clear: clearZIndex } = useZIndex();

  const hide = React.useCallback(() => setConfirmation(null), []);

  React.useEffect(() => {
    const handler = (event: unknown) => {
      const options = event as UConfirmationOptions;
      if (options.visible === false) {
        hide();
        return;
      }
      if (options.group === group) {
        setConfirmation(options);
      }
    };
    confirmationEventBus.on("confirm-popup", handler);
    return () => confirmationEventBus.off("confirm-popup", handler);
  }, [group, hide]);

  const isCloseOnEscape = confirmation !== null;
  const displayOrder = useDisplayOrder("overlay-panel", isCloseOnEscape);

  const align = React.useCallback(() => {
    const content = contentRef.current;
    const target = confirmation?.target;
    if (!content || !target) return;
    const rect = target.getBoundingClientRect();
    content.style.top = `${rect.bottom + window.scrollY}px`;
    content.style.left = `${rect.left + window.scrollX}px`;
    setZIndex("overlay", content, undefined);
  }, [confirmation, setZIndex]);

  React.useEffect(() => {
    if (confirmation) align();
    return () => {
      if (!confirmation) clearZIndex(contentRef.current);
    };
  }, [confirmation, align, clearZIndex]);

  useGlobalEscapeKey({
    callback: () => onReject(),
    when: isCloseOnEscape,
    priority: [ESCAPE_PRIORITIES.OVERLAY_PANEL, displayOrder],
  });

  const targetRef = React.useRef<HTMLElement | null>(null);
  targetRef.current = confirmation?.target ?? null;

  const onOverlayEvent = React.useCallback(
    (_event: Event, meta: { valid: boolean; type: string }) => {
      if (meta.valid) hide();
    },
    [hide]
  );

  const [bindOverlay, unbindOverlay] = useOverlayListener({
    target: targetRef as React.RefObject<HTMLElement>,
    overlay: contentRef,
    listener: onOverlayEvent,
    when: confirmation !== null,
  });

  React.useEffect(() => {
    if (confirmation) bindOverlay();
    return unbindOverlay;
  }, [confirmation, bindOverlay, unbindOverlay]);

  const onAccept = () => {
    confirmation?.accept?.();
    confirmation?.target?.focus();
    hide();
  };

  const onReject = () => {
    confirmation?.reject?.();
    confirmation?.target?.focus();
    hide();
  };

  if (!confirmation) return null;

  return (
    <Portal
      visible
      element={
        <div ref={contentRef} className={cx("root")} role="alertdialog">
          <div className={cx("content")}>
            {confirmation.icon}
            <span className={cx("message")}>{confirmation.message}</span>
          </div>
          <div className={cx("footer")}>
            {confirmation.rejectVisible !== false && (
              <UButton
                label={confirmation.rejectLabel ?? "No"}
                severity="secondary"
                text
                onClick={onReject}
              />
            )}
            {confirmation.acceptVisible !== false && (
              <UButton label={confirmation.acceptLabel ?? "Yes"} onClick={onAccept} />
            )}
          </div>
        </div>
      }
    />
  );
}
