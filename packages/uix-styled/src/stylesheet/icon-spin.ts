import type StyleSheet from "./index";

/** Reserved style key for the shared icon-spin rule (GAP-124). */
export const ICON_SPIN_KEY = "u-icon-spin";

/**
 * PrimeNG 21.1.9 `icons/baseicon/style/baseiconstyle.ts` and PrimeVue 4.5.5
 * `@primevue/icons` `baseicon/style/BaseIconStyle.js` `.p-icon-spin` rule,
 * renamed to Ultimate's `u-` prefix. The `-webkit-` duplicates are omitted;
 * the reduced-motion block is Ultimate-only (GAP-124 D-124-6). Only elements
 * that opt in with the class are matched (GAP-124 D-124-1).
 */
export const iconSpinCss = `
.u-icon-spin {
    animation: u-icon-spin 2s infinite linear;
}

@keyframes u-icon-spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(359deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .u-icon-spin {
        animation: none;
    }
}
`;

/**
 * Registers the shared icon-spin rule into `sheet` once. Called by the
 * Angular and Vue cores from their existing style-registration points;
 * deliberately not called by `react-core` (GAP-124 D-124-5).
 */
export function registerIconSpin(sheet: StyleSheet<any>): void {
  if (!sheet.has(ICON_SPIN_KEY)) {
    sheet.add(ICON_SPIN_KEY, iconSpinCss);
  }
}
