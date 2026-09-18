import * as React from "react";
import { useComponentBase, UCheckIcon, UTimesIcon } from "@ultimate/react-core";
import { triStateCheckboxStyleModule } from "./tri-state-checkbox-style";

export interface UTriStateCheckboxChangeEvent {
  originalEvent: React.SyntheticEvent;
  value: boolean | null;
}

export interface UTriStateCheckboxProps {
  value: boolean | null;
  onChange?: (event: UTriStateCheckboxChangeEvent) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  id?: string;
  inputId?: string;
  tabIndex?: number;
  className?: string;
  "aria-label"?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `TriStateCheckbox` (real
 * source: `components/lib/tristatecheckbox/TriStateCheckbox.js`/
 * `TriStateCheckboxBase.js`, extracted this session via
 * `scripts/provenance/extract-primereact-source.mjs`). A three-state
 * (`true`/`false`/`null`) checkbox: each click/Space/Enter cycles
 * `null -> true -> false -> null`, matching real source's own `onChange`
 * cycle exactly (`checkBoxValue === null -> true`,
 * `checkBoxValue === true -> false`, `checkBoxValue === false -> null`).
 *
 * Fully-controlled (`value`/`onChange`), matching React's established
 * no-shared-form-state-base-class convention. Real source keeps an internal
 * `checkBoxValue` state resynced from `props.value` via `useEffect`; this
 * port derives the displayed state directly from the `value` prop on every
 * render instead (no internal state at all), consistent with
 * `UInputOtp`/`checkbox.tsx`'s own "no internal value state" convention —
 * simpler and can't drift from a fully-controlled `value` prop.
 */
export function UTriStateCheckbox({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  invalid = false,
  id,
  inputId,
  tabIndex = 0,
  className,
  "aria-label": ariaLabel,
}: UTriStateCheckboxProps): React.ReactElement {
  const { cx } = useComponentBase({
    componentName: "tri-state-checkbox",
    styleModule: triStateCheckboxStyleModule,
  });

  const cycle = (event: React.SyntheticEvent) => {
    if (disabled || readOnly) return;
    let next: boolean | null;
    if (value === null) next = true;
    else if (value === true) next = false;
    else next = null;
    onChange?.({ originalEvent: event, value: next });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " " || event.code === "Space") {
      cycle(event);
      event.preventDefault();
    }
  };

  const icon = value === true ? <UCheckIcon /> : value === false ? <UTimesIcon /> : null;
  const ariaValueLabel = value === true ? "true" : value === false ? "false" : "none";

  return (
    <div
      id={id}
      className={[cx("root", { disabled, invalid }), className].filter(Boolean).join(" ")}
    >
      <input
        id={inputId}
        type="checkbox"
        className={cx("input")}
        checked={value === true}
        readOnly
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-hidden="true"
        tabIndex={-1}
      />
      <span className="u-hidden-accessible" aria-live="polite">
        {ariaValueLabel}
      </span>
      <div
        className={cx("box")}
        role="checkbox"
        aria-checked={value === true ? "true" : value === false ? "false" : "mixed"}
        aria-label={ariaLabel}
        tabIndex={disabled ? -1 : tabIndex}
        onClick={cycle}
        onKeyDown={handleKeyDown}
      >
        {icon}
      </div>
    </div>
  );
}
