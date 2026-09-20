import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { multiSelectStyleModule } from "./multi-select-style";

export interface UMultiSelectChangeEvent<T = unknown> {
  originalEvent: React.SyntheticEvent;
  value: T[];
}

export interface UMultiSelectProps<T = unknown> {
  value: T[];
  onChange: (value: T[]) => void;
  options: unknown[];
  optionLabel?: string | ((item: unknown) => string);
  optionValue?: string | ((item: unknown) => unknown);
  optionDisabled?: string | ((item: unknown) => boolean);
  placeholder?: string;
  disabled?: boolean;
  fluid?: boolean;
  filter?: boolean;
  filterPlaceholder?: string;
  showClear?: boolean;
  showToggleAll?: boolean;
  maxSelectedLabels?: number;
  selectedItemsLabel?: string;
  emptyMessage?: string;
  className?: string;
  onSelectionChange?: (event: UMultiSelectChangeEvent<T>) => void;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  onClear?: () => void;
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
 * Ultimate-owned adaptation of PrimeReact's `MultiSelect` (real source:
 * `components/lib/multiselect/MultiSelect.js`/`MultiSelectBase.js`,
 * extracted this session via `scripts/provenance/extract-primereact-source.mjs`).
 * Fully controlled (`value`/`onChange`), per React's established no-shared-
 * form-state-base-class convention — same shape `USelect`/`UAutoComplete`
 * and every sibling React component in this batch follows.
 *
 * `value` is an array, matching real source's own array-valued model
 * exactly. Overlay-based, same "absolute-positioned panel, no Portal"
 * convention `USelect` established for this capability family in React.
 * Unlike `USelect`, selecting an option does NOT close the overlay —
 * matching real source's own `onOptionClick`, which never closes the panel
 * on a plain click.
 *
 * Deliberately excludes real source's much larger surface: grouped options,
 * virtual scrolling, chip-display mode, range selection (Shift-click),
 * `selectionLimit`, item/header/footer render-prop slots, and PrimeReact's
 * global `context` config lookup — matching every sibling component's
 * established "smaller surface than upstream" precedent.
 */
export function UMultiSelect<T = unknown>({
  value,
  onChange,
  options,
  optionLabel,
  optionValue,
  optionDisabled,
  placeholder,
  disabled = false,
  fluid = false,
  filter = false,
  filterPlaceholder,
  showClear = false,
  showToggleAll = true,
  maxSelectedLabels = 3,
  selectedItemsLabel = "{0} items selected",
  emptyMessage = "No results found",
  className,
  onSelectionChange,
  onFocus,
  onBlur,
  onClear,
}: UMultiSelectProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "multi-select", styleModule: multiSelectStyleModule });

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

  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [filterValue, setFilterValue] = React.useState("");

  const selectedValues = Array.isArray(value) ? value : [];

  const visibleOptions = React.useMemo(() => {
    const query = filterValue.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => getOptionLabel(option).toLowerCase().includes(query));
  }, [options, filterValue, getOptionLabel]);

  const isSelected = React.useCallback(
    (option: unknown) => selectedValues.includes(getOptionValue(option) as T),
    [selectedValues, getOptionValue]
  );

  const allSelected = React.useMemo(() => {
    const selectable = visibleOptions.filter((option) => !isOptionDisabled(option));
    return selectable.length > 0 && selectable.every((option) => isSelected(option));
  }, [visibleOptions, isOptionDisabled, isSelected]);

  const label = React.useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length > maxSelectedLabels) {
      return selectedItemsLabel.replace("{0}", String(selectedValues.length));
    }
    return selectedValues
      .map((v) => {
        const option = options.find((o) => getOptionValue(o) === v);
        return option !== undefined ? getOptionLabel(option) : String(v);
      })
      .join(", ");
  }, [selectedValues, maxSelectedLabels, selectedItemsLabel, options, getOptionValue, getOptionLabel, placeholder]);

  const hide = () => {
    setOverlayVisible(false);
    setFocusedIndex(-1);
    setFilterValue("");
  };

  const show = () => {
    if (disabled) return;
    setOverlayVisible(true);
  };

  const toggleOption = (event: React.SyntheticEvent, option: unknown) => {
    if (isOptionDisabled(option)) return;
    const optionVal = getOptionValue(option) as T;
    const newValue = selectedValues.includes(optionVal)
      ? selectedValues.filter((v) => v !== optionVal)
      : [...selectedValues, optionVal];
    onChange(newValue);
    onSelectionChange?.({ originalEvent: event, value: newValue });
  };

  const toggleAll = () => {
    const selectable = visibleOptions.filter((option) => !isOptionDisabled(option));
    const newValue = allSelected
      ? selectedValues.filter((v) => !selectable.some((option) => getOptionValue(option) === v))
      : [
          ...selectedValues,
          ...selectable.map((option) => getOptionValue(option) as T).filter((v) => !selectedValues.includes(v)),
        ];
    onChange(newValue);
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

  const selectFocused = (event: React.SyntheticEvent) => {
    if (focusedIndex !== -1 && visibleOptions[focusedIndex] !== undefined) {
      toggleOption(event, visibleOptions[focusedIndex]);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    switch (event.code) {
      case "ArrowDown":
        overlayVisible ? moveFocus(1) : show();
        event.preventDefault();
        break;
      case "ArrowUp":
        overlayVisible ? moveFocus(-1) : show();
        event.preventDefault();
        break;
      case "Enter":
      case "NumpadEnter":
      case "Space":
        overlayVisible ? selectFocused(event) : show();
        event.preventDefault();
        break;
      case "Escape":
        if (overlayVisible) {
          hide();
          event.preventDefault();
        }
        break;
      case "Tab":
        hide();
        break;
      default:
        break;
    }
  };

  const isVisibleClearIcon = showClear && selectedValues.length > 0 && !disabled;

  return (
    <div className={[cx("root", { disabled, overlayVisible, fluid }), className].filter(Boolean).join(" ")}>
      <span
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={overlayVisible}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cx("label", { placeholder: selectedValues.length === 0 })}
        onClick={(event) => {
          if (disabled) return;
          overlayVisible ? hide() : show();
          event.stopPropagation();
        }}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {label}
      </span>
      {isVisibleClearIcon && (
        <span
          className={cx("clearIcon")}
          aria-hidden="true"
          onClick={(event) => {
            event.stopPropagation();
            onChange([]);
            onClear?.();
          }}
        >
          &times;
        </span>
      )}
      <div
        className={cx("dropdown")}
        role="button"
        aria-hidden="true"
        onClick={(event) => {
          if (disabled) return;
          overlayVisible ? hide() : show();
          event.stopPropagation();
        }}
      >
        <span aria-hidden="true">&#9662;</span>
      </div>
      {overlayVisible && (
        <div className={cx("overlay")}>
          <div className={cx("header")} onClick={(event) => event.stopPropagation()}>
            {showToggleAll && (
              <input type="checkbox" aria-label="Select All" checked={allSelected} onChange={toggleAll} />
            )}
            {filter && (
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
                onClick={(event) => event.stopPropagation()}
              />
            )}
          </div>
          <div className={cx("listContainer")}>
            <ul className={cx("list")} role="listbox" aria-multiselectable="true">
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
                  onClick={(event) => toggleOption(event, option)}
                  onMouseEnter={() => !isOptionDisabled(option) && setFocusedIndex(index)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected(option)}
                    disabled={isOptionDisabled(option)}
                    tabIndex={-1}
                    readOnly
                  />
                  <span>{getOptionLabel(option)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
