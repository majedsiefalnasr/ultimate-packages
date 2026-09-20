import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { fieldsetStyleModule } from "./fieldset-style";

export interface UFieldsetProps {
  legend?: React.ReactNode;
  toggleable?: boolean;
  collapsed?: boolean;
  onToggle?: (event: { originalEvent: React.SyntheticEvent; value: boolean }) => void;
  children?: React.ReactNode;
  className?: string;
}

let uid = 0;

/**
 * Ultimate-owned adaptation of PrimeReact's `Fieldset` component (real
 * source: `components/lib/fieldset/Fieldset.js`). A grouping component
 * with an optional `legend` heading and an optional content-toggle
 * feature — matching real source's own `legend`/`toggleable`/`collapsed`/
 * `onToggle` structural shape (uncontrolled by default, controlled when
 * `onToggle` is supplied, exactly matching real source's own
 * `props.onToggle ? props.collapsed : collapsedState` branch).
 *
 * Deliberately excludes real source's `CSSTransition`-driven collapse
 * animation and its `Ripple` directive on the toggle button — this port
 * toggles visibility via a plain conditional render, no enter/leave
 * animation. Real source's expand/collapse glyphs (`PlusIcon`/`MinusIcon`)
 * have no `@ultimate/react-core` equivalent yet (Vue's own icon set has a
 * `MinusIcon` but no `PlusIcon` — using it here would create an
 * inconsistent per-framework glyph choice) — plain `+`/`−` text glyphs are
 * used instead in all 3 frameworks, disclosed here rather than silently
 * substituted.
 */
export const UFieldset = React.forwardRef<HTMLFieldSetElement, UFieldsetProps>(function UFieldset(
  { legend, toggleable = false, collapsed: collapsedProp = false, onToggle, children, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "fieldset", styleModule: fieldsetStyleModule });
  const [collapsedState, setCollapsedState] = React.useState(collapsedProp);
  const collapsed = toggleable ? (onToggle ? collapsedProp : collapsedState) : false;
  const idRef = React.useRef<string>();
  if (!idRef.current) {
    idRef.current = `u_fieldset_${++uid}`;
  }
  const headerId = `${idRef.current}_header`;
  const contentId = `${idRef.current}_content`;

  const toggle = (event: React.SyntheticEvent) => {
    if (!toggleable) return;
    const next = !collapsed;
    if (!onToggle) {
      setCollapsedState(next);
    }
    onToggle?.({ originalEvent: event, value: next });
    event.preventDefault();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.code === "Enter" || event.code === "NumpadEnter" || event.code === "Space") {
      toggle(event);
    }
  };

  return (
    <fieldset ref={ref} className={[cx("root", { toggleable }), className].filter(Boolean).join(" ")}>
      <legend className={cx("legend")}>
        {toggleable ? (
          <button
            type="button"
            id={headerId}
            aria-controls={contentId}
            aria-expanded={!collapsed}
            className={cx("toggleButton")}
            onClick={toggle}
            onKeyDown={onKeyDown}
          >
            <span className={cx("toggleIcon")} aria-hidden="true">
              {collapsed ? "+" : "−"}
            </span>
            <span className={cx("legendLabel")}>{legend}</span>
          </button>
        ) : (
          <span className={cx("legendLabel")}>{legend}</span>
        )}
      </legend>
      {(!toggleable || !collapsed) && (
        <div
          className={cx("contentContainer")}
          role="region"
          id={contentId}
          aria-labelledby={headerId}
        >
          <div className={cx("content")}>{children}</div>
        </div>
      )}
    </fieldset>
  );
});
