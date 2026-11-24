import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { multiStateCheckboxStyleModule } from "./multi-state-checkbox-style";

export interface UMultiStateCheckboxChangeEvent<V = unknown> {
  originalEvent: React.SyntheticEvent;
  value: V | null;
  stopPropagation: () => void;
  preventDefault: () => void;
  target: { name?: string; id?: string; value: V | null };
}

export interface UMultiStateCheckboxHandle {
  /** Moves focus to the focusable checkbox element. */
  focus: () => void;
  /** Returns the root element. */
  getElement: () => HTMLDivElement | null;
}

export interface UMultiStateCheckboxProps<T = unknown, V = T> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "onFocus" | "onBlur" | "children"
> {
  value: V | null;
  options: T[];
  onChange?: (event: UMultiStateCheckboxChangeEvent<V>) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  optionValue?: string;
  optionLabel?: string;
  optionIcon?: (option: T) => React.ReactNode;
  empty?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  variant?: "filled" | "outlined";
  /** Form field name, reported in `event.target.name`. */
  name?: string;
  autoFocus?: boolean;
  /** Text announced and used as the accessible name when nothing is selected. Defaults to `Not Selected`. */
  nullLabel?: string;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for `root`, `box`, `icon` and `srOnlyAria`. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
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
 * Fully-controlled (`value`/`onChange`). Real source renders a nested
 * `<Checkbox>` and force-advances `value` once on mount when
 * `!empty && value === null`. This port renders its own `role="checkbox"`
 * box (no `UCheckbox` dependency, like `UTriStateCheckbox`) and does not emit
 * a synthetic `onChange` on mount: the consumer sets a non-null initial
 * `value` instead (ADR-099). Click and Space both honour `disabled` and
 * `readOnly`; real source's Space handler ignores `readOnly`. `tooltip` is
 * composition (`UTooltip`), not a prop.
 */
function UMultiStateCheckboxInner<T = unknown, V = T>(
  props: UMultiStateCheckboxProps<T, V>,
  ref: React.ForwardedRef<UMultiStateCheckboxHandle>
): React.ReactElement {
  const {
    value,
    options,
    onChange,
    onFocus,
    onBlur,
    optionValue,
    optionLabel,
    optionIcon,
    empty = true,
    disabled = false,
    readOnly = false,
    invalid = false,
    variant,
    name,
    id,
    tabIndex = 0,
    autoFocus = false,
    nullLabel = "Not Selected",
    className,
    unstyled,
    pt,
    ptOptions,
    ...rest
  } = props;
  const { cx } = useComponentBase({
    componentName: "multistatecheckbox",
    styleModule: multiStateCheckboxStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("multistatecheckbox", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const boxRef = React.useRef<HTMLDivElement | null>(null);

  React.useImperativeHandle(ref, () => ({
    focus: () => boxRef.current?.focus(),
    getElement: () => rootRef.current,
  }));

  React.useEffect(() => {
    if (autoFocus) boxRef.current?.focus();
  }, []);

  const selectedIndex = options.findIndex(
    (option) => getOptionValue(option, optionValue) === value
  );
  const selectedOption = selectedIndex !== -1 ? options[selectedIndex] : undefined;
  const selectedLabel = selectedOption ? getOptionLabel(selectedOption, optionLabel) : nullLabel;

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
    onChange?.({
      originalEvent: event,
      value: nextValue,
      stopPropagation: () => event.stopPropagation(),
      preventDefault: () => event.preventDefault(),
      target: { name, id, value: nextValue },
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === "Space" || event.key === " ") {
      toggle(event);
      event.preventDefault();
    }
  };

  const ariaProps: Record<string, unknown> = {};
  const rootRest: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(rest)) {
    if (key.startsWith("aria-")) ariaProps[key] = entry;
    else rootRest[key] = entry;
  }

  return (
    <div
      ref={rootRef}
      id={id}
      {...mergeProps(
        rootRest,
        {
          className: [
            cx("root", { disabled, invalid, variantFilled: variant === "filled" }),
            className,
          ]
            .filter(Boolean)
            .join(" "),
          "data-p-disabled": disabled || undefined,
        },
        ptm("root")
      )}
    >
      <div
        ref={boxRef}
        {...mergeProps(
          {
            id: id ? `${id}_box` : undefined,
            className: cx("box"),
            role: "checkbox",
            "aria-checked": selectedOption ? "true" : "false",
            "aria-label": selectedLabel,
            "aria-invalid": invalid || undefined,
            "aria-disabled": disabled || undefined,
            "aria-readonly": readOnly || undefined,
            tabIndex: disabled ? -1 : tabIndex,
            onClick: toggle,
            onKeyDown: handleKeyDown,
            onFocus,
            onBlur,
          },
          ariaProps,
          ptm("box")
        )}
      >
        {selectedOption && optionIcon ? (
          <span {...mergeProps({ className: cx("icon") }, ptm("icon"))}>
            {optionIcon(selectedOption)}
          </span>
        ) : null}
      </div>
      <span
        {...mergeProps(
          { className: "u-hidden-accessible", "aria-live": "polite" },
          ptm("srOnlyAria")
        )}
      >
        {selectedLabel}
      </span>
    </div>
  );
}

export const UMultiStateCheckbox = React.forwardRef(UMultiStateCheckboxInner) as <
  T = unknown,
  V = T,
>(
  props: UMultiStateCheckboxProps<T, V> & React.RefAttributes<UMultiStateCheckboxHandle>
) => React.ReactElement;
