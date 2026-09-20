import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { UButton } from "../button";
import { panelStyleModule } from "./panel-style";

export interface UPanelProps {
  header?: React.ReactNode;
  toggleable?: boolean;
  collapsed?: boolean;
  showHeader?: boolean;
  onToggle?: (event: { originalEvent: React.SyntheticEvent; value: boolean }) => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

let uid = 0;

/**
 * Ultimate-owned adaptation of PrimeReact's `Panel` component (real
 * source: `components/lib/panel/Panel.js`/`PanelBase.js`). Confirmed
 * against real source: extends the bare `ComponentBase` tier (no CVA) — a
 * container with header/content/footer regions and an optional content-
 * toggle feature, composing `Button` for its toggle affordance (matching
 * this batch's own `UButton` composition precedent from `USplitButton`).
 *
 * Uncontrolled by default (internal `collapsedState`), controlled when
 * `onToggle` is supplied — matching `UFieldset`'s own established
 * controlled/uncontrolled precedent in this codebase. Deliberately
 * excludes real source's `icons`/custom header/footer render-prop
 * overrides (only `header`/`footer` React-node props are offered) and its
 * `CSSTransition`-driven collapse animation — same "smaller surface than
 * upstream" precedent as every sibling component.
 */
export const UPanel = React.forwardRef<HTMLDivElement, UPanelProps>(function UPanel(
  {
    header,
    toggleable = false,
    collapsed: collapsedProp = false,
    showHeader = true,
    onToggle,
    footer,
    children,
    className,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "panel", styleModule: panelStyleModule });
  const [collapsedState, setCollapsedState] = React.useState(collapsedProp);
  const collapsed = onToggle ? collapsedProp : collapsedState;

  const idRef = React.useRef<string>();
  if (!idRef.current) {
    idRef.current = `u_panel_${++uid}`;
  }
  const headerId = `${idRef.current}_header`;
  const contentId = `${idRef.current}_content`;

  const toggle = (event: React.SyntheticEvent) => {
    const next = !collapsed;
    if (!onToggle) {
      setCollapsedState(next);
    }
    onToggle?.({ originalEvent: event, value: next });
  };

  return (
    <div ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")}>
      {showHeader && (
        <div className={cx("header", { toggleable })}>
          {header && (
            <span className={cx("title")} id={headerId}>
              {header}
            </span>
          )}
          <div className={cx("headerActions")}>
            {toggleable && (
              <UButton
                severity="secondary"
                text
                rounded
                type="button"
                aria-controls={contentId}
                aria-expanded={!collapsed}
                icon={<i className={collapsed ? "pi pi-plus" : "pi pi-minus"} />}
                onClick={toggle}
              />
            )}
          </div>
        </div>
      )}
      {(!toggleable || !collapsed) && (
        <div className={cx("contentContainer")} role="region" id={contentId} aria-labelledby={headerId}>
          <div className={cx("content")}>{children}</div>
          {footer && <div className={cx("footer")}>{footer}</div>}
        </div>
      )}
    </div>
  );
});
