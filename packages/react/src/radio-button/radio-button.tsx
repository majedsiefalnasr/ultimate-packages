import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { radioButtonStyleModule } from "./radio-button-style";

export interface URadioButtonChangeEvent {
  originalEvent: React.ChangeEvent<HTMLInputElement>;
  value: unknown;
  checked: boolean;
  target: { type: "radio"; name?: string; id?: string; value: unknown; checked: boolean };
}

export interface URadioButtonProps {
  checked: boolean;
  value?: unknown;
  onChange?: (event: URadioButtonChangeEvent) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  name?: string;
  id?: string;
  inputId?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `RadioButton` component (see
 * `.vendor-extracted/react/radiobutton/RadioButton.js`). Fully-controlled
 * via `checked`/`onChange` (real PrimeReact source: `onChange` fires with a
 * `checked: !checked` event only, never auto-flipping internal state — this
 * component follows the same fully-controlled discipline `UCheckbox`
 * already establishes for React, matching this codebase's confirmed
 * architectural fact that React has no shared form-state base class,
 * §7 of the governing spec).
 *
 * Deliberately excludes upstream's `tooltip`/`tooltipOptions` (would require
 * importing `UTooltip` the way `UCheckbox` does — outside this task's
 * minimal Checkbox-pattern surface) and `required`/`style` — matching the
 * same "deliberately excludes a much larger prop surface" precedent already
 * established by `UCheckbox`.
 */
export function URadioButton({
  checked,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  invalid = false,
  name,
  id,
  inputId,
  inputRef,
  autoFocus = false,
  className,
}: URadioButtonProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "radio-button", styleModule: radioButtonStyleModule });
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

  const handleChange = (originalEvent: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || readOnly || !onChange) return;
    const nextChecked = !checked;
    onChange({
      originalEvent,
      value,
      checked: nextChecked,
      target: { type: "radio", name, id, value, checked: nextChecked },
    });
  };

  return (
    <div id={id} className={[cx("root", { checked }), className].filter(Boolean).join(" ")}>
      <input
        ref={setInputRef}
        type="radio"
        id={inputId}
        className={cx("input")}
        name={name}
        checked={checked}
        disabled={disabled}
        readOnly={readOnly}
        autoFocus={autoFocus}
        aria-invalid={invalid}
        onChange={handleChange}
      />
      <div className={cx("box", { checked })}>
        <div className={cx("icon")} />
      </div>
    </div>
  );
}
