import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";
import { expectAuraValue } from "./aura-tokens";

/**
 * Workstream 1 pilot (ADR-067, Option B): the React Toolbar consumes Aura
 * preset tokens through `dt()` instead of literal fallbacks. Expected values
 * are the Aura `toolbar.*` tokens resolved by the browser (see `aura-tokens.ts`).
 */
const ROOT = ".u-toolbar";
const TOKENS: ReadonlyArray<[cssProperty: string, presetPath: string]> = [
  ["background-color", "toolbar.background"],
  ["border-color", "toolbar.border.color"],
  ["border-radius", "toolbar.border.radius"],
  ["gap", "toolbar.gap"],
  ["padding", "toolbar.padding"],
];

test.describe("React/Toolbar W1", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`toolbar root uses Aura tokens (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(storyUrl("react-toolbar--default"));
      const root = page.locator(ROOT);
      await expect(root).toBeVisible();
      for (const [cssProperty, presetPath] of TOKENS) {
        await expectAuraValue(root, cssProperty, presetPath);
      }
    });
  }

  test("consumer style wins", async ({ page }) => {
    await page.goto(storyUrl("react-toolbar--with-consumer-style"));
    const root = page.locator(ROOT);
    await expect(root).toBeVisible();
    await expect(root).toHaveCSS("background-color", "rgb(1, 2, 3)");
  });

  test("toolbar follows a scheme change after render", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(storyUrl("react-toolbar--default"));
    const root = page.locator(ROOT);
    await expect(root).toBeVisible();
    await expectAuraValue(root, "background-color", "toolbar.background");
    const light = await root.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.emulateMedia({ colorScheme: "dark" });
    await expect
      .poll(() => root.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe(light);
    await expectAuraValue(root, "background-color", "toolbar.background");
  });
});
