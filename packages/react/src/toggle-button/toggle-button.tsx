import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { toggleButtonStyleModule } from "./toggle-button-style";

export interface UToggleButtonChangeEvent {
  originalEvent: React.SyntheticEvent;
  value: boolean;
  target: { name?: string; id?: string; value: boolean };
}

export interface UToggleButtonProps {
  checked: boolean;
  onChange?: (event: UToggleButtonChangeEvent) => void;
  onLabel?: string;
  offLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  name?: string;
  id?: string;
  inputId?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `ToggleButton` component (see
 * `.vendor-extracted/react/togglebutton/ToggleButton.js`). Fully-controlled
 * via `checked`/`onChange`, matching real source's own `toggle()` handler
 * (`props.onChange({..., value: !props.checked})`, never auto-flipping
 * internal state) — same fully-controlled discipline `UCheckbox`/
 * `URadioButton` already establish for React.
 *
 * Renders a native `<input type="checkbox">` (matching real PrimeReact's
 * own template shape: a hidden checkbox input plus a decorative box/label)
 * rather than a `<button>` — real source's own `inputProps` declares
 * `type: 'checkbox'`, not a button element.
 *
 * Deliberately excludes upstream's `onIcon`/`offIcon`/`iconPos`,
 * `tooltip`/`tooltipOptions`, and `style` — outside this task's minimal
 * Checkbox-pattern surface, matching the same "deliberately excludes a much
 * larger prop surface" precedent already established by `UCheckbox`.
 */
export function UToggleButton({
  checked,
  onChange,
  onLabel = "Yes",
  offLabel = "No",
  disabled = false,
  readOnly = false,
  invalid = false,
  name,
  id,
  inputId,
  autoFocus = false,
  className,
}: UToggleButtonProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "toggle-button", styleModule: toggleButtonStyleModule });

  const hasLabel = onLabel.length > 0 && offLabel.length > 0;
  const label = hasLabel ? (checked ? onLabel : offLabel) : " ";

  const toggle = (originalEvent: React.SyntheticEvent) => {
    if (disabled || readOnly || !onChange) return;
    const value = !checked;
    onChange({ originalEvent, value, target: { name, id, value } });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " " || event.key === "Enter") {
      toggle(event);
    }
  };

  return (
    <div
      id={id}
      className={[cx("root", { checked, disabled }), className].filter(Boolean).join(" ")}
      data-p-highlight={checked}
      data-p-disabled={disabled}
    >
      <input
        type="checkbox"
        id={inputId}
        className={cx("input")}
        name={name}
        checked={checked}
        disabled={disabled}
        readOnly={readOnly}
        autoFocus={autoFocus}
        aria-invalid={invalid}
        onChange={toggle}
        onKeyDown={onKeyDown}
      />
      <div className={cx("box", { checked })}>
        <span className={cx("label")}>{label}</span>
      </div>
    </div>
  );
}
