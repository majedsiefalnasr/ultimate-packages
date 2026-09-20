import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { listboxStyleModule } from "./listbox-style";

export interface UListboxChangeEvent<T = unknown> {
  originalEvent: React.SyntheticEvent;
  value: T | T[];
}

export interface UListboxProps<T = unknown> {
  value: T | T[] | null;
  onChange: (value: T | T[] | null) => void;
  options: unknown[];
  optionLabel?: string | ((item: unknown) => string);
  optionValue?: string | ((item: unknown) => unknown);
  optionDisabled?: string | ((item: unknown) => boolean);
  multiple?: boolean;
  filter?: boolean;
  filterPlaceholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
  "aria-label"?: string;
  onSelectionChange?: (event: UListboxChangeEvent<T>) => void;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}

function resolve<R>(
  accessor: string | ((item: unknown) => R) | undefined,
  option: unknown,
  fallback: (option: unknown) => R
): R {
  if (typeof accessor === "function") return accessor(option);
  if (typeof accessor === "string" && typeof option === "object" && option !== null) {
    return (option as Record<string, unknown>)[accessor] as R;
  }
  return fallback(option);
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Listbox` (real source:
 * `components/lib/listbox/Listbox.js`/`ListboxBase.js`, extracted this
 * session via `scripts/provenance/extract-primereact-source.mjs`). Fully
 * controlled (`value`/`onChange`), per React's established no-shared-
 * form-state-base-class convention — same shape every sibling React
 * component in this batch follows.
 *
 * NOT overlay-based — real source renders an always-visible `role="listbox"`
 * list directly (optional filter header, an options list, no panel/dropdown/
 * trigger), matching real source's own template shape (`ListboxBase.js`'s
 * defaultProps have no overlay-related option at all, unlike `Dropdown`/
 * `MultiSelect`). This port follows `USelectButton`'s established "no
 * overlay composition" precedent for the same reason.
 *
 * Supports both single-select (`multiple` false, default — `value` is the
 * selected option's value, or `null`) and multi-select (`multiple` true —
 * `value` is an array), matching real source's own `onOptionSelect`
 * `multiple` branch.
 *
 * Deliberately excludes real source's much larger surface: grouped options,
 * virtual scrolling, drag reordering, range selection (Shift-click), item/
 * header/footer render-prop slots, and PrimeReact's global `context` config
 * lookup — matching every sibling component's established "smaller surface
 * than upstream" precedent.
 */
export function UListbox<T = unknown>({
  value,
  onChange,
  options,
  optionLabel,
  optionValue,
  optionDisabled,
  multiple = false,
  filter = false,
  filterPlaceholder,
  disabled = false,
  emptyMessage = "No results found",
  className,
  "aria-label": ariaLabel,
  onSelectionChange,
  onFocus,
  onBlur,
}: UListboxProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "listbox", styleModule: listboxStyleModule });

  const getOptionLabel = React.useCallback(
    (option: unknown): string => resolve(optionLabel, option, (o) => String(o)),
    [optionLabel]
  );
  const getOptionValue = React.useCallback(
    (option: unknown): unknown => resolve(optionValue, option, (o) => o),
    [optionValue]
  );
  const isOptionDisabled = React.useCallback(
    (option: unknown): boolean => resolve(optionDisabled, option, () => false),
    [optionDisabled]
  );

  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [filterValue, setFilterValue] = React.useState("");

  const visibleOptions = React.useMemo(() => {
    const query = filterValue.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => getOptionLabel(option).toLowerCase().includes(query));
  }, [options, filterValue, getOptionLabel]);

  const isSelected = React.useCallback(
    (option: unknown) => {
      const optionVal = getOptionValue(option);
      if (multiple) {
        return Array.isArray(value) && value.includes(optionVal as T);
      }
      return value === optionVal;
    },
    [value, multiple, getOptionValue]
  );

  const selectOption = (event: React.SyntheticEvent, option: unknown) => {
    if (isOptionDisabled(option)) return;
    const optionVal = getOptionValue(option) as T;
    let newValue: T | T[];
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      newValue = current.includes(optionVal) ? current.filter((v) => v !== optionVal) : [...current, optionVal];
    } else {
      newValue = optionVal;
    }
    onChange(newValue);
    onSelectionChange?.({ originalEvent: event, value: newValue });
  };

  const moveFocus = (delta: 1 | -1) => {
    if (visibleOptions.length === 0) return;
    setFocusedIndex((current) => {
      let next = current;
      do {
        next = (next + delta + visibleOptions.length) % visibleOptions.length;
      } while (isOptionDisabled(visibleOptions[next]) && next !== current);
      return next;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    switch (event.code) {
      case "ArrowDown":
        moveFocus(1);
        event.preventDefault();
        break;
      case "ArrowUp":
        moveFocus(-1);
        event.preventDefault();
        break;
      case "Home":
        setFocusedIndex(0);
        event.preventDefault();
        break;
      case "End":
        setFocusedIndex(visibleOptions.length - 1);
        event.preventDefault();
        break;
      case "Enter":
      case "NumpadEnter":
      case "Space":
        if (focusedIndex !== -1 && visibleOptions[focusedIndex] !== undefined) {
          selectOption(event, visibleOptions[focusedIndex]);
        }
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  return (
    <div className={[cx("root", { disabled }), className].filter(Boolean).join(" ")}>
      {filter && (
        <div className={cx("header")}>
          <input
            type="text"
            role="searchbox"
            autoComplete="off"
            className={cx("filter")}
            value={filterValue}
            placeholder={filterPlaceholder}
            onChange={(event) => {
              setFilterValue(event.target.value);
              setFocusedIndex(-1);
            }}
          />
        </div>
      )}
      <div className={cx("listContainer")}>
        <ul
          className={cx("list")}
          role="listbox"
          aria-multiselectable={multiple}
          aria-label={ariaLabel}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
        >
          {visibleOptions.length === 0 && (
            <li className={cx("emptyMessage")} role="option">
              {emptyMessage}
            </li>
          )}
          {visibleOptions.map((option, index) => (
            <li
              key={index}
              role="option"
              aria-selected={isSelected(option)}
              aria-disabled={isOptionDisabled(option)}
              className={cx("option", {
                focused: focusedIndex === index,
                selected: isSelected(option),
                disabled: isOptionDisabled(option),
              })}
              onClick={(event) => selectOption(event, option)}
              onMouseEnter={() => !isOptionDisabled(option) && setFocusedIndex(index)}
            >
              {multiple && (
                <input
                  type="checkbox"
                  checked={isSelected(option)}
                  disabled={isOptionDisabled(option)}
                  tabIndex={-1}
                  readOnly
                />
              )}
              <span>{getOptionLabel(option)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
