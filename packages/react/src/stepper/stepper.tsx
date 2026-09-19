import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { stepperStyleModule } from "./stepper-style";
import { UStepperPanel, type UStepperPanelProps } from "./stepper-panel";

export interface UStepperProps {
  /** Active step index. */
  activeStep?: number;
  /** When enabled, prevents activating a step ahead of the active one. */
  linear?: boolean;
  /** Callback invoked when the active step changes. */
  onChangeStep?: (event: { originalEvent: React.SyntheticEvent | undefined; index: number }) => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Stepper` component (see
 * `.vendor-extracted/react/stepper/Stepper.js`). Real PrimeReact's own
 * decomposition for this capability is `Stepper` + `StepperPanel`
 * (verified this task's Step 1) — `Stepper` reads each `StepperPanel`
 * child's own `header`/`disabled` props and renders headers + content
 * panes itself; `StepperPanel` is a thin marker, matching real source's
 * own `isStep`/`getStepProp` children-introspection pattern.
 *
 * `linear` gates every non-active step's header as disabled (matching
 * real PrimeReact's own `isItemDisabled = linear && !isStepActive`);
 * validation-gating for progression is the host's own responsibility via
 * a `UStepperPanel`'s render-prop `children` function receiving
 * `nextCallback`.
 */
export const UStepper = React.forwardRef<HTMLDivElement, UStepperProps>(function UStepper(
  { activeStep: activeStepProp = 0, linear = false, onChangeStep, children, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "stepper", styleModule: stepperStyleModule });
  const [activeStepState, setActiveStepState] = React.useState(activeStepProp);

  React.useEffect(() => {
    setActiveStepState(activeStepProp);
  }, [activeStepProp]);

  const panels = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<UStepperPanelProps> => React.isValidElement(child) && child.type === UStepperPanel
  );

  const isStepActive = (index: number) => activeStepState === index;
  const isItemDisabled = (index: number) => linear && !isStepActive(index);

  const updateActiveStep = (event: React.SyntheticEvent | undefined, index: number) => {
    setActiveStepState(index);
    onChangeStep?.({ originalEvent: event, index });
  };

  const onHeaderClick = (event: React.MouseEvent, index: number) => {
    if (linear && !isStepActive(index)) {
      event.preventDefault();
      return;
    }
    if (panels[index]?.props.disabled) return;
    updateActiveStep(event, index);
  };

  const prevCallback = (event: React.SyntheticEvent, index: number) => {
    if (index !== 0) updateActiveStep(event, index - 1);
  };

  const nextCallback = (event: React.SyntheticEvent, index: number) => {
    if (index !== panels.length - 1) updateActiveStep(event, index + 1);
  };

  return (
    <div ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")} role="tablist">
      <ul className={cx("nav")}>
        {panels.map((panel, index) => {
          const active = isStepActive(index);
          const disabled = isItemDisabled(index) || !!panel.props.disabled;
          return (
            <li key={index} className={cx("header", { active, disabled })} data-u-active={active} data-u-disabled={disabled} aria-current={active ? "step" : undefined}>
              <button type="button" className={cx("headerAction")} disabled={disabled} onClick={(event) => onHeaderClick(event, index)}>
                <span className={cx("headerNumber")}>{index + 1}</span>
                <span className={cx("headerTitle")}>{panel.props.header}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className={cx("panels")}>
        {panels.map((panel, index) => {
          const active = isStepActive(index);
          const content =
            typeof panel.props.children === "function"
              ? (panel.props.children as (props: { index: number; active: boolean; prevCallback: (e: React.SyntheticEvent) => void; nextCallback: (e: React.SyntheticEvent) => void }) => React.ReactNode)({
                  index,
                  active,
                  prevCallback: (event) => prevCallback(event, index),
                  nextCallback: (event) => nextCallback(event, index),
                })
              : panel.props.children;
          return (
            <div key={index} className={cx("panel")} role="tabpanel" data-u-hidden={!active} hidden={!active}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
});
