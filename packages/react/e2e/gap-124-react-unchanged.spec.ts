import { expect, test } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

test("GAP-124 React: a React-only page has no icon-spin rule and the loading icon does not animate", async ({
  page,
}) => {
  await page.goto(storyUrl("react-button--loading"));
  const icon = page.locator(".u-button svg.u-icon-spin").first();
  await expect(icon).toBeVisible();
  expect(await icon.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  expect(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll("style")).some((s) =>
        (s.textContent ?? "").includes("@keyframes u-icon-spin")
      )
    )
  ).toBe(false);
});
