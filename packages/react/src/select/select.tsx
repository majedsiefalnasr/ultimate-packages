import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { selectStyleModule } from "./select-style";

export interface USelectChangeEvent<T = unknown> {
  originalEvent: React.SyntheticEvent;
  value: T;
}

export interface USelectProps<T = unknown> {
  value: T | null;
  onChange: (value: T | null) => void;
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
  emptyMessage?: string;
  className?: string;
  inputId?: string;
  "aria-label"?: string;
  onSelect?: (event: USelectChangeEvent<T>) => void;
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
 * Ultimate-owned adaptation of PrimeReact's `Dropdown` (real source:
 * `components/lib/dropdown/Dropdown.js`/`DropdownBase.js`, extracted this
 * session via `scripts/provenance/extract-primereact-source.mjs`) — kept
 * under React's own framework-native `Dropdown` name per the Batch 1
 * migration plan's explicit naming note (canonical capability `Select`
 * realizes as PrimeReact's own `Dropdown` in React; this port is exported as
 * `USelect` to match Ultimate's own cross-framework export-name convention,
 * same as every other Select-family component in this batch — the *Prime*
 * source name is `Dropdown`, not the exported Ultimate component name).
 *
 * Fully controlled (`value`/`onChange`), per React's established no-shared-
 * form-state-base-class convention — same shape `UAutoComplete` and every
 * sibling React component in this batch follows.
 *
 * Overlay-based: real source's own template composes a trigger
 * (label + dropdown icon) plus a filterable option-list panel opened on
 * click — this port follows the same "absolute-positioned panel, no
 * Portal/Teleport" convention `UAutoComplete`
 * (`packages/react/src/autocomplete/autocomplete.tsx`) already established
 * for this capability family in React.
 *
 * Deliberately excludes real source's much larger surface: grouped options,
 * virtual scrolling, `editable` free-text mode, checkmark variant, item/
 * header/footer render-prop slots, and PrimeReact's global `context` config
 * lookup — matching every sibling component's established "smaller surface
 * than upstream" precedent.
 */
export function USelect<T = unknown>({
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
  emptyMessage = "No results found",
  className,
  inputId,
  "aria-label": ariaLabel,
  onSelect,
  onFocus,
  onBlur,
  onClear,
}: USelectProps<T>): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "select", styleModule: selectStyleModule });

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
  const idRef = React.useId();

  const selectedOption = React.useMemo(
    () => options.find((option) => getOptionValue(option) === value),
    [options, getOptionValue, value]
  );

  const visibleOptions = React.useMemo(() => {
    const query = filterValue.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => getOptionLabel(option).toLowerCase().includes(query));
  }, [options, filterValue, getOptionLabel]);

  const isSelected = React.useCallback(
    (option: unknown) => getOptionValue(option) === value,
    [getOptionValue, value]
  );

  const hide = () => {
    setOverlayVisible(false);
    setFocusedIndex(-1);
    setFilterValue("");
  };

  const show = () => {
    if (disabled) return;
    setOverlayVisible(true);
    setFocusedIndex(visibleOptions.findIndex((option) => isSelected(option)));
  };

  const selectOption = (event: React.SyntheticEvent, option: unknown) => {
    if (isOptionDisabled(option)) return;
    const optionVal = getOptionValue(option);
    onChange(optionVal as T | null);
    onSelect?.({ originalEvent: event, value: optionVal as T });
    hide();
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
      selectOption(event, visibleOptions[focusedIndex]);
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
      case "Home":
        if (overlayVisible) {
          setFocusedIndex(0);
          event.preventDefault();
        }
        break;
      case "End":
        if (overlayVisible) {
          setFocusedIndex(visibleOptions.length - 1);
          event.preventDefault();
        }
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

  const label = selectedOption !== undefined ? getOptionLabel(selectedOption) : placeholder;
  const isVisibleClearIcon = showClear && value != null && !disabled;

  return (
    <div className={[cx("root", { disabled, overlayVisible, fluid }), className].filter(Boolean).join(" ")}>
      <span
        role="combobox"
        id={inputId}
        aria-label={ariaLabel ?? label}
        aria-haspopup="listbox"
        aria-expanded={overlayVisible}
        aria-disabled={disabled}
        aria-activedescendant={focusedIndex !== -1 ? `${idRef}_option_${focusedIndex}` : undefined}
        tabIndex={disabled ? -1 : 0}
        className={cx("label", { placeholder: selectedOption === undefined })}
        onClick={(event) => {
          if (disabled) return;
          overlayVisible ? hide() : show();
          event.stopPropagation();
        }}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {label === undefined ? " " : label}
      </span>
      {isVisibleClearIcon && (
        <span
          className={cx("clearIcon")}
          aria-hidden="true"
          onClick={(event) => {
            event.stopPropagation();
            onChange(null);
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
          {filter && (
            <div className={cx("header")} onClick={(event) => event.stopPropagation()}>
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
                onKeyDown={(event) => {
                  switch (event.code) {
                    case "ArrowDown":
                      moveFocus(1);
                      event.preventDefault();
                      break;
                    case "ArrowUp":
                      moveFocus(-1);
                      event.preventDefault();
                      break;
                    case "Enter":
                    case "NumpadEnter":
                      selectFocused(event);
                      event.preventDefault();
                      break;
                    case "Escape":
                      hide();
                      event.preventDefault();
                      break;
                    default:
                      break;
                  }
                }}
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          )}
          <div className={cx("listContainer")}>
            <ul className={cx("list")} role="listbox" id={`${idRef}_list`}>
              {visibleOptions.length === 0 && (
                <li className={cx("emptyMessage")} role="option">
                  {emptyMessage}
                </li>
              )}
              {visibleOptions.map((option, index) => (
                <li
                  key={index}
                  id={`${idRef}_option_${index}`}
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
                  {getOptionLabel(option)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
