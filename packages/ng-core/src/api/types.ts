/**
 * MenuItem interface for UMenu component.
 * Subset of PrimeNG's MenuItem containing only the fields actually used by Task 15's UMenu template.
 * @group Interface
 */
export interface UMenuItem {
  /**
   * Text of the item.
   */
  label?: string;
  /**
   * Icon of the item.
   */
  icon?: string;
  /**
   * External URL for navigation, used when `routerLink` is not set.
   */
  url?: string;
  /**
   * RouterLink definition for internal navigation.
   */
  routerLink?: string | string[];
  /**
   * Callback to execute when item is clicked.
   */
  command?: (event: unknown) => void;
  /**
   * An array of children menuitems.
   */
  items?: UMenuItem[];
  /**
   * Defines the item as a separator.
   */
  separator?: boolean;
  /**
   * When set as true, disables the menuitem.
   */
  disabled?: boolean;
  /**
   * Whether the item is visible. Defaults to `true` when unset.
   */
  visible?: boolean;
  /**
   * Target of the link, e.g. `_blank` to open in a new window.
   */
  target?: string;
  /**
   * Optional tooltip text shown on hover/focus. Real PrimeNG gates its
   * equivalent behind `showOnEllipsis` (truncation-only), which is out of
   * `UTooltip`'s scope (Task 13) — this field makes the tooltip explicitly
   * opt-in per item instead of applying `[uTooltip]="item.label"`
   * unconditionally, which would show a redundant tooltip duplicating the
   * visible label on every item regardless of whether it's truncated.
   */
  tooltip?: string;
}

/**
 * Tooltip configuration options for UTooltip component.
 * Subset of PrimeNG's TooltipOptions containing only the fields used by Task 13's UTooltip.
 * @group Interface
 */
export interface UTooltipOptions {
  /**
   * Content of the tooltip.
   */
  value: string;
  /**
   * Position of the tooltip.
   */
  position?: "top" | "bottom" | "left" | "right";
  /**
   * When present, it specifies that the tooltip should be disabled.
   */
  disabled?: boolean;
}
