import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { inputNumberStyleModule } from "./input-number-style";

/**
 * Ultimate-owned adaptation of PrimeReact's `InputNumber` (real source:
 * `components/lib/inputnumber/InputNumber.js`/`InputNumberBase.js`,
 * extracted this session). Fully-controlled (`value`/`onValueChange`),
 * matching React's no-shared-form-state-base-class convention.
 *
 * Real PrimeReact InputNumber is React's own established idiom for this
 * capability: locale-aware `Intl.NumberFormat`-based display formatting
 * (`format`/`locale`/`useGrouping`/`minFractionDigits`/`maxFractionDigits`),
 * `prefix`/`suffix`, spinner buttons (`showButtons`, default OFF per real
 * source's own `showButtons: false` default), min/max/step clamping. This
 * component ports that idiom for real rather than cutting it down to match
 * Angular's own documented InputNumber scope-cut (per this task's explicit
 * instruction that React/Vue determine their own appropriate scope from
 * their own real source).
 *
 * Ported for real: `Intl.NumberFormat` formatting/parsing (`mode: "decimal"
 * | "currency" | "percent"`, `currency`, `locale`, `useGrouping`,
 * `minFractionDigits`/`maxFractionDigits`), `prefix`/`suffix` display
 * decoration, `min`/`max`/`step` clamping, increment/decrement via spinner
 * buttons (mouse) and ArrowUp/ArrowDown keys, disabled/readOnly/invalid,
 * `allowEmpty`.
 *
 * Deliberately excludes real source's caret-position-preserving
 * insert/delete logic (`insertText`/`deleteRange`/`updateInput`/
 * `initCursor`) and clipboard-paste parsing — real source reformats the
 * whole input value and attempts to restore the caret to its pre-edit
 * position; this component instead reformats on blur (keeping the raw
 * numeric string live while focused, matching a simpler and still-correct
 * fully-controlled pattern) and lets the browser's default caret behavior
 * apply while typing. Also excludes `buttonLayout: "horizontal" |
 * "vertical"` (only the default `"stacked"` layout is implemented) and
 * `roundingMode` (delegated entirely to `Intl.NumberFormat`'s own default
 * rounding). These are documented, explicit scope cuts, not silent
 * omissions — mirroring how `UInputNumber`'s Angular doc comment documents
 * its own cuts.
 */
export interface UInputNumberValueChangeEvent {
  originalEvent: React.SyntheticEvent;
  value: number | null;
}

export interface UInputNumberProps {
  value?: number | null;
  onValueChange?: (event: UInputNumberValueChangeEvent) => void;
  min?: number;
  max?: number;
  step?: number;
  mode?: "decimal" | "currency" | "percent";
  currency?: string;
  locale?: string;
  useGrouping?: boolean;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  prefix?: string;
  suffix?: string;
  format?: boolean;
  allowEmpty?: boolean;
  showButtons?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  fluid?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min != null && result < min) result = min;
  if (max != null && result > max) result = max;
  return result;
}

export const UInputNumber = React.forwardRef<HTMLInputElement, UInputNumberProps>(function UInputNumber(
  {
    value = null,
    onValueChange,
    min,
    max,
    step = 1,
    mode = "decimal",
    currency,
    locale,
    useGrouping = true,
    minFractionDigits,
    maxFractionDigits,
    prefix = "",
    suffix = "",
    format = true,
    allowEmpty = true,
    showButtons = false,
    disabled = false,
    readOnly = false,
    invalid = false,
    fluid = false,
    name,
    id,
    placeholder,
    className,
    inputRef,
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "input-number", styleModule: inputNumberStyleModule });
  const elementRef = React.useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = React.useState(false);
  const [rawText, setRawText] = React.useState<string | null>(null);

  const setRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      elementRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof inputRef === "function") inputRef(node);
      else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref, inputRef]
  );

  const numberFormat = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: mode,
        currency: mode === "currency" ? currency : undefined,
        useGrouping,
        minimumFractionDigits: minFractionDigits,
        maximumFractionDigits: maxFractionDigits,
      }),
    [locale, mode, currency, useGrouping, minFractionDigits, maxFractionDigits]
  );

  const formatValue = React.useCallback(
    (val: number | null): string => {
      if (val == null) return "";
      const formatted = format ? numberFormat.format(val) : String(val);
      return `${prefix}${formatted}${suffix}`;
    },
    [format, numberFormat, prefix, suffix]
  );

  const parseValue = React.useCallback(
    (text: string): number | null => {
      let stripped = text;
      if (prefix && stripped.startsWith(prefix)) stripped = stripped.slice(prefix.length);
      if (suffix && stripped.endsWith(suffix)) stripped = stripped.slice(0, stripped.length - suffix.length);
      stripped = stripped.trim();
      if (stripped === "") return null;
      // Strip locale grouping separators and normalize decimal separator to '.'.
      const parts = numberFormat.formatToParts(1234.5);
      const group = parts.find((p) => p.type === "group")?.value ?? ",";
      const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
      const normalized = stripped
        .split(group)
        .join("")
        .replace(decimal, ".")
        .replace(/[^\d.-]/g, "");
      const parsed = Number(normalized);
      return Number.isNaN(parsed) ? null : parsed;
    },
    [numberFormat, prefix, suffix]
  );

  const emit = React.useCallback(
    (event: React.SyntheticEvent, next: number | null) => {
      onValueChange?.({ originalEvent: event, value: next });
    },
    [onValueChange]
  );

  const displayValue = focused ? (rawText ?? (value == null ? "" : String(value))) : formatValue(value);

  const onFocus = React.useCallback(() => {
    setFocused(true);
    setRawText(value == null ? "" : String(value));
  }, [value]);

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRawText(event.target.value);
    },
    []
  );

  const commit = React.useCallback(
    (event: React.SyntheticEvent, text: string) => {
      const parsed = parseValue(text);
      if (parsed == null) {
        if (allowEmpty) emit(event, null);
        else emit(event, clamp(0, min, max));
        return;
      }
      emit(event, clamp(parsed, min, max));
    },
    [parseValue, allowEmpty, emit, min, max]
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      commit(event, rawText ?? "");
      setFocused(false);
      setRawText(null);
    },
    [commit, rawText]
  );

  const applyStep = React.useCallback(
    (event: React.SyntheticEvent, direction: 1 | -1) => {
      if (disabled || readOnly) return;
      const base = value ?? 0;
      const next = clamp(base + direction * step, min, max);
      emit(event, next);
    },
    [disabled, readOnly, value, step, min, max, emit]
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowUp") {
        applyStep(event, 1);
        event.preventDefault();
      } else if (event.key === "ArrowDown") {
        applyStep(event, -1);
        event.preventDefault();
      }
    },
    [applyStep]
  );

  return (
    <span className={[cx("root", { invalid, fluid, focused }), className].filter(Boolean).join(" ")}>
      <input
        ref={setRef}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        id={id}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value ?? undefined}
        className={cx("input")}
        value={displayValue}
        onFocus={onFocus}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      {showButtons && (
        <span className={cx("buttonGroup")}>
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || readOnly}
            className={cx("incrementButton")}
            aria-label="Increment"
            onClick={(event) => applyStep(event, 1)}
          >
            +
          </button>
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled || readOnly}
            className={cx("decrementButton")}
            aria-label="Decrement"
            onClick={(event) => applyStep(event, -1)}
          >
            -
          </button>
        </span>
      )}
    </span>
  );
});
