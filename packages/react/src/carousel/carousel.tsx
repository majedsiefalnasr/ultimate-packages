import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { carouselStyleModule } from "./carousel-style";

export interface UCarouselPageEvent {
  page: number;
}

export interface UCarouselProps<T> {
  value: T[];
  itemTemplate: (item: T, index: number) => React.ReactNode;
  numVisible?: number;
  numScroll?: number;
  circular?: boolean;
  showIndicators?: boolean;
  showNavigators?: boolean;
  /** Time in milliseconds to scroll items automatically. Zero disables autoplay. */
  autoplayInterval?: number;
  orientation?: "horizontal" | "vertical";
  page?: number;
  onPageChange?: (event: UCarouselPageEvent) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Carousel` component (real
 * source: `components/lib/carousel/Carousel.js`). Confirmed against real
 * source: Carousel's real interaction structure is index/page-based
 * sliding via a CSS `transform: translate3d(...)` on an item-list
 * container, `numVisible`/`numScroll` window sizing, prev/next navigation
 * buttons, clickable indicator dots, and an optional `autoplayInterval`
 * timer — real source additionally clones boundary items to fake a
 * seamless infinite-loop illusion, and handles touch swipe; both are
 * excluded here, same "smaller surface than upstream" precedent as every
 * sibling component (see `UCarousel`'s Angular twin for the fuller
 * proof-by-exception note — identical finding, same resolution, applied
 * per-framework). Circular wraparound uses index math instead of DOM
 * cloning.
 *
 * Supports controlled (`page`/`onPageChange`) and uncontrolled usage,
 * matching this project's established controlled/uncontrolled duality
 * convention (see `UAccordion`).
 */
export function UCarousel<T>({
  value,
  itemTemplate,
  numVisible = 1,
  numScroll = 1,
  circular = false,
  showIndicators = true,
  showNavigators = true,
  autoplayInterval = 0,
  orientation = "horizontal",
  page: controlledPage,
  onPageChange,
  className,
}: UCarouselProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "carousel", styleModule: carouselStyleModule });
  const [internalPage, setInternalPage] = React.useState(0);
  const isControlled = controlledPage !== undefined;
  const page = isControlled ? controlledPage : internalPage;
  const isVertical = orientation === "vertical";

  const totalPages =
    value.length === 0 ? 0 : Math.ceil((value.length - numVisible) / numScroll) + 1;

  const goToPage = React.useCallback(
    (index: number) => {
      if (totalPages === 0 || index < 0 || index >= totalPages || index === page) {
        return;
      }
      if (!isControlled) setInternalPage(index);
      onPageChange?.({ page: index });
    },
    [totalPages, page, isControlled, onPageChange]
  );

  const navForward = () => {
    if (totalPages === 0) return;
    if (page < totalPages - 1) {
      goToPage(page + 1);
    } else if (circular) {
      goToPage(0);
    }
  };

  const navBackward = () => {
    if (totalPages === 0) return;
    if (page > 0) {
      goToPage(page - 1);
    } else if (circular) {
      goToPage(totalPages - 1);
    }
  };

  React.useEffect(() => {
    if (!autoplayInterval || autoplayInterval <= 0) return;
    const id = setInterval(() => {
      if (totalPages === 0) return;
      const next = page >= totalPages - 1 ? 0 : page + 1;
      goToPage(next);
    }, autoplayInterval);
    return () => clearInterval(id);
  }, [autoplayInterval, totalPages, page, goToPage]);

  const isForwardDisabled = value.length === 0 || (page >= totalPages - 1 && !circular);
  const isBackwardDisabled = value.length === 0 || (page <= 0 && !circular);

  const shift = page * numScroll * (100 / numVisible);
  const translate = isVertical ? `translate3d(0, -${shift}%, 0)` : `translate3d(-${shift}%, 0, 0)`;

  const isItemVisible = (index: number) => {
    const first = page * numScroll;
    const last = first + numVisible - 1;
    return index >= first && index <= last;
  };

  return (
    <div
      role="region"
      className={[cx("root", { vertical: isVertical }), className].filter(Boolean).join(" ")}
    >
      <div
        className={cx("content")}
        data-u-carousel-content
        aria-live={autoplayInterval > 0 ? "polite" : "off"}
      >
        <div className={cx("contentInner")}>
          {showNavigators && (
            <button
              type="button"
              className={cx("prevButton")}
              aria-label="Previous"
              disabled={isBackwardDisabled}
              onClick={navBackward}
            >
              ‹
            </button>
          )}
          <div className={cx("viewport")}>
            <div className={cx("itemList")} style={{ transform: translate }}>
              {value.map((item, index) => (
                <div
                  key={index}
                  className={cx("item")}
                  style={{ flex: `0 0 ${100 / numVisible}%` }}
                  role="group"
                  aria-hidden={!isItemVisible(index)}
                >
                  {itemTemplate(item, index)}
                </div>
              ))}
            </div>
          </div>
          {showNavigators && (
            <button
              type="button"
              className={cx("nextButton")}
              aria-label="Next"
              disabled={isForwardDisabled}
              onClick={navForward}
            >
              ›
            </button>
          )}
        </div>
        {showIndicators && (
          <ul className={cx("indicatorList")}>
            {Array.from({ length: Math.max(totalPages, 0) }).map((_, index) => (
              <li
                key={index}
                className={cx("indicator", { active: index === page })}
                data-p-active={index === page}
              >
                <button
                  type="button"
                  className={cx("indicatorButton")}
                  aria-label={`Page ${index + 1}`}
                  aria-current={index === page ? "page" : undefined}
                  onClick={() => goToPage(index)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
