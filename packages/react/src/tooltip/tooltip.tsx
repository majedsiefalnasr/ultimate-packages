import * as React from "react";
import {
  useComponentBase,
  Portal,
  useZIndex,
  useGlobalEscapeKey,
  useDisplayOrder,
  ESCAPE_PRIORITIES,
  useMountEffect,
  useUnmountEffect,
  useUpdateEffect,
} from "@ultimate/react-core";
import { tooltipStyleModule } from "./tooltip-style";

export interface UTooltipProps {
  target: React.RefObject<HTMLElement> | HTMLElement | string | string[];
  content?: React.ReactNode;
  position?: "right" | "left" | "top" | "bottom";
  event?: "hover" | "focus" | "both";
  showDelay?: number;
  hideDelay?: number;
  disabled?: boolean;
  closeOnEscape?: boolean;
  autoZIndex?: boolean;
  baseZIndex?: number;
  id?: string;
  className?: string;
}

function resolveTargetElement(target: UTooltipProps["target"]): HTMLElement | null {
  if (typeof target === "string") return document.querySelector<HTMLElement>(target);
  if (Array.isArray(target)) return document.querySelector<HTMLElement>(target[0]);
  if (target instanceof HTMLElement) return target;
  return target.current;
}

export function UTooltip({
  target,
  content,
  position = "right",
  event = "hover",
  showDelay = 0,
  hideDelay = 0,
  disabled = false,
  closeOnEscape = false,
  autoZIndex = true,
  baseZIndex,
  id,
  className,
}: UTooltipProps): React.ReactElement | null {
  const { cx } = useComponentBase({ componentName: "tooltip", styleModule: tooltipStyleModule });
  const { set: setZIndex, clear: clearZIndex } = useZIndex();
  const [visible, setVisible] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const targetElRef = React.useRef<HTMLElement | null>(null);
  const generatedPanelId = React.useId();
  const panelId = id ?? generatedPanelId;
  const showTimeout = React.useRef<ReturnType<typeof setTimeout>>();
  const hideTimeout = React.useRef<ReturnType<typeof setTimeout>>();

  const isCloseOnEscape = visible && closeOnEscape;
  const displayOrder = useDisplayOrder("tooltip", isCloseOnEscape);

  const hide = React.useCallback(() => {
    clearTimeout(showTimeout.current);
    hideTimeout.current = setTimeout(() => setVisible(false), hideDelay);
  }, [hideDelay]);

  useGlobalEscapeKey({
    callback: hide,
    when: isCloseOnEscape,
    priority: [ESCAPE_PRIORITIES.TOOLTIP, displayOrder],
  });

  const show = React.useCallback(() => {
    if (disabled || !content) return;
    clearTimeout(hideTimeout.current);
    showTimeout.current = setTimeout(() => setVisible(true), showDelay);
  }, [disabled, content, showDelay]);

  useMountEffect(() => {
    const el = resolveTargetElement(target);
    targetElRef.current = el;
    if (!el) return;

    const showEvents =
      event === "focus" ? ["focus"] : event === "both" ? ["focus", "mouseenter"] : ["mouseenter"];
    const hideEvents =
      event === "focus" ? ["blur"] : event === "both" ? ["blur", "mouseleave"] : ["mouseleave"];
    showEvents.forEach((e) => el.addEventListener(e, show));
    hideEvents.forEach((e) => el.addEventListener(e, hide));
  });

  useUnmountEffect(() => {
    const el = targetElRef.current;
    if (el) {
      ["mouseenter", "focus"].forEach((e) => el.removeEventListener(e, show));
      ["mouseleave", "blur"].forEach((e) => el.removeEventListener(e, hide));
    }
    clearTimeout(showTimeout.current);
    clearTimeout(hideTimeout.current);
    removeDescribedBy();
    clearZIndex(panelRef.current);
  });

  function addDescribedBy() {
    const el = targetElRef.current;
    if (!el) return;
    const existing = el.getAttribute("aria-describedby");
    const ids = existing ? existing.split(" ").filter(Boolean) : [];
    if (!ids.includes(panelId)) {
      el.setAttribute("aria-describedby", [...ids, panelId].join(" "));
    }
  }

  function removeDescribedBy() {
    const el = targetElRef.current;
    if (!el) return;
    const existing = el.getAttribute("aria-describedby");
    if (!existing) return;
    const remaining = existing
      .split(" ")
      .filter(Boolean)
      .filter((tokenId) => tokenId !== panelId);
    if (remaining.length > 0) {
      el.setAttribute("aria-describedby", remaining.join(" "));
    } else {
      el.removeAttribute("aria-describedby");
    }
  }

  useUpdateEffect(() => {
    if (visible) {
      addDescribedBy();
      if (autoZIndex) setZIndex("tooltip", panelRef.current, baseZIndex);
    } else {
      removeDescribedBy();
      clearZIndex(panelRef.current);
    }
  }, [visible]);

  if (!content) return null;

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      role="tooltip"
      aria-hidden={!visible}
      className={[cx("root", { position }), className].filter(Boolean).join(" ")}
    >
      <span className={cx("text")}>{content}</span>
    </div>
  );

  return <Portal element={panel} visible={visible} />;
}
