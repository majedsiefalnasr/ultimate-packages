import * as React from "react";
import { useComponentBase, useZIndex } from "@ultimate/react-core";
import { UButton } from "../button";
import { scrollTopStyleModule } from "./scroll-top-style";

export interface UScrollTopProps {
  target?: "window" | "parent";
  threshold?: number;
  behavior?: "auto" | "smooth";
  buttonAriaLabel?: string;
  onShow?: () => void;
  onHide?: () => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `ScrollTop` component (real
 * source: `components/lib/scrolltop/ScrollTop.js`). Confirmed against real
 * source (all 3 frameworks): extends the bare `ComponentBase` tier (no
 * CVA). Composes `Button`, matching this batch's own `UButton` composition
 * precedent from `USplitButton`/`UPanel`. Real source's own `target` option
 * (`'window' | 'parent'`) is honored — `'window'` tracks the document's own
 * scroll position, `'parent'` tracks this component's own rendered parent
 * element's scroll position, both toggling visibility once past
 * `threshold`, using `react-core`'s already-Built `useZIndex` for the
 * overlay layer (same tier `UBlockUI` already uses).
 *
 * Deliberately excludes real source's `CSSTransition`-driven show/hide
 * animation (plain conditional render instead, no enter/leave animation)
 * and its icon render-prop override — same "smaller surface than upstream"
 * precedent as every sibling component.
 */
export const UScrollTop = React.forwardRef<HTMLButtonElement, UScrollTopProps>(function UScrollTop(
  {
    target = "window",
    threshold = 400,
    behavior = "smooth",
    buttonAriaLabel = "Scroll to top",
    onShow,
    onHide,
    className,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "scroll-top", styleModule: scrollTopStyleModule });
  const { set: setZIndex, clear: clearZIndex } = useZIndex();
  const [visible, setVisible] = React.useState(false);
  const helperRef = React.useRef<HTMLSpanElement>(null);
  const buttonElRef = React.useRef<HTMLButtonElement | null>(null);
  const wasVisibleRef = React.useRef(false);

  const setRefs = React.useCallback(
    (node: HTMLButtonElement | null) => {
      buttonElRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    },
    [ref]
  );

  React.useEffect(() => {
    const scrollTarget = target === "window" ? window : helperRef.current?.parentElement;
    if (!scrollTarget) return;

    const checkVisibility = () => {
      const scrollY =
        target === "window"
          ? window.pageYOffset || document.documentElement.scrollTop
          : (helperRef.current?.parentElement?.scrollTop ?? 0);
      setVisible(scrollY > threshold);
    };

    scrollTarget.addEventListener("scroll", checkVisibility);
    return () => scrollTarget.removeEventListener("scroll", checkVisibility);
  }, [target, threshold]);

  React.useEffect(() => {
    if (visible === wasVisibleRef.current) return;
    wasVisibleRef.current = visible;

    if (visible) {
      if (buttonElRef.current) setZIndex("overlay", buttonElRef.current, 0);
      onShow?.();
    } else {
      if (buttonElRef.current) clearZIndex(buttonElRef.current);
      onHide?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const onClick = () => {
    const scrollElement = target === "window" ? window : helperRef.current?.parentElement;
    scrollElement?.scroll({ top: 0, behavior });
  };

  return (
    <>
      {visible && (
        <UButton
          ref={setRefs}
          className={[cx("root", { target }), className].filter(Boolean).join(" ")}
          rounded
          type="button"
          aria-label={buttonAriaLabel}
          icon={<i className="pi pi-chevron-up" />}
          onClick={onClick}
        />
      )}
      {target === "parent" && <span ref={helperRef} style={{ display: "none" }} />}
    </>
  );
});
