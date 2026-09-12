import * as React from "react";
import {
  useComponentBase,
  Portal,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  useZIndex,
  FocusTrap,
  useScrollLock,
  useMotion,
  useUpdateEffect,
  useUnmountEffect,
  UTimesIcon,
} from "@ultimate/react-core";
import { dialogStyleModule } from "./dialog-style";

export interface UDialogProps {
  visible: boolean;
  onHide: (event?: React.SyntheticEvent) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  modal?: boolean;
  closable?: boolean;
  showCloseIcon?: boolean;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
  blockScroll?: boolean;
  baseZIndex?: number;
  appendTo?: HTMLElement | (() => HTMLElement);
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  focusOnShow?: boolean;
}

export function UDialog({
  visible,
  onHide,
  header,
  footer,
  children,
  modal = true,
  closable = true,
  showCloseIcon = true,
  closeOnEscape = false,
  dismissableMask = false,
  blockScroll = false,
  baseZIndex,
  appendTo,
  className,
  style,
  id,
  focusOnShow = true,
}: UDialogProps): React.ReactNode {
  const { cx } = useComponentBase({ componentName: "dialog", styleModule: dialogStyleModule });
  const generatedDialogId = React.useId();
  const dialogId = id ?? generatedDialogId;
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const maskRef = React.useRef<HTMLDivElement>(null);
  const focusElementOnHide = React.useRef<HTMLElement | null>(null);
  const { set: setZIndex, clear: clearZIndex } = useZIndex();
  const { register: registerScrollLock, unregister: unregisterScrollLock } = useScrollLock();

  // Two-state mask/visible model, matching verified upstream Dialog.js (maskVisibleState /
  // visibleState + onExited). `containerVisible` gates mount/unmount and stays `true` through
  // the leave animation so useMotion's leave() has a real, attached DOM node to animate before
  // the dialog is torn down and focus is restored — a plain `if (!visible) return null` would
  // unmount synchronously and never give useMotion's leave phase a chance to run.
  const [containerVisible, setContainerVisible] = React.useState(visible);

  // Portal defers its first real DOM commit by one render pass (SSR-guard mount effect,
  // see portal.tsx). When `visible` is already `true` on this component's very first
  // render, the z-index/scroll-lock and motion effects below would run against a ref
  // that Portal hasn't attached to the DOM yet. `portalReady` flips true once Portal's
  // `onMount` callback confirms the portalled content actually committed, giving those
  // effects a signal to re-run after the ref is populated.
  const [portalReady, setPortalReady] = React.useState(false);

  const isCloseOnEscape = closable && closeOnEscape && visible;
  const displayOrder = useDisplayOrder("dialog", isCloseOnEscape);

  const onClose = (event?: React.SyntheticEvent) => {
    onHide(event);
  };

  useGlobalEscapeKey({
    callback: (event) => onClose(event as unknown as React.SyntheticEvent),
    when: isCloseOnEscape,
    priority: [ESCAPE_PRIORITIES.DIALOG, displayOrder],
  });

  useUpdateEffect(() => {
    if (visible) {
      focusElementOnHide.current = document.activeElement as HTMLElement | null;
      setContainerVisible(true);
    }
  }, [visible]);

  useUpdateEffect(() => {
    if (!containerVisible) return;

    if (visible) {
      setZIndex("modal", maskRef.current, baseZIndex);
      if (blockScroll) registerScrollLock(dialogId);
    }
    // The visible=false case (leave motion, z-index clear, scroll unlock, focus restore) is
    // handled by useMotion's onAfterLeave below, once the leave animation actually completes.
    // `portalReady` is included so this effect also re-runs once Portal's deferred first
    // commit actually attaches the DOM (mount-time-visible case, see portal.tsx/use-motion.ts)
    // — it adds one extra, already-stable dependency for the normal open/close case.
  }, [visible, containerVisible, portalReady]);

  useMotion(
    dialogRef,
    visible && containerVisible,
    {
      name: "u-dialog",
      onAfterLeave: () => {
        clearZIndex(maskRef.current);
        if (blockScroll) unregisterScrollLock(dialogId);
        setContainerVisible(false);
        // Portal fully unmounts whenever containerVisible goes false (the `if
        // (!containerVisible) return null` above removes it from the tree), so its next
        // mount will start with a fresh internal `mounted=false` again. Reset
        // `portalReady` here so the NEXT open's onMount callback produces a real
        // false→true transition instead of a same-value no-op that React would bail out
        // of — otherwise the z-index/scroll-lock/motion effects would silently no-op on
        // every open after the first (dialogRef.current is still null when they first
        // run post-open, same defect as Finding 1, just recurring instead of mount-only).
        setPortalReady(false);
        if (focusElementOnHide.current) {
          focusElementOnHide.current.focus();
          focusElementOnHide.current = null;
        }
      },
    },
    portalReady
  );

  useUnmountEffect(() => {
    clearZIndex(maskRef.current);
    if (blockScroll) unregisterScrollLock(dialogId);
  });

  if (!containerVisible) return null;

  const headerId = `${dialogId}_header`;
  const contentId = `${dialogId}_content`;

  const closeIcon = closable && showCloseIcon && (
    <button type="button" aria-label="Close" className={cx("closeButton")} onClick={onClose}>
      <UTimesIcon className={cx("closeButtonIcon")} />
    </button>
  );

  const onMaskPointerUp = (event: React.PointerEvent) => {
    if (dismissableMask && modal && maskRef.current === event.target) {
      onClose(event);
    }
  };

  const rootElement = (
    <div ref={maskRef} className={cx("mask")} onPointerUp={onMaskPointerUp}>
      <FocusTrap autoFocus={focusOnShow}>
        <div
          ref={dialogRef}
          id={dialogId}
          role="dialog"
          aria-modal={modal}
          aria-labelledby={headerId}
          aria-describedby={contentId}
          className={[cx("root"), className].filter(Boolean).join(" ")}
          style={style}
        >
          {header !== undefined && (
            <div className={cx("header")}>
              <div id={headerId} className={cx("headerTitle")}>
                {header}
              </div>
              <div className={cx("headerIcons")}>{closeIcon}</div>
            </div>
          )}
          <div id={contentId} className={cx("content")}>
            {children}
          </div>
          {footer !== undefined && <div className={cx("footer")}>{footer}</div>}
        </div>
      </FocusTrap>
    </div>
  );

  return (
    <Portal
      element={rootElement}
      appendTo={appendTo}
      visible
      onMount={() => setPortalReady(true)}
    />
  );
}
