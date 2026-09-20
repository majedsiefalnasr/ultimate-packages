import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { inputSwitchStyleModule } from "./input-switch-style";

export interface UInputSwitchChangeEvent {
  originalEvent: React.ChangeEvent<HTMLInputElement>;
  value: unknown;
  target: { name?: string; id?: string; value: unknown };
}

export interface UInputSwitchProps {
  checked: unknown;
  trueValue?: unknown;
  falseValue?: unknown;
  onChange?: (event: UInputSwitchChangeEvent) => void;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  id?: string;
  inputId?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `InputSwitch` component (see
 * `.vendor-extracted/react/inputswitch/InputSwitch.js`). Real PrimeReact
 * names this capability `InputSwitch`, not `ToggleSwitch` — this component
 * follows React's own framework-native name, per this repo's convention of
 * not forcing unified cross-framework naming (matching PrimeNG's/PrimeVue's
 * separately-built `UToggleSwitch`, which is not a re-export or alias of
 * this component).
 *
 * Fully-controlled via `checked`/`onChange`, matching real source's own
 * `onChange` handler (`props.onChange({..., value: checked ? falseValue :
 * trueValue})`, never auto-flipping internal state) — same fully-controlled
 * discipline `UCheckbox`/`URadioButton`/`UToggleButton` already establish.
 * `checked` here is compared against `trueValue` (`checked ===
 * trueValue`), matching real source's own `const checked = props.checked
 * === props.trueValue;` derivation exactly.
 *
 * Renders a native `<input type="checkbox" role="switch">` plus a
 * `.u-input-switch-slider` handle — matching real source's own two-element
 * template shape (root div, input, slider span).
 *
 * Deliberately excludes upstream's `tooltip`/`tooltipOptions` and `style` —
 * outside this task's minimal Checkbox-pattern surface, matching the same
 * "deliberately excludes a much larger prop surface" precedent already
 * established by `UCheckbox`.
 */
export function UInputSwitch({
  checked,
  trueValue = true,
  falseValue = false,
  onChange,
  disabled = false,
  invalid = false,
  name,
  id,
  inputId,
  inputRef,
  autoFocus = false,
  className,
}: UInputSwitchProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "input-switch", styleModule: inputSwitchStyleModule });
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

  const isChecked = checked === trueValue;

  const handleChange = (originalEvent: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !onChange) return;
    const value = isChecked ? falseValue : trueValue;
    onChange({ originalEvent, value, target: { name, id, value } });
  };

  return (
    <div
      id={id}
      className={[cx("root", { checked: isChecked, disabled }), className].filter(Boolean).join(" ")}
      data-p-highlight={isChecked}
      data-p-disabled={disabled}
    >
      <input
        ref={setInputRef}
        type="checkbox"
        role="switch"
        id={inputId}
        className={cx("input")}
        name={name}
        checked={isChecked}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-invalid={invalid}
        aria-checked={isChecked}
        onChange={handleChange}
      />
      <span className={cx("slider")} />
    </div>
  );
}
