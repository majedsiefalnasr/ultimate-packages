import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  UCheckIcon,
  UTimesIcon,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { triStateCheckboxStyleModule } from "./tri-state-checkbox-style";

export interface UTriStateCheckboxChangeEvent {
  originalEvent: React.SyntheticEvent;
  value: boolean | null;
  stopPropagation: () => void;
  preventDefault: () => void;
  target: { name?: string; id?: string; value: boolean | null };
}

export interface UTriStateCheckboxHandle {
  /** Moves focus to the focusable checkbox element. */
  focus: () => void;
  /** Returns the root element. */
  getElement: () => HTMLDivElement | null;
}

export interface UTriStateCheckboxProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "onFocus" | "onBlur" | "children"
> {
  value: boolean | null;
  onChange?: (event: UTriStateCheckboxChangeEvent) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  variant?: "filled" | "outlined";
  /** Form field name, reported in `event.target.name`. */
  name?: string;
  /** Id of the hidden input, so a `<label htmlFor>` can cycle the value. */
  inputId?: string;
  autoFocus?: boolean;
  /** Replaces the icon shown when the value is `true`. */
  checkIcon?: React.ReactNode;
  /** Replaces the icon shown when the value is `false`. */
  uncheckIcon?: React.ReactNode;
  /** Live-region text announced when the value is `true`. Defaults to `True`. */
  trueLabel?: string;
  /** Live-region text announced when the value is `false`. Defaults to `False`. */
  falseLabel?: string;
  /** Live-region text announced when the value is `null`. Defaults to `Not Selected`. */
  nullLabel?: string;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for `root`, `box`, `input`, `srOnlyAria`, `checkIcon` and `uncheckIcon`. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `TriStateCheckbox` (real
 * source: `components/lib/tristatecheckbox/TriStateCheckbox.js`/
 * `TriStateCheckboxBase.js`). A three-state (`true`/`false`/`null`)
 * checkbox: each click/Space/Enter cycles `null -> true -> false -> null`,
 * matching real source's own `onChange` cycle.
 *
 * Fully-controlled (`value`/`onChange`). Real source keeps an internal
 * `checkBoxValue` state resynced from `props.value`; this port derives the
 * displayed state from the `value` prop on every render, and treats any value
 * other than `true`/`false` as `null`, as real source does.
 *
 * The hidden input ignores pointer events, so mouse clicks reach the box. It
 * still cycles the value when a `<label htmlFor={inputId}>` activates it, and
 * hands focus to the box. `aria-*` props go on the focusable box, the rest on
 * the root. `tooltip` is composition (`UTooltip`), not a prop (ADR-096).
 */
export const UTriStateCheckbox = React.forwardRef<UTriStateCheckboxHandle, UTriStateCheckboxProps>(
  function UTriStateCheckbox(props, ref) {
    const {
      value: rawValue,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      readOnly = false,
      invalid = false,
      variant,
      name,
      id,
      inputId,
      tabIndex = 0,
      autoFocus = false,
      checkIcon,
      uncheckIcon,
      trueLabel = "True",
      falseLabel = "False",
      nullLabel = "Not Selected",
      className,
      unstyled,
      pt,
      ptOptions,
      ...rest
    } = props;
    const { cx } = useComponentBase({
      componentName: "tristatecheckbox",
      styleModule: triStateCheckboxStyleModule,
      unstyled,
    });
    const { ptm } = createPassThrough("tristatecheckbox", { props: { pt, ptOptions } });
    const mergeProps = useMergeProps();
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const boxRef = React.useRef<HTMLDivElement | null>(null);

    const value = rawValue === true || rawValue === false ? rawValue : null;

    React.useImperativeHandle(ref, () => ({
      focus: () => boxRef.current?.focus(),
      getElement: () => rootRef.current,
    }));

    React.useEffect(() => {
      if (autoFocus) boxRef.current?.focus();
    }, []);

    const cycle = (event: React.SyntheticEvent) => {
      if (disabled || readOnly) return;
      const next: boolean | null = value === null ? true : value === true ? false : null;
      onChange?.({
        originalEvent: event,
        value: next,
        stopPropagation: () => event.stopPropagation(),
        preventDefault: () => event.preventDefault(),
        target: { name, id, value: next },
      });
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.code === "Enter" || event.code === "NumpadEnter" || event.code === "Space") {
        cycle(event);
        event.preventDefault();
      }
    };

    const ariaProps: Record<string, unknown> = {};
    const rootRest: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(rest)) {
      if (key.startsWith("aria-")) ariaProps[key] = entry;
      else rootRest[key] = entry;
    }

    const iconProps = (section: "checkIcon" | "uncheckIcon") =>
      mergeProps({ className: cx("icon") }, ptm(section)) as { className?: string };
    const icon =
      value === true
        ? (checkIcon ?? <UCheckIcon className={iconProps("checkIcon").className} />)
        : value === false
          ? (uncheckIcon ?? <UTimesIcon className={iconProps("uncheckIcon").className} />)
          : null;
    const announcement = value === true ? trueLabel : value === false ? falseLabel : nullLabel;

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
        <input
          {...mergeProps(
            {
              id: inputId,
              className: cx("input"),
              type: "checkbox",
              name,
              checked: value === true,
              readOnly,
              disabled,
              "aria-hidden": true,
              tabIndex: -1,
              onChange: cycle,
              onFocus: () => boxRef.current?.focus(),
            },
            ptm("input")
          )}
        />
        <span
          {...mergeProps(
            { className: "u-hidden-accessible", "aria-live": "polite" },
            ptm("srOnlyAria")
          )}
        >
          {announcement}
        </span>
        <div
          ref={boxRef}
          {...mergeProps(
            {
              id: id ? `${id}_box` : undefined,
              className: cx("box"),
              role: "checkbox",
              "aria-checked": value === true ? "true" : value === false ? "false" : "mixed",
              "aria-invalid": invalid || undefined,
              tabIndex: disabled ? -1 : tabIndex,
              onClick: cycle,
              onKeyDown: handleKeyDown,
              onFocus,
              onBlur,
            },
            ariaProps,
            ptm("box")
          )}
        >
          {icon}
        </div>
      </div>
    );
  }
);
