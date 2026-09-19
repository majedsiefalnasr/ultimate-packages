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
  { activeIndex: activeIndexProp, onTabChange, tabIndex = 0, children, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "tabs", styleModule: tabsStyleModule });
  const [activeIndexState, setActiveIndexState] = React.useState(activeIndexProp ?? 0);
  const activeIndex = onTabChange ? (activeIndexProp ?? 0) : activeIndexState;
  const headerRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const panels = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<UTabPanelProps> => React.isValidElement(child) && child.type === UTabPanel
  );

  const changeActiveIndex = (event: React.SyntheticEvent, index: number) => {
    if (panels[index]?.props.disabled) return;
    if (onTabChange) {
      onTabChange({ originalEvent: event, index });
    } else {
      setActiveIndexState(index);
    }
  };

  const eligibleIndices = panels.reduce<number[]>((acc, panel, index) => {
    if (!panel.props.disabled) acc.push(index);
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
        const prev = prevCandidates.length ? prevCandidates[prevCandidates.length - 1] : eligibleIndices[eligibleIndices.length - 1];
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
      <ul className={cx("tabViewNav")} role="tablist">
        {panels.map((panel, index) => {
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
            </li>
          );
        })}
      </ul>
      <div className={cx("tabViewPanels")}>
        {panels.map((panel, index) => {
          const selected = index === activeIndex;
          return (
            <div key={index} className={cx("tabViewPanel", { selected })} role="tabpanel" data-u-hidden={!selected} hidden={!selected}>
              {panel.props.children}
            </div>
          );
        })}
      </div>
    </div>
  );
});
