import { expect, type Locator } from "@playwright/test";

/**
 * Shared W1 helper (ADR-067): asserts that an element's computed CSS property
 * equals the value the Aura preset resolves for a `dt()` token path.
 *
 * `@ultimate/themes` has no preset-value resolver, so the expected value is
 * derived in the page. `presetPath` is the same dotted path the component
 * style passes to `dt()` (for example `toolbar.border.color`); it maps to the
 * `--u-<path with dots as dashes>` custom property the theme registers. A
 * temporary probe element in the same document receives `cssProperty` set to
 * `var(--u-...)`, so the browser itself does the unit and colour resolution.
 *
 * The caller sets the colour scheme first, with `page.emulateMedia({ colorScheme })`.
 */
export async function expectAuraValue(
  locator: Locator,
  cssProperty: string,
  presetPath: string
): Promise<void> {
  const variable = `--u-${presetPath.replace(/\./g, "-")}`;
  const { actual, expected, defined } = await locator.evaluate(
    (target, args) => {
      const probe = target.ownerDocument.createElement("div");
      probe.style.setProperty(args.cssProperty, `var(${args.variable})`);
      target.ownerDocument.body.appendChild(probe);
      try {
        const probeStyle = getComputedStyle(probe);
        return {
          actual: getComputedStyle(target).getPropertyValue(args.cssProperty),
          expected: probeStyle.getPropertyValue(args.cssProperty),
          defined: probeStyle.getPropertyValue(args.variable).trim(),
        };
      } finally {
        probe.remove();
      }
    },
    { cssProperty, variable }
  );

  // An undefined variable makes the probe fall back to the property's initial
  // value, which would be non-empty yet meaningless: require the token itself.
  expect(defined, `${variable} is defined by the applied theme`).not.toBe("");
  expect(expected, `probe ${cssProperty} from var(${variable})`).not.toBe("");
  expect(actual, `${cssProperty} equals Aura ${presetPath}`).toBe(expected);
}
