import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { scrollPanelStyleModule } from "./scroll-panel-style";

export interface UScrollPanelProps {
  step?: number;
  className?: string;
  children?: React.ReactNode;
}

export interface UScrollPanelHandle {
  refresh: () => void;
  scrollTop: (value: number) => void;
}

let uid = 0;

/**
 * Ultimate-owned adaptation of PrimeReact's `ScrollPanel` component (real
 * source: `components/lib/scrollpanel/ScrollPanel.js`). Confirmed against
 * real source (all 3 frameworks): extends the bare `ComponentBase` tier
 * (no CVA) — a cross-browser custom scrollbar. Real source's own mechanism
 * is faithfully ported: the native content `<div>` scrolls normally (with
 * its native scrollbar hidden via CSS), while two absolutely-positioned
 * "thumb" bars (`barX`/`barY`) mirror the native scroll position/ratio,
 * sized proportionally and repositioned on every `scroll`/`resize`/
 * `mouseenter` event via `requestAnimationFrame`. Both thumbs support
 * drag-to-scroll and keyboard stepping (arrow keys while a thumb has
 * focus, matching real source's own `step` prop and repeat-on-hold timer).
 *
 * Deliberately excludes real source's touch-drag support (mouse events
 * only, matching this session's disclosed "cut touch-drag if out of
 * scope" allowance for ScrollPanel) and RTL inset-mirroring nuance beyond
 * plain `inset-inline-*` CSS logical properties — same "smaller surface
 * than upstream" precedent as every sibling component.
 */
export const UScrollPanel = React.forwardRef<UScrollPanelHandle, UScrollPanelProps>(
  function UScrollPanel({ step = 5, className, children }, ref) {
    const { cx } = useComponentBase({ componentName: "scroll-panel", styleModule: scrollPanelStyleModule });

    const containerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const xBarRef = React.useRef<HTMLDivElement>(null);
    const yBarRef = React.useRef<HTMLDivElement>(null);

    const [lastScrollLeft, setLastScrollLeft] = React.useState(0);
    const [lastScrollTop, setLastScrollTop] = React.useState(0);
    const [orientation, setOrientation] = React.useState<"horizontal" | "vertical">("vertical");

    const isXBarClicked = React.useRef(false);
    const isYBarClicked = React.useRef(false);
    const lastPageX = React.useRef(0);
    const lastPageY = React.useRef(0);
    const scrollXRatio = React.useRef(0);
    const scrollYRatio = React.useRef(0);
    const frame = React.useRef<number>();
    const timer = React.useRef<ReturnType<typeof setTimeout>>();
    const orientationRef = React.useRef(orientation);
    orientationRef.current = orientation;

    const idRef = React.useRef<string>();
    if (!idRef.current) idRef.current = `u_scroll_panel_${++uid}`;
    const contentId = `${idRef.current}_content`;

    const moveBar = React.useCallback(() => {
      const container = containerRef.current;
      const content = contentRef.current;
      const xBar = xBarRef.current;
      const yBar = yBarRef.current;
      if (!container || !content || !xBar || !yBar) return;

      const totalWidth = content.scrollWidth;
      const ownWidth = content.clientWidth;
      const bottom = (container.clientHeight - xBar.clientHeight) * -1;
      scrollXRatio.current = ownWidth / totalWidth;

      const totalHeight = content.scrollHeight;
      const ownHeight = content.clientHeight;
      const right = (container.clientWidth - yBar.clientWidth) * -1;
      scrollYRatio.current = ownHeight / totalHeight;

      frame.current = window.requestAnimationFrame(() => {
        if (scrollXRatio.current >= 1) {
          xBar.classList.add("u-scroll-panel-bar-hidden");
        } else {
          xBar.classList.remove("u-scroll-panel-bar-hidden");
          const xBarWidth = Math.max(scrollXRatio.current * 100, 10);
          const xBarLeft = Math.abs((content.scrollLeft * (100 - xBarWidth)) / (totalWidth - ownWidth || 1));
          xBar.style.cssText = `width:${xBarWidth}%; inset-inline-start:${xBarLeft}%; bottom:${bottom}px;`;
        }

        if (scrollYRatio.current >= 1) {
          yBar.classList.add("u-scroll-panel-bar-hidden");
        } else {
          yBar.classList.remove("u-scroll-panel-bar-hidden");
          const yBarHeight = Math.max(scrollYRatio.current * 100, 10);
          const yBarTop = (content.scrollTop * (100 - yBarHeight)) / (totalHeight - ownHeight || 1);
          yBar.style.cssText = `height:${yBarHeight}%; top: calc(${yBarTop}% - ${xBar.clientHeight}px); inset-inline-end:${right}px;`;
        }
      });
    }, []);

    const clearTimer = () => {
      if (timer.current) clearTimeout(timer.current);
    };

    const repeat = (bar: "scrollTop" | "scrollLeft", stepValue: number) => {
      if (contentRef.current) contentRef.current[bar] += stepValue;
      moveBar();
    };

    const setTimer = (bar: "scrollTop" | "scrollLeft", stepValue: number) => {
      clearTimer();
      timer.current = setTimeout(() => repeat(bar, stepValue), 40);
    };

    const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      if (lastScrollLeft !== target.scrollLeft) {
        setLastScrollLeft(target.scrollLeft);
        setOrientation("horizontal");
      } else if (lastScrollTop !== target.scrollTop) {
        setLastScrollTop(target.scrollTop);
        setOrientation("vertical");
      }
      moveBar();
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
      if (orientationRef.current === "vertical") {
        switch (event.code) {
          case "ArrowDown":
            setTimer("scrollTop", step);
            event.preventDefault();
            break;
          case "ArrowUp":
            setTimer("scrollTop", step * -1);
            event.preventDefault();
            break;
          case "ArrowLeft":
          case "ArrowRight":
            event.preventDefault();
            break;
        }
      } else {
        switch (event.code) {
          case "ArrowRight":
            setTimer("scrollLeft", step);
            event.preventDefault();
            break;
          case "ArrowLeft":
            setTimer("scrollLeft", step * -1);
            event.preventDefault();
            break;
          case "ArrowDown":
          case "ArrowUp":
            event.preventDefault();
            break;
        }
      }
    };

    const onFocus = (event: React.FocusEvent) => {
      if (xBarRef.current?.isSameNode(event.target)) setOrientation("horizontal");
      else if (yBarRef.current?.isSameNode(event.target)) setOrientation("vertical");
    };

    const onBlur = () => {
      if (orientationRef.current === "horizontal") setOrientation("vertical");
    };

    const onDocumentMouseMove = React.useCallback((event: MouseEvent) => {
      if (isXBarClicked.current) {
        const deltaX = event.pageX - lastPageX.current;
        lastPageX.current = event.pageX;
        frame.current = window.requestAnimationFrame(() => {
          if (contentRef.current) contentRef.current.scrollLeft += deltaX / (scrollXRatio.current || 1);
        });
      } else if (isYBarClicked.current) {
        const deltaY = event.pageY - lastPageY.current;
        lastPageY.current = event.pageY;
        frame.current = window.requestAnimationFrame(() => {
          if (contentRef.current) contentRef.current.scrollTop += deltaY / (scrollYRatio.current || 1);
        });
      }
    }, []);

    const onDocumentMouseUp = React.useCallback(() => {
      yBarRef.current?.classList.remove("u-scroll-panel-bar-grabbed");
      xBarRef.current?.classList.remove("u-scroll-panel-bar-grabbed");
      document.body.classList.remove("u-scroll-panel-bar-grabbed");
      document.removeEventListener("mousemove", onDocumentMouseMove);
      document.removeEventListener("mouseup", onDocumentMouseUp);
      isXBarClicked.current = false;
      isYBarClicked.current = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const bindDocumentMouseListeners = () => {
      document.addEventListener("mousemove", onDocumentMouseMove);
      document.addEventListener("mouseup", onDocumentMouseUp);
    };

    const onYBarMouseDown = (event: React.MouseEvent) => {
      isYBarClicked.current = true;
      yBarRef.current?.focus();
      lastPageY.current = event.pageY;
      yBarRef.current?.classList.add("u-scroll-panel-bar-grabbed");
      document.body.classList.add("u-scroll-panel-bar-grabbed");
      bindDocumentMouseListeners();
      event.preventDefault();
    };

    const onXBarMouseDown = (event: React.MouseEvent) => {
      isXBarClicked.current = true;
      xBarRef.current?.focus();
      lastPageX.current = event.pageX;
      xBarRef.current?.classList.add("u-scroll-panel-bar-grabbed");
      document.body.classList.add("u-scroll-panel-bar-grabbed");
      bindDocumentMouseListeners();
      event.preventDefault();
    };

    React.useEffect(() => {
      moveBar();
      const onResize = () => moveBar();
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        document.removeEventListener("mousemove", onDocumentMouseMove);
        document.removeEventListener("mouseup", onDocumentMouseUp);
        if (frame.current) window.cancelAnimationFrame(frame.current);
        clearTimer();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useImperativeHandle(ref, () => ({
      refresh: moveBar,
      scrollTop: (value: number) => {
        const content = contentRef.current;
        if (!content) return;
        const scrollableHeight = content.scrollHeight - content.clientHeight;
        content.scrollTop = value > scrollableHeight ? scrollableHeight : Math.max(value, 0);
      },
    }));

    return (
      <div ref={containerRef} className={[cx("root"), className].filter(Boolean).join(" ")}>
        <div className={cx("contentContainer")}>
          <div ref={contentRef} className={cx("content")} onScroll={onScroll} onMouseEnter={moveBar}>
            {children}
          </div>
        </div>
        <div
          ref={xBarRef}
          className={cx("barX")}
          tabIndex={0}
          role="scrollbar"
          aria-orientation="horizontal"
          aria-valuenow={lastScrollLeft}
          aria-controls={contentId}
          onMouseDown={onXBarMouseDown}
          onKeyDown={onKeyDown}
          onKeyUp={clearTimer}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <div
          ref={yBarRef}
          className={cx("barY")}
          tabIndex={0}
          role="scrollbar"
          aria-orientation="vertical"
          aria-valuenow={lastScrollTop}
          aria-controls={contentId}
          onMouseDown={onYBarMouseDown}
          onKeyDown={onKeyDown}
          onKeyUp={clearTimer}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    );
  }
);
