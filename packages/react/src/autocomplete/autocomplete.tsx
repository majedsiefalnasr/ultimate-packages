import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { autoCompleteStyleModule } from "./autocomplete-style";

export interface UAutoCompleteCompleteEvent {
  originalEvent: React.SyntheticEvent;
  query: string;
}

export interface UAutoCompleteSelectEvent<T = unknown> {
  originalEvent: React.SyntheticEvent;
  value: T;
}

export interface UAutoCompleteProps<T = unknown> {
  value: T | null;
  onChange: (value: T | null) => void;
  suggestions?: T[];
  optionLabel?: string | ((item: T) => string);
  minLength?: number;
  delay?: number;
  placeholder?: string;
  disabled?: boolean;
  fluid?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  showEmptyMessage?: boolean;
  className?: string;
  inputId?: string;
  "aria-label"?: string;
  completeMethod?: (event: UAutoCompleteCompleteEvent) => void;
  onSelect?: (event: UAutoCompleteSelectEvent<T>) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onClear?: () => void;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `AutoComplete` (real source:
 * `components/lib/autocomplete/AutoComplete.js`/`AutoCompleteBase.js`,
 * extracted this session via `scripts/provenance/extract-primereact-source.mjs`).
 * Fully controlled (`value`/`onChange`), per React's established no-shared-
 * form-state-base-class convention — same shape `UPassword` and every
 * sibling React component in this batch follows.
 *
 * Real source's own `completeMethod`/`suggestions` relationship is kept
 * verbatim: the consumer owns the async search and populates `suggestions`;
 * this component owns the overlay/list/keyboard-navigation, matching real
 * source's `search()`/`completeMethod`/`suggestions` prop contract exactly
 * (`AutoCompleteBase.js` `defaultProps`: `completeMethod`, `suggestions`,
 * `field`/`onSelect`/`onChange`).
 *
 * Deliberately excludes real source's much larger surface: `multiple`
 * selection (chip list), grouped options, virtual scrolling, `dropdown`
 * button, header/footer/item/loader render-prop slots, `forceSelection`,
 * and PrimeReact's global `context` config lookup — matching every sibling
 * component's established "smaller surface than upstream" precedent.
 */
export function UAutoComplete<T = unknown>({
  value,
  onChange,
  suggestions = [],
  optionLabel,
  minLength = 1,
  delay = 300,
  placeholder,
  disabled = false,
  fluid = false,
  loading = false,
  emptyMessage = "No results found",
  showEmptyMessage = true,
  className,
  inputId,
  "aria-label": ariaLabel,
  completeMethod,
  onSelect,
  onFocus,
  onBlur,
  onClear,
}: UAutoCompleteProps<T>): React.ReactElement {
  const { cx } = useComponentBase({
    componentName: "autocomplete",
    styleModule: autoCompleteStyleModule,
  });

  const getOptionLabel = React.useCallback(
    (option: T | null): string => {
      if (option == null) return "";
      if (typeof optionLabel === "function") return optionLabel(option);
      if (typeof optionLabel === "string" && typeof option === "object") {
        return String((option as Record<string, unknown>)[optionLabel] ?? "");
      }
      return typeof option === "string" ? option : String(option);
    },
    [optionLabel]
  );

  const [inputValue, setInputValue] = React.useState(() => getOptionLabel(value));
  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>();
  const idRef = React.useId();

  React.useEffect(() => {
    setInputValue(getOptionLabel(value));
  }, [value, getOptionLabel]);

  const hide = React.useCallback(() => {
    setOverlayVisible(false);
    setFocusedIndex(-1);
  }, []);

  const selectOption = React.useCallback(
    (event: React.SyntheticEvent, option: T) => {
      onChange(option);
      setInputValue(getOptionLabel(option));
      onSelect?.({ originalEvent: event, value: option });
      hide();
    },
    [onChange, getOptionLabel, onSelect, hide]
  );

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setInputValue(query);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length === 0) {
      onChange(null);
      onClear?.();
      hide();
      return;
    }

    if (query.length >= minLength) {
      setFocusedIndex(-1);
      searchTimeout.current = setTimeout(() => {
        completeMethod?.({ originalEvent: event, query });
        setOverlayVisible(true);
      }, delay);
    } else {
      hide();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    switch (event.code) {
      case "ArrowDown": {
        if (!overlayVisible) return;
        setFocusedIndex((i) => (i + 1 >= suggestions.length ? 0 : i + 1));
        event.preventDefault();
        break;
      }
      case "ArrowUp": {
        if (!overlayVisible) return;
        setFocusedIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        event.preventDefault();
        break;
      }
      case "Enter":
      case "NumpadEnter": {
        if (!overlayVisible) return;
        if (focusedIndex !== -1) {
          selectOption(event, suggestions[focusedIndex]);
        }
        event.preventDefault();
        break;
      }
      case "Escape": {
        if (overlayVisible) {
          hide();
          event.preventDefault();
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className={[cx("root", { filled: inputValue.length > 0, disabled, fluid }), className].filter(Boolean).join(" ")}>
      <input
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={overlayVisible}
        aria-activedescendant={focusedIndex !== -1 ? `${idRef}_option_${focusedIndex}` : undefined}
        id={inputId}
        aria-label={ariaLabel}
        className={cx("input")}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={(event) => {
          hide();
          onBlur?.(event);
        }}
      />
      {loading && (
        <span className={cx("loader")} aria-hidden="true">
          &hellip;
        </span>
      )}
      {overlayVisible && (
        <div className={cx("overlay")}>
          <ul className={cx("list")} role="listbox" id={`${idRef}_list`}>
            {suggestions.length === 0 && showEmptyMessage && (
              <li className={cx("emptyMessage")} role="option">
                {emptyMessage}
              </li>
            )}
            {suggestions.map((option, index) => (
              <li
                key={index}
                id={`${idRef}_option_${index}`}
                role="option"
                aria-selected={option === value}
                className={cx("option", { focused: focusedIndex === index, selected: option === value })}
                onClick={(event) => selectOption(event, option)}
                onMouseEnter={() => setFocusedIndex(index)}
              >
                {getOptionLabel(option)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
