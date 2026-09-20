import * as React from "react";
import { useComponentBase, Portal, FocusTrap, UTimesIcon } from "@ultimate/react-core";
import { galleriaStyleModule } from "./galleria-style";

export interface UGalleriaProps<T> {
  value: T[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  itemTemplate: (item: T) => React.ReactNode;
  thumbnailTemplate?: (item: T) => React.ReactNode;
  showItemNavigators?: boolean;
  showThumbnails?: boolean;
  circular?: boolean;
  /** Time in milliseconds to scroll items automatically. Zero disables autoplay. */
  autoplayInterval?: number;
  /** When true, renders the Galleria as a fullscreen-toggleable overlay. */
  fullScreen?: boolean;
  /** Controls the fullscreen overlay's open state (controlled usage). */
  fullScreenActive?: boolean;
  onFullScreenActiveChange?: (active: boolean) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Galleria` component (real
 * source: `components/lib/galleria/Galleria.js` + `GalleriaItem.js` +
 * `GalleriaThumbnails.js`). Confirmed against real source: real Galleria
 * is genuinely a multi-file family with `responsiveOptions`-driven
 * per-instance breakpoint state, touch/swipe gesture handling on the
 * thumbnail strip, a separate indicator-dot facet, and a `Portal`-
 * teleported fullscreen mask with `CSSTransition` enter/leave animation.
 *
 * Per this batch's established Carousel precedent (same finding,
 * resolved the same way): this port reduces the family to a single
 * component with a main-item viewport (prev/next navigation, index-math
 * circular wraparound instead of real source's DOM-cloning illusion), an
 * optional click-to-select thumbnail strip, and an optional
 * `autoplayInterval`-driven `setInterval` timer. Deliberately excludes
 * `responsiveOptions`/dynamic breakpoint state, touch/swipe gestures,
 * separate indicator dots, and per-item caption facets — same "smaller
 * surface than upstream" precedent as every sibling component
 * (Carousel/Fieldset). `itemTemplate`/`thumbnailTemplate` are render-prop
 * functions rather than real source's `template`/JSX-children facet,
 * matching this port's own smaller, explicit surface.
 *
 * Supports controlled (`fullScreenActive`/`onFullScreenActiveChange`) and
 * uncontrolled fullscreen-open state, matching this project's established
 * controlled/uncontrolled duality convention (see `UCarousel`). Fullscreen
 * mode composes `Portal`+`FocusTrap` directly, mirroring `UImage`'s own
 * established overlay wiring in this same sub-batch — simple mask, no
 * motion, no Escape-registry priority (fullscreen toggle is local/
 * controlled boolean state, not a stacked overlay requiring cross-instance
 * Escape-priority arbitration, unlike Dialog/Image's modal preview).
 */
export function UGalleria<T>({
  value,
  activeIndex: activeIndexProp = 0,
  onActiveIndexChange,
  itemTemplate,
  thumbnailTemplate,
  showItemNavigators = true,
  showThumbnails = true,
  circular = false,
  autoplayInterval = 0,
  fullScreen = false,
  fullScreenActive: controlledFullScreenActive,
  onFullScreenActiveChange,
  className,
}: UGalleriaProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "galleria", styleModule: galleriaStyleModule });
  const [internalActiveIndex, setInternalActiveIndex] = React.useState(activeIndexProp);
  const isActiveIndexControlled = onActiveIndexChange !== undefined && activeIndexProp !== undefined;
  const activeIndex = isActiveIndexControlled ? activeIndexProp : internalActiveIndex;
  const [internalFullScreenActive, setInternalFullScreenActive] = React.useState(false);
  const isFullScreenControlled = controlledFullScreenActive !== undefined;
  const fullScreenActive = isFullScreenControlled ? controlledFullScreenActive : internalFullScreenActive;
  const intervalRef = React.useRef<ReturnType<typeof setInterval>>();

  const stopAutoplay = React.useCallback(() => {
    if (intervalRef.current !== undefined) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const goTo = React.useCallback(
    (index: number) => {
      const total = value.length;
      if (total === 0 || index < 0 || index >= total) return;
      if (!isActiveIndexControlled) setInternalActiveIndex(index);
      onActiveIndexChange?.(index);
    },
    [value.length, isActiveIndexControlled, onActiveIndexChange]
  );

  React.useEffect(() => {
    if (autoplayInterval <= 0) return undefined;
    intervalRef.current = setInterval(() => {
      const total = value.length;
      if (total === 0) return;
      const next = activeIndex >= total - 1 ? 0 : activeIndex + 1;
      goTo(next);
    }, autoplayInterval);
    return stopAutoplay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayInterval, activeIndex, value.length]);

  const setFullScreenActive = (next: boolean) => {
    if (!isFullScreenControlled) setInternalFullScreenActive(next);
    onFullScreenActiveChange?.(next);
  };

  const navForward = () => {
    const total = value.length;
    if (total === 0) return;
    if (activeIndex < total - 1) goTo(activeIndex + 1);
    else if (circular) goTo(0);
    stopAutoplay();
  };

  const navBackward = () => {
    const total = value.length;
    if (total === 0) return;
    if (activeIndex > 0) goTo(activeIndex - 1);
    else if (circular) goTo(total - 1);
    stopAutoplay();
  };

  const isForwardDisabled = value.length === 0 || (activeIndex >= value.length - 1 && !circular);
  const isBackwardDisabled = value.length === 0 || (activeIndex <= 0 && !circular);
  const activeItem = value[activeIndex];

  const content = (
    <>
      <div className={cx("itemWrapper")}>
        {showItemNavigators && value.length > 1 && (
          <button
            type="button"
            className={cx("prevButton")}
            disabled={isBackwardDisabled}
            onClick={navBackward}
            aria-label="Previous"
          >
            &lsaquo;
          </button>
        )}
        <div className={cx("itemContainer")}>{activeItem !== undefined && itemTemplate(activeItem)}</div>
        {showItemNavigators && value.length > 1 && (
          <button
            type="button"
            className={cx("nextButton")}
            disabled={isForwardDisabled}
            onClick={navForward}
            aria-label="Next"
          >
            &rsaquo;
          </button>
        )}
      </div>
      {showThumbnails && value.length > 1 && (
        <ul className={cx("thumbnailList")}>
          {value.map((item, index) => (
            <li
              key={index}
              className={cx("thumbnailItem", { active: index === activeIndex })}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => goTo(index)}
            >
              {(thumbnailTemplate ?? itemTemplate)(item)}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <>
      {!(fullScreen && fullScreenActive) && (
        <div className={[cx("root"), className].filter(Boolean).join(" ")}>{content}</div>
      )}
      {fullScreen && fullScreenActive && (
        <Portal
          visible
          element={
            <div className={cx("mask")} role="dialog">
              <FocusTrap autoFocus>
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                  <button
                    type="button"
                    className={cx("closeButton")}
                    aria-label="Close"
                    onClick={() => setFullScreenActive(false)}
                  >
                    <UTimesIcon />
                  </button>
                  {content}
                </div>
              </FocusTrap>
            </div>
          }
        />
      )}
    </>
  );
}
