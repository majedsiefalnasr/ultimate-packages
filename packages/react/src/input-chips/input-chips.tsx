import * as React from "react";
import { useComponentBase, UTimesIcon } from "@ultimate/react-core";
import { inputChipsStyleModule } from "./input-chips-style";

export interface UInputChipsAddEvent {
  originalEvent: React.SyntheticEvent;
  value: string;
}

export interface UInputChipsRemoveEvent {
  originalEvent: React.SyntheticEvent;
  value: string;
}

export interface UInputChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  separator?: string;
  allowDuplicate?: boolean;
  addOnBlur?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  placeholder?: string;
  inputId?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  onAdd?: (event: UInputChipsAddEvent) => void;
  onRemove?: (event: UInputChipsRemoveEvent) => void;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Chips` (real source:
 * `components/lib/chips/Chips.js`/`ChipsBase.js`, extracted this session
 * via `scripts/provenance/extract-primereact-source.mjs` — PrimeReact's own
 * directory name is `chips`, but this batch's canonical capability name is
 * "InputChips" per the approved spec §3.1, matching PrimeVue's own
 * `inputchips` directory naming). A freeform tag-entry input: type text and
 * press Enter (or a configured `separator`) to add a tag; Backspace on an
 * empty input removes the last tag; arrow-left/right navigate between
 * existing tag "tokens" and the text input.
 *
 * Fully-controlled (`value`/`onChange`), matching React's established
 * no-shared-form-state-base-class convention — same shape `UInputOtp`
 * follows for its own array-like value. Real source keeps the native
 * `<input>` DOM value imperatively cleared (`inputRef.current.value = ''`)
 * on each add/paste rather than treating it as a controlled React input;
 * this port keeps that same imperative-clear approach (via a local
 * `inputValue` state reset alongside the ref clear) since the native input
 * is not part of the `value: string[]` controlled prop — only committed
 * tags are.
 *
 * Deliberately renders each tag's markup inline (a `<span>` label + remove
 * button) rather than depending on a `Chip` sub-component: no `UChip`
 * exists yet in this package (unlike PrimeVue's InputChips, which does
 * depend on a `Chip` sub-component — see the Vue realization's own doc
 * comment for that difference), and PrimeReact's own `Chips.js` already
 * renders its tag markup inline without a `Chip` dependency, so this
 * matches real React source directly.
 */
export const UInputChips = React.forwardRef<HTMLDivElement, UInputChipsProps>(function UInputChips(
  {
    value,
    onChange,
    max,
    separator,
    allowDuplicate = true,
    addOnBlur = false,
    disabled = false,
    readOnly = false,
    invalid = false,
    placeholder,
    inputId,
    name,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    onAdd,
    onRemove,
    onFocus,
    onBlur,
    className,
  },
  ref
) {
  const { cx } = useComponentBase({
    componentName: "input-chips",
    styleModule: inputChipsStyleModule,
  });

  const [focused, setFocused] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const idBase = React.useId();

  const maxedOut = Boolean(max && value.length >= max);

  const commit = React.useCallback(
    (nextValue: string[]) => {
      onChange(nextValue);
      setInputValue("");
      if (inputRef.current) inputRef.current.value = "";
    },
    [onChange]
  );

  const addItem = React.useCallback(
    (event: React.SyntheticEvent, item: string) => {
      const trimmed = item.trim();
      if (!trimmed) return;
      if (!allowDuplicate && value.includes(trimmed)) {
        commit(value);
        return;
      }
      const next = [...value, trimmed];
      onAdd?.({ originalEvent: event, value: trimmed });
      commit(next);
    },
    [allowDuplicate, value, onAdd, commit]
  );

  const removeItem = React.useCallback(
    (event: React.SyntheticEvent, index: number) => {
      if (disabled || readOnly) return;
      const removed = value[index];
      const next = value.filter((_, i) => i !== index);
      onRemove?.({ originalEvent: event, value: removed });
      onChange(next);
      setFocusedIndex(null);
      inputRef.current?.focus();
    },
    [disabled, readOnly, value, onRemove, onChange]
  );

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setFocusedIndex(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const raw = event.currentTarget.value;
    switch (event.key) {
      case "Backspace":
        if (raw.length === 0 && value.length > 0) {
          removeItem(event, value.length - 1);
        }
        break;
      case "Enter":
        if (raw.trim().length && !maxedOut) {
          addItem(event, raw);
        }
        event.preventDefault();
        break;
      case "ArrowLeft":
        if (raw.length === 0 && value.length > 0) {
          listRef.current?.focus();
        }
        break;
      case "ArrowRight":
        event.stopPropagation();
        break;
      default:
        if (separator && event.key === separator) {
          if (raw.trim().length && !maxedOut) addItem(event, raw);
          event.preventDefault();
        }
        break;
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (!separator) return;
    const pasted = event.clipboardData.getData("text");
    if (!pasted) return;
    const parts = pasted
      .split(separator)
      .filter((part) => (allowDuplicate || !value.includes(part)) && part.trim().length);
    if (parts.length) {
      onChange([...value, ...parts]);
      setInputValue("");
      if (inputRef.current) inputRef.current.value = "";
    }
    event.preventDefault();
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    setFocusedIndex(null);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (addOnBlur) {
      const raw = event.target.value;
      if (raw.trim().length && !maxedOut) addItem(event, raw);
    }
    setFocused(false);
    onBlur?.(event);
  };

  const handleContainerKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    if (event.key === "ArrowLeft") {
      if (inputValue.length === 0 && value.length > 0) {
        setFocusedIndex((i) => {
          const next = i === null ? value.length - 1 : i - 1;
          return next < 0 ? 0 : next;
        });
      }
    } else if (event.key === "ArrowRight") {
      if (inputValue.length === 0 && value.length > 0) {
        setFocusedIndex((i) => {
          if (i === value.length - 1) {
            inputRef.current?.focus();
            return null;
          }
          return i === null ? null : i + 1;
        });
      }
    } else if (event.key === "Backspace" && focusedIndex !== null) {
      removeItem(event, focusedIndex);
    }
  };

  const isFilled = value.length > 0 || inputValue.length > 0;

  return (
    <div
      ref={ref}
      className={[cx("root", { filled: isFilled, focused, disabled, invalid }), className]
        .filter(Boolean)
        .join(" ")}
    >
      <ul
        ref={listRef}
        className={cx("container")}
        tabIndex={-1}
        role="listbox"
        aria-orientation="horizontal"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        onClick={() => inputRef.current?.focus()}
        onKeyDown={handleContainerKeyDown}
      >
        {value.map((token, index) => (
          <li
            key={`${index}_${token}`}
            id={`${idBase}_item_${index}`}
            role="option"
            aria-selected="true"
            aria-label={token}
            className={cx("token", { focused: focusedIndex === index })}
          >
            <span>{token}</span>
            {!disabled && !readOnly && (
              <button
                type="button"
                className={cx("tokenIcon")}
                onClick={(event) => removeItem(event, index)}
                aria-label={`Remove ${token}`}
              >
                <UTimesIcon />
              </button>
            )}
          </li>
        ))}
        <li className={cx("inputToken")}>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            name={name}
            placeholder={placeholder}
            disabled={disabled || maxedOut}
            readOnly={readOnly}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={invalid || undefined}
          />
        </li>
      </ul>
    </div>
  );
});
