import * as React from "react";

export interface UTabPanelProps {
  /** Title of the tab header. */
  header?: React.ReactNode;
  /** Whether this tab is disabled. */
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `TabPanel` marker component
 * (see `.vendor-extracted/react/tabview/TabView.js`'s own `export const
 * TabPanel = () => {}`). Never rendered directly — `UTabView` reads each
 * child's own props (`header`/`disabled`) and renders its own header
 * button + content pane, matching real PrimeReact's own children-based
 * composition (not a runtime-rendered component).
 */
export const UTabPanel: React.FC<UTabPanelProps> = () => null;
UTabPanel.displayName = "UTabPanel";
