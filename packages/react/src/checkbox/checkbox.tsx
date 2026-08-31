import * as React from "react";
import { useComponentBase, UCheckIcon } from "@ultimate/react-core";
import { UTooltip } from "../tooltip";
import { checkboxStyleModule } from "./checkbox-style";

export interface UCheckboxChangeEvent {
  originalEvent: React.ChangeEvent<HTMLInputElement>;
  value: unknown;
  checked: unknown;
  target: { type: "checkbox"; name?: string; id?: string; value: unknown; checked: unknown };
}

export interface UCheckboxProps {
  checked: unknown;
  trueValue?: unknown;
  falseValue?: unknown;
  onChange?: (event: UCheckboxChangeEvent) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  name?: string;
  value?: unknown;
  id?: string;
  inputId?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  tooltip?: string;
  tooltipOptions?: Record<string, unknown>;
  autoFocus?: boolean;
  className?: string;
}

export function UCheckbox({
  checked,
  trueValue = true,
  falseValue = false,
  onChange,
  disabled = false,
  readOnly = false,
  invalid = false,
  name,
  value,
  id,
  inputId,
  inputRef,
  tooltip,
  tooltipOptions,
  autoFocus = false,
  className,
}: UCheckboxProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "checkbox", styleModule: checkboxStyleModule });
  const elementRef = React.useRef<HTMLDivElement | null>(null);
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
    if (disabled || readOnly || !onChange) return;
    const nextValue = isChecked ? falseValue : trueValue;
    onChange({
      originalEvent,
      value,
      checked: nextValue,
      target: { type: "checkbox", name, id, value, checked: nextValue },
    });
  };

  return (
    <>
      <div
        ref={elementRef}
        id={id}
        className={[cx("root", { checked: isChecked }), className].filter(Boolean).join(" ")}
      >
        <input
          ref={setInputRef}
          type="checkbox"
          id={inputId}
          className={cx("input")}
          name={name}
          checked={isChecked}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          aria-invalid={invalid}
          onChange={handleChange}
        />
        <div className={cx("box", { checked: isChecked })}>
          {isChecked && <UCheckIcon className={cx("icon")} />}
        </div>
      </div>
      {tooltip && <UTooltip target={elementRef} content={tooltip} {...tooltipOptions} />}
    </>
  );
}
