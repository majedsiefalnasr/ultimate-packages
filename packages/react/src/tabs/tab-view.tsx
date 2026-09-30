import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { tabsStyleModule } from "./tabs-style";
import { UTabPanel, type UTabPanelProps } from "./tab-panel";

export interface UTabViewProps {
  /** Index of the active tab. */
  activeIndex?: number;
  /** Callback invoked when the active tab changes (controlled mode). */
  onTabChange?: (event: { originalEvent: React.SyntheticEvent; index: number }) => void;
  /** Tabindex of the tab header buttons. */
  tabIndex?: number;
  /**
   * When `true`, the header strip scrolls horizontally and prev/next navigator
   * buttons render only while scrolling in that direction is possible.
   */
  scrollable?: boolean;
  /**
   * Called before a closable tab is closed; returning `false` cancels the
   * close. `index` is the tab's index among the panels.
   */
  onBeforeTabClose?: (event: { originalEvent: React.SyntheticEvent; index: number }) => boolean | void;
  /** Called after a closable tab has been closed. */
  onTabClose?: (event: { originalEvent: React.SyntheticEvent; index: number }) => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `TabView` component (see
 * `.vendor-extracted/react/tabview/TabView.js`). Renders a set of
 * `UTabPanel` children as header buttons + content panes, with
 * ArrowLeft/ArrowRight/Home/End keyboard roving-focus across headers —
 * real PrimeReact's own decomposition for this capability (`TabView` +
 * `TabPanel`, controlled via `activeIndex`/`onTabChange` when both are
 * supplied, else internally-managed state — matching real source's own
 * `props.onTabChange ? props.activeIndex : activeIndexState` pattern).
 */
export const UTabView = React.forwardRef<HTMLDivElement, UTabViewProps>(function UTabView(
  {
    activeIndex: activeIndexProp,
    onTabChange,
    tabIndex = 0,
    scrollable = false,
    onBeforeTabClose,
    onTabClose,
    children,
    className,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "tabs", styleModule: tabsStyleModule });
  const [activeIndexState, setActiveIndexState] = React.useState(activeIndexProp ?? 0);
  const activeIndex = onTabChange ? (activeIndexProp ?? 0) : activeIndexState;
  const headerRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const navContentRef = React.useRef<HTMLDivElement>(null);
  const [backwardDisabled, setBackwardDisabled] = React.useState(true);
  const [forwardDisabled, setForwardDisabled] = React.useState(false);

  // Mirrors PrimeReact 10.9.9 `updateButtonState`.
  const updateButtonState = () => {
    const content = navContentRef.current;
    if (!content) return;
    const { scrollLeft, scrollWidth, clientWidth } = content;
    setBackwardDisabled(scrollLeft === 0);
    setForwardDisabled(Math.trunc(scrollLeft) === scrollWidth - clientWidth);
  };

  // No dependency array: recalculated after every render, like PrimeReact.
  React.useEffect(() => {
    if (scrollable) updateButtonState();
  });

  // Mirrors PrimeReact `DomHandler.getWidth`: offsetWidth minus horizontal padding and border.
  const contentBoxWidth = (el: HTMLElement) => {
    const style = getComputedStyle(el);
    return (
      el.offsetWidth -
      (parseFloat(style.paddingLeft) +
        parseFloat(style.paddingRight) +
        parseFloat(style.borderLeftWidth) +
        parseFloat(style.borderRightWidth) || 0)
    );
  };

  // Buttons overlay the strip (absolute), so their widths are not part of content.clientWidth's free space.
  const visibleButtonsWidth = (content: HTMLDivElement) =>
    Array.from(
      content.parentElement?.querySelectorAll<HTMLElement>(".u-tabview-nav-btn") ?? []
    ).reduce((acc, el) => acc + contentBoxWidth(el), 0);

  const navBackward = () => {
    const content = navContentRef.current;
    if (!content) return;
    const width = content.clientWidth - visibleButtonsWidth(content);
    const pos = content.scrollLeft - width;
    content.scrollLeft = pos <= 0 ? 0 : pos;
  };

  const navForward = () => {
    const content = navContentRef.current;
    if (!content) return;
    const width = content.clientWidth - visibleButtonsWidth(content);
    const pos = content.scrollLeft + width;
    const lastPos = content.scrollWidth - width;
    content.scrollLeft = pos >= lastPos ? lastPos : pos;
  };

  const panels = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<UTabPanelProps> =>
      React.isValidElement(child) && child.type === UTabPanel
  );

  // Closed tabs are hidden in internal state, identified by the child's own
  // React key when it has one (toArray prefixes explicit keys with ".$"),
  // else by its original index. Indices stay the original panel indices.
  const [hiddenTabs, setHiddenTabs] = React.useState<(string | number)[]>([]);
  const tabId = (panel: React.ReactElement, index: number): string | number =>
    panel.key !== null && String(panel.key).startsWith(".$") ? panel.key : index;
  const isVisible = (index: number, hidden: (string | number)[] = hiddenTabs) =>
    !hidden.includes(tabId(panels[index], index));

  const changeActiveIndex = (event: React.SyntheticEvent, index: number) => {
    if (panels[index]?.props.disabled) return;
    if (onTabChange) {
      onTabChange({ originalEvent: event, index });
    } else {
      setActiveIndexState(index);
    }
  };

  // Mirrors PrimeReact `findVisibleActiveTab`: first enabled visible tab at or
  // after the closed index, else the nearest enabled visible one before it.
  const findVisibleActiveTab = (closedIndex: number, hidden: (string | number)[]) => {
    const candidates = panels
      .map((panel, index) => ({ panel, index }))
      .filter(({ panel, index }) => isVisible(index, hidden) && !panel.props.disabled);
    return (
      candidates.find(({ index }) => index >= closedIndex) ??
      candidates.reverse().find(({ index }) => closedIndex > index)
    );
  };

  const closeTab = (event: React.SyntheticEvent, index: number) => {
    event.preventDefault();
    if (onBeforeTabClose?.({ originalEvent: event, index }) === false) return;
    const hidden = [...hiddenTabs, tabId(panels[index], index)];
    setHiddenTabs(hidden);
    onTabClose?.({ originalEvent: event, index });
    const next = findVisibleActiveTab(index, hidden);
    if (next) changeActiveIndex(event, next.index);
  };

  const eligibleIndices = panels.reduce<number[]>((acc, panel, index) => {
    if (!panel.props.disabled && isVisible(index)) acc.push(index);
    return acc;
  }, []);

  const focusHeader = (index: number) => headerRefs.current[index]?.focus();

  const onHeaderKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowRight": {
        const next = eligibleIndices.find((i) => i > index) ?? eligibleIndices[0];
        focusHeader(next);
        event.preventDefault();
        break;
      }
      case "ArrowLeft": {
        const prevCandidates = eligibleIndices.filter((i) => i < index);
        const prev = prevCandidates.length
          ? prevCandidates[prevCandidates.length - 1]
          : eligibleIndices[eligibleIndices.length - 1];
        focusHeader(prev);
        event.preventDefault();
        break;
      }
      case "Home":
        focusHeader(eligibleIndices[0]);
        event.preventDefault();
        break;
      case "End":
        focusHeader(eligibleIndices[eligibleIndices.length - 1]);
        event.preventDefault();
        break;
      case "Enter":
      case " ":
        changeActiveIndex(event, index);
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  return (
    <div ref={ref} className={[cx("tabViewRoot"), className].filter(Boolean).join(" ")}>
      {(() => {
        const tabList = (
          <ul className={cx("tabViewNav")} role="tablist">
            {panels.map((panel, index) => {
              if (!isVisible(index)) return null;
              const selected = index === activeIndex;
              const disabled = !!panel.props.disabled;
              return (
                <li
                  key={index}
                  className={cx("tabViewHeader", { selected, disabled })}
                  role="tab"
                  aria-selected={selected}
                  aria-disabled={disabled}
                  data-u-disabled={disabled}
                >
                  <button
                    ref={(el) => {
                      headerRefs.current[index] = el;
                    }}
                    type="button"
                    className={cx("tabViewHeaderAction")}
                    disabled={disabled}
                    tabIndex={selected ? tabIndex : -1}
                    onClick={(event) => changeActiveIndex(event, index)}
                    onKeyDown={(event) => onHeaderKeyDown(event, index)}
                  >
                    {panel.props.header}
                  </button>
                  {panel.props.closable && (
                    <button
                      type="button"
                      className={cx("tabViewClose")}
                      aria-label="Close"
                      onClick={(event) => closeTab(event, index)}
                    >
                      {panel.props.closeIcon ?? <span aria-hidden="true">×</span>}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        );
        if (!scrollable) return tabList;
        return (
          <div className={cx("tabViewNavContainer")}>
            {!backwardDisabled && (
              <button
                type="button"
                className={cx("tabViewNavPrev")}
                aria-label="Previous Page"
                onClick={navBackward}
              >
                <span aria-hidden="true">‹</span>
              </button>
            )}
            <div
              ref={navContentRef}
              className={cx("tabViewNavContent")}
              onScroll={updateButtonState}
            >
              {tabList}
            </div>
            {!forwardDisabled && (
              <button
                type="button"
                className={cx("tabViewNavNext")}
                aria-label="Next Page"
                onClick={navForward}
              >
                <span aria-hidden="true">›</span>
              </button>
            )}
          </div>
        );
      })()}
      <div className={cx("tabViewPanels")}>
        {panels.map((panel, index) => {
          if (!isVisible(index)) return null;
          const selected = index === activeIndex;
          return (
            <div
              key={index}
              className={cx("tabViewPanel", { selected })}
              role="tabpanel"
              data-u-hidden={!selected}
              hidden={!selected}
            >
              {panel.props.children}
            </div>
          );
        })}
      </div>
    </div>
  );
});
