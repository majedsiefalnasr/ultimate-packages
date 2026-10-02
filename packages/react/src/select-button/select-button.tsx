import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { UToggleButton } from "../toggle-button/toggle-button";
import { selectButtonStyleModule } from "./select-button-style";

export interface USelectButtonChangeEvent<T = unknown> {
  originalEvent: React.SyntheticEvent;
  value: T;
}

export interface USelectButtonProps<T = unknown> {
  value: T;
  onChange: (event: USelectButtonChangeEvent<T>) => void;
  options: unknown[];
  optionLabel?: string | ((item: unknown) => string);
  optionValue?: string | ((item: unknown) => unknown);
  optionDisabled?: string | ((item: unknown) => boolean);
  multiple?: boolean;
  allowEmpty?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-labelledby"?: string;
}

function resolve<R>(
  accessor: string | ((item: unknown) => R) | undefined,
  option: unknown,
  fallback: (option: unknown) => R
): R {
  if (typeof accessor === "function") {
    return accessor(option);
  }
  if (typeof accessor === "string" && typeof option === "object" && option !== null) {
    return (option as Record<string, unknown>)[accessor] as R;
  }
  return fallback(option);
}

/**
 * Ultimate-owned adaptation of PrimeReact's `SelectButton` (real source:
 * `components/lib/selectbutton/SelectButton.js`/`SelectButtonBase.js`,
 * extracted this session via `scripts/provenance/extract-primereact-source.mjs`).
 * Fully controlled (`value`/`onChange`), per React's established no-shared-
 * form-state-base-class convention — same shape every sibling React
 * component in this batch follows.
 *
 * NOT overlay-based — real source renders a flat group of
 * `SelectButtonItem` buttons (`props.options.map(...)`), no panel/dropdown.
 * This port composes `UToggleButton` (`../toggle-button/toggle-button.tsx`)
 * for each option, matching real source's own per-option button composition
 * (real source's own `SelectButtonItem` wraps a native button rather than
 * `ToggleButton`, but the "one interactive element per option, no overlay"
 * shape is the same — this port reuses the sibling `UToggleButton` already
 * built in this batch rather than hand-rolling a second button primitive).
 *
 * Supports both single-select (`multiple` false, default — `value` is the
 * selected option's value, or `null`) and multi-select (`multiple` true —
 * `value` is an array of selected option values), matching real source's own
 * `onOptionClick`/`isSelected` `multiple` branch exactly. `allowEmpty`
 * (default `true`) mirrors real source's own default.
 *
 * Deliberately excludes real source's much larger surface: `dataKey`-based
 * equality, `tooltip`/`tooltipOptions`, item template render props
 * (`itemTemplate`), and PrimeReact's global `context` config lookup —
 * matching every sibling component's established "smaller surface than
 * upstream" precedent.
 */
export function USelectButton<T = unknown>({
  value,
  onChange,
  options,
  optionLabel,
  optionValue,
  optionDisabled,
  multiple = false,
  allowEmpty = true,
  disabled = false,
  className,
  "aria-labelledby": ariaLabelledBy,
}: USelectButtonProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "select-button", styleModule: selectButtonStyleModule });

  const groupRef = React.useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const getOptionLabel = (option: unknown): string =>
    resolve(optionLabel, option, (o) => String(o));
  const getOptionValue = (option: unknown): unknown => resolve(optionValue, option, (o) => o);
  const isOptionDisabled = (option: unknown): boolean =>
    resolve(optionDisabled, option, () => false);

  const isSelected = (option: unknown): boolean => {
    const optionVal = getOptionValue(option);
    if (multiple) {
      return Array.isArray(value) && (value as unknown[]).some((v) => v === optionVal);
    }
    return value === optionVal;
  };

  // Roving tab stop: a native-disabled input cannot hold focus, so the stop
  // falls back to the first enabled option when the tracked one is unusable.
  const firstEnabledIndex = options.findIndex((o) => !isOptionDisabled(o));
  const tabStopIndex =
    focusedIndex < options.length && !isOptionDisabled(options[focusedIndex])
      ? focusedIndex
      : firstEnabledIndex;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.code === "ArrowRight" || event.code === "ArrowDown"
        ? 1
        : event.code === "ArrowLeft" || event.code === "ArrowUp"
          ? -1
          : 0;
    const inputs = groupRef.current?.querySelectorAll<HTMLInputElement>("input");
    if (step === 0 || disabled || !inputs || inputs.length !== options.length) {
      return;
    }
    event.preventDefault();
    const target = Array.from(inputs).indexOf(event.target as HTMLInputElement);
    const from = target >= 0 ? target : tabStopIndex;
    for (let i = 1; i <= options.length; i++) {
      const next = (((from + step * i) % options.length) + options.length) % options.length;
      if (!isOptionDisabled(options[next])) {
        setFocusedIndex(next);
        inputs[next].focus();
        return;
      }
    }
  };

  const handleOptionClick = (event: React.SyntheticEvent, option: unknown) => {
    if (disabled || isOptionDisabled(option)) {
      return;
    }
    const optionVal = getOptionValue(option);
    const selected = isSelected(option);

    let newValue: unknown;
    if (multiple) {
      const current = Array.isArray(value) ? [...(value as unknown[])] : [];
      if (selected) {
        if (!allowEmpty && current.length === 1) {
          return;
        }
        newValue = current.filter((v) => v !== optionVal);
      } else {
        newValue = [...current, optionVal];
      }
    } else {
      if (selected) {
        if (!allowEmpty) {
          return;
        }
        newValue = null;
      } else {
        newValue = optionVal;
      }
    }

    onChange({ originalEvent: event, value: newValue as T });
  };

  return (
    <div
      ref={groupRef}
      role="group"
      onKeyDown={handleKeyDown}
      aria-labelledby={ariaLabelledBy}
      className={[cx("root", { fluid: false }), className].filter(Boolean).join(" ")}
    >
      {options.map((option, index) => {
        const label = getOptionLabel(option);
        return (
          <UToggleButton
            key={`${label}_${index}`}
            checked={isSelected(option)}
            onChange={(event) => {
              setFocusedIndex(index);
              handleOptionClick(event.originalEvent, option);
            }}
            tabIndex={!disabled && index === tabStopIndex ? 0 : -1}
            onLabel={label}
            offLabel={label}
            disabled={disabled || isOptionDisabled(option)}
          />
        );
      })}
    </div>
  );
}
