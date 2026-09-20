import * as React from "react";

export interface UStepperPanelRenderProps {
  index: number;
  active: boolean;
  prevCallback: (event: React.SyntheticEvent) => void;
  nextCallback: (event: React.SyntheticEvent) => void;
}

export interface UStepperPanelProps {
  /** Title of the step header. */
  header?: React.ReactNode;
  /** Whether this step is disabled. */
  disabled?: boolean;
  /** Static content, or a render-prop function receiving `prevCallback`/`nextCallback` for validation-gated progression. */
  children?: React.ReactNode | ((props: UStepperPanelRenderProps) => React.ReactNode);
}

/**
 * Ultimate-owned adaptation of PrimeReact's `StepperPanel` marker
 * component (see `.vendor-extracted/react/stepperpanel/StepperPanel.js`).
 * Never rendered directly — `UStepper` reads each child's own props
 * (`header`/`disabled`) and renders its own header button + content pane,
 * matching real PrimeReact's own children-based composition.
 *
 * `children` may be a render-prop function receiving `prevCallback`/
 * `nextCallback` (mirrors real PrimeReact's own `StepperContent`
 * `template` component, which receives the same two callbacks) — this is
 * this capability's validation-gating hook point: a "Next" button rendered
 * via the render-prop form can withhold calling `nextCallback` until its
 * own step's content is valid.
 */
export const UStepperPanel: React.FC<UStepperPanelProps> = () => null;
UStepperPanel.displayName = "UStepperPanel";
