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
  position?: 'top' | 'bottom' | 'left' | 'right';
  /**
   * When present, it specifies that the tooltip should be disabled.
   */
  disabled?: boolean;
}
