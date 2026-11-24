import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { inputSwitchStyleModule } from "./input-switch-style";

export interface UInputSwitchChangeEvent {
  originalEvent: React.ChangeEvent<HTMLInputElement>;
  value: unknown;
  stopPropagation: () => void;
  preventDefault: () => void;
  target: { name?: string; id?: string; value: unknown };
}

export interface UInputSwitchHandle {
  /** Moves focus to the native input. */
  focus: () => void;
  /** Returns the root element. */
  getElement: () => HTMLDivElement | null;
  /** Returns the native input. */
  getInput: () => HTMLInputElement | null;
}

export interface UInputSwitchProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "onFocus" | "onBlur" | "children"
> {
  checked: unknown;
  trueValue?: unknown;
  falseValue?: unknown;
  onChange?: (event: UInputSwitchChangeEvent) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  inputId?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the `root`, `input`, `slider` and `handle` sections. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `InputSwitch` component (see
 * `.vendor-extracted/react/inputswitch/InputSwitch.js`). PrimeReact names this
 * capability `InputSwitch`, not `ToggleSwitch`; this component follows that
 * framework-native name, and the shared styles use the ToggleSwitch classes.
 *
 * Fully-controlled via `checked`/`onChange`; `checked` is compared against
 * `trueValue`, as in the real source. Renders a native
 * `<input type="checkbox" role="switch">` plus a `.u-toggle-switch-slider` and
 * `.u-toggle-switch-handle`. `aria-*` props go on the input, `tabIndex` on the
 * input, and every other prop on the root. `onFocus` and `onBlur` are the
 * input's. The change event carries `stopPropagation`, `preventDefault` and
 * `target`. The ref exposes `focus()`, `getElement()` and `getInput()`.
 *
 * The CSS is the shared `@ultimate/uix-styles/toggleswitch` module on the Aura
 * `toggleswitch` tokens, registered under that key (ADR-067, ADR-082).
 *
 * Deliberately excludes the root `role="checkbox"` wrapper and the `tooltip`
 * props (composition through `UTooltip`); both are recorded in the ToggleSwitch
 * ADR.
 */
export const UInputSwitch = React.forwardRef<UInputSwitchHandle, UInputSwitchProps>(
  function UInputSwitch(props, ref) {
    const {
      checked,
      trueValue = true,
      falseValue = false,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      invalid = false,
      name,
      id,
      inputId,
      inputRef,
      tabIndex,
      autoFocus = false,
      className,
      unstyled,
      pt,
      ptOptions,
      ...rest
    } = props;
    const { cx } = useComponentBase({
      componentName: "toggleswitch",
      styleModule: inputSwitchStyleModule,
      unstyled,
    });
    const { ptm } = createPassThrough("toggleswitch", { props: { pt, ptOptions } });
    const mergeProps = useMergeProps();
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const internalInputRef = React.useRef<HTMLInputElement | null>(null);

    const setInputRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        internalInputRef.current = node;
        if (typeof inputRef === "function") {
          inputRef(node);
        } else if (inputRef) {
          (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [inputRef]
    );

    React.useImperativeHandle(ref, () => ({
      focus: () => internalInputRef.current?.focus(),
      getElement: () => rootRef.current,
      getInput: () => internalInputRef.current,
    }));

    const ariaProps: Record<string, unknown> = {};
    const rootProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (key.startsWith("aria-")) ariaProps[key] = value;
      else rootProps[key] = value;
    }

    const isChecked = checked === trueValue;

    const handleChange = (originalEvent: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || !onChange) return;
      const value = isChecked ? falseValue : trueValue;
      onChange({
        originalEvent,
        value,
        stopPropagation: () => originalEvent.stopPropagation(),
        preventDefault: () => originalEvent.preventDefault(),
        target: { name, id, value },
      });
    };

    return (
      <div
        ref={rootRef}
        {...mergeProps(
          {
            id,
            className: [cx("root", { checked: isChecked, disabled, invalid }), className]
              .filter(Boolean)
              .join(" "),
            "data-p-highlight": isChecked,
            "data-p-disabled": disabled,
          },
          rootProps,
          ptm("root")
        )}
      >
        <input
          ref={setInputRef}
          {...mergeProps(
            {
              type: "checkbox",
              role: "switch",
              id: inputId,
              className: cx("input"),
              name,
              checked: isChecked,
              disabled,
              tabIndex,
              autoFocus,
              "aria-invalid": invalid || undefined,
              "aria-checked": isChecked,
              onChange: handleChange,
              onFocus,
              onBlur,
              ...ariaProps,
            },
            ptm("input")
          )}
        />
        <span {...mergeProps({ className: cx("slider") }, ptm("slider"))}>
          <span {...mergeProps({ className: cx("handle") }, ptm("handle"))} />
        </span>
      </div>
    );
  }
);
