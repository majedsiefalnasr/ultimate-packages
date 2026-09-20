import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { accordionStyleModule } from "./accordion-style";

/** A single panel definition rendered by `UAccordion`. */
export interface UAccordionPanel {
  /** Unique key identifying this panel — drives active-state comparison. */
  value: string | number;
  /** Header text for this panel. */
  header?: React.ReactNode;
  /** Disables this panel's header interaction when true. */
  disabled?: boolean;
  /** Content rendered when this panel is active. */
  content?: React.ReactNode;
}

/** Custom tab open/close event. */
export interface UAccordionTabEvent {
  originalEvent?: React.SyntheticEvent;
  index: string | number;
}

export interface UAccordionProps {
  panels: UAccordionPanel[];
  /** When enabled, multiple panels can be activated at the same time. */
  multiple?: boolean;
  /** Value of the active panel(s) — controlled usage. Single value in single mode, array in multiple mode. */
  value?: string | number | (string | number)[];
  /** Default active value(s) for uncontrolled usage. */
  defaultValue?: string | number | (string | number)[];
  onValueChange?: (value: string | number | (string | number)[] | undefined) => void;
  onTabOpen?: (event: UAccordionTabEvent) => void;
  onTabClose?: (event: UAccordionTabEvent) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Accordion`/`AccordionTab`
 * component pair (real source: `components/lib/accordion/Accordion.js`).
 * Confirmed against real source: `Accordion` iterates its own
 * `AccordionTab`-marker `children` and renders each tab's header/content
 * itself — this port matches that same "the container owns
 * rendering, tabs are data" shape but replaces the `AccordionTab`
 * marker-component-scanning mechanism with a plain `panels:
 * UAccordionPanel[]` data array (same "smaller surface than upstream"
 * precedent as every sibling component, and the same data-model-driven
 * reduction already established for Angular's `UAccordion` in this same
 * task).
 *
 * Supports both controlled (`value`/`onValueChange`) and uncontrolled
 * (`defaultValue`) usage, matching real source's own
 * `activeIndex`/`onTabChange` controlled-vs-internal-state duality.
 */
export const UAccordion = React.forwardRef<HTMLDivElement, UAccordionProps>(function UAccordion(
  { panels, multiple = false, value, defaultValue, onValueChange, onTabOpen, onTabClose, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "accordion", styleModule: accordionStyleModule });
  const [internalValue, setInternalValue] = React.useState<
    string | number | (string | number)[] | undefined
  >(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const isActive = (panelValue: string | number): boolean => {
    if (Array.isArray(currentValue)) {
      return currentValue.includes(panelValue);
    }
    return currentValue === panelValue;
  };

  const handleHeaderClick = (event: React.SyntheticEvent, panel: UAccordionPanel) => {
    if (panel.disabled) return;
    event.preventDefault();
    const wasActive = isActive(panel.value);

    let next: string | number | (string | number)[] | undefined;
    if (multiple) {
      const currentArray = Array.isArray(currentValue) ? [...currentValue] : [];
      const index = currentArray.indexOf(panel.value);
      if (index !== -1) {
        currentArray.splice(index, 1);
      } else {
        currentArray.push(panel.value);
      }
      next = currentArray;
    } else {
      next = currentValue === panel.value ? undefined : panel.value;
    }

    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);

    if (!wasActive) {
      onTabOpen?.({ originalEvent: event, index: panel.value });
    } else {
      onTabClose?.({ originalEvent: event, index: panel.value });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, panel: UAccordionPanel) => {
    if (event.key === "Enter" || event.key === " ") {
      handleHeaderClick(event, panel);
    }
  };

  return (
    <div ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")}>
      {panels.map((panel) => {
        const active = isActive(panel.value);
        return (
          <div
            key={panel.value}
            className={cx("panel", { active, disabled: panel.disabled })}
            data-u-disabled={!!panel.disabled}
            data-u-active={active}
          >
            <div
              className={cx("header", { active, disabled: panel.disabled })}
              role="button"
              tabIndex={panel.disabled ? -1 : 0}
              aria-expanded={active}
              aria-disabled={panel.disabled || undefined}
              data-u-disabled={!!panel.disabled}
              data-u-active={active}
              onClick={(event) => handleHeaderClick(event, panel)}
              onKeyDown={(event) => handleKeyDown(event, panel)}
            >
              <span>{panel.header}</span>
              <span className={cx("toggleIcon")} aria-hidden="true">
                {active ? "▾" : "▸"}
              </span>
            </div>
            {active && (
              <div className={cx("content")} role="region">
                <div className={cx("contentInner")}>{panel.content}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
