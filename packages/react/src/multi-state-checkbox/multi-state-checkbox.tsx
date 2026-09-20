import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { multiStateCheckboxStyleModule } from "./multi-state-checkbox-style";

export interface UMultiStateCheckboxChangeEvent<V = unknown> {
  originalEvent: React.SyntheticEvent;
  value: V | null;
}

export interface UMultiStateCheckboxProps<T = unknown, V = T> {
  value: V | null;
  options: T[];
  onChange: (event: UMultiStateCheckboxChangeEvent<V>) => void;
  optionValue?: string;
  optionLabel?: string;
  optionIcon?: (option: T) => React.ReactNode;
  empty?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

function getOptionValue<T>(option: T, optionValue?: string): unknown {
  if (optionValue && typeof option === "object" && option !== null) {
    return (option as Record<string, unknown>)[optionValue];
  }
  return option;
}

function getOptionLabel<T>(option: T, optionLabel?: string): string {
  if (optionLabel && typeof option === "object" && option !== null) {
    return String((option as Record<string, unknown>)[optionLabel] ?? "");
  }
  return String(option);
}

/**
 * Ultimate-owned adaptation of PrimeReact's `MultiStateCheckbox` (real
 * source: `components/lib/multistatecheckbox/MultiStateCheckbox.js`/
 * `MultiStateCheckboxBase.js`, extracted this session via
 * `scripts/provenance/extract-primereact-source.mjs`). Cycles through a
 * configurable list of `options` on click — each click advances `value` to
 * the next option (wrapping to `null`, when `empty` is true, once past the
 * last option; wrapping straight back to the first option when `empty` is
 * false).
 *
 * Fully-controlled (`value`/`onChange`), matching React's established
 * no-shared-form-state-base-class convention — same shape every sibling
 * React component in this batch follows. Real source additionally renders a
 * nested real `<Checkbox>` sub-component and a `useMountEffect` that
 * force-advances `value` once on mount when `!empty && value === null`; this
 * port renders its own self-contained checkbox-shaped box/icon markup
 * directly (no dependency on `UCheckbox`, matching `TriStateCheckbox`'s own
 * same-batch precedent below) and leaves the "un-emptiable initial value"
 * responsibility to the consumer (setting a non-null initial `value`) rather
 * than silently emitting a synthetic `onChange` on mount, which would
 * surprise a fully-controlled consumer expecting `onChange` to only fire in
 * response to real user interaction.
 */
export function UMultiStateCheckbox<T = unknown, V = T>({
  value,
  options,
  onChange,
  optionValue,
  optionLabel,
  optionIcon,
  empty = true,
  disabled = false,
  readOnly = false,
  tabIndex = 0,
  id,
  className,
  "aria-label": ariaLabel,
}: UMultiStateCheckboxProps<T, V>): React.ReactElement {
  const { cx } = useComponentBase({
    componentName: "multi-state-checkbox",
    styleModule: multiStateCheckboxStyleModule,
  });

  const selectedIndex = options.findIndex(
    (option) => getOptionValue(option, optionValue) === value
  );
  const selectedOption = selectedIndex !== -1 ? options[selectedIndex] : undefined;

  const findNextOption = (): T | null => {
    if (selectedIndex === options.length - 1) {
      return empty ? null : (options[0] ?? null);
    }
    return options[selectedIndex + 1] ?? options[0] ?? null;
  };

  const toggle = (event: React.SyntheticEvent) => {
    if (disabled || readOnly) return;
    const next = findNextOption();
    const nextValue = next === null ? null : (getOptionValue(next, optionValue) as V);
    onChange({ originalEvent: event, value: nextValue });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.code === "Space" || event.key === " ") {
      toggle(event);
      event.preventDefault();
    }
  };

  return (
    <div
      id={id}
      className={[cx("root", { disabled }), className].filter(Boolean).join(" ")}
      onClick={toggle}
      role="button"
      tabIndex={disabled ? -1 : tabIndex}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel ?? (selectedOption ? getOptionLabel(selectedOption, optionLabel) : "none")}
    >
      <div className={cx("box")}>
        {selectedOption && optionIcon ? optionIcon(selectedOption) : null}
      </div>
    </div>
  );
}
