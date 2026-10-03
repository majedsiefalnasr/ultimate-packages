import type StyleSheet from "./index";

/** Reserved style key for the shared hidden-accessible utility (GAP-074). */
export const HIDDEN_ACCESSIBLE_KEY = "u-hidden-accessible";

/**
 * PrimeNG 21.1.9 `base/style/basestyle.ts:8-22` `.p-hidden-accessible`
 * rule and its form-control companion, renamed to Ultimate's `u-` prefix.
 * `u-hidden-focusable` is deliberately NOT styled: as in Prime it is only a
 * selector marker.
 */
export const hiddenAccessibleCss = `
.u-hidden-accessible {
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
}

.u-hidden-accessible input,
.u-hidden-accessible select {
    transform: scale(0);
}
`;

/**
 * Registers the shared hidden-accessible rule into `sheet` once. Purpose-
 * specific: each core calls it from its existing style-registration point,
 * so the rule lands wherever that core already writes styles (per document
 * in Angular, GAP-078). Not a general registration API.
 */
export function registerHiddenAccessible(sheet: StyleSheet<any>): void {
  if (!sheet.has(HIDDEN_ACCESSIBLE_KEY)) {
    sheet.add(HIDDEN_ACCESSIBLE_KEY, hiddenAccessibleCss);
  }
}
