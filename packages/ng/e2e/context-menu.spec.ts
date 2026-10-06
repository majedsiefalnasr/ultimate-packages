import { expect, test, type Page } from "@playwright/test";
import { storyUrl } from "./accessibility-envelope";

/**
 * GAP-064 C2-0 (Spec §9 AC2–AC3): real-browser layout checks for
 * UContextMenu's post-render positioning and its non-global host trigger.
 * Layout assertions only — no screenshot and no accessibility scan.
 * Unit tests (src/context-menu/context-menu.spec.ts) cover the timing,
 * flip and early-hide cases.
 */

async function open(page: Page, storyId: string): Promise<void> {
  await page.goto(storyUrl(storyId));
  await expect(page.locator("u-context-menu")).toBeAttached();
  await page.mouse.move(0, 0); // ADR-052 X-6: no pointer residue before interacting
}

type Box = { x: number; y: number; width: number; height: number };

/**
 * A point inside the viewport and outside the host box, derived from the
 * host's geometry: below it, else to its right, else above it, else to its
 * left (each 20px clear of the edge and at least 5px inside the viewport).
 * Throws if none fits, so the test cannot silently click inside the host.
 */
function outsidePoint(
  host: Box,
  viewport: { width: number; height: number }
): { x: number; y: number } {
  const gap = 20;
  const margin = 5;
  const midX = Math.round(
    Math.min(Math.max(host.x + host.width / 2, margin), viewport.width - margin - 1)
  );
  const midY = Math.round(
    Math.min(Math.max(host.y + host.height / 2, margin), viewport.height - margin - 1)
  );
  const below = Math.round(host.y + host.height + gap);
  if (below <= viewport.height - margin - 1) return { x: midX, y: below };
  const right = Math.round(host.x + host.width + gap);
  if (right <= viewport.width - margin - 1) return { x: right, y: midY };
  const above = Math.round(host.y - gap);
  if (above >= margin) return { x: midX, y: above };
  const left = Math.round(host.x - gap);
  if (left >= margin) return { x: left, y: midY };
  throw new Error("no in-viewport point outside the host");
}

async function menuTopLeft(page: Page): Promise<{ x: number; y: number }> {
  const menu = page.locator(".u-contextmenu");
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box, "menu bounding box").not.toBeNull();
  return { x: Math.round(box!.x), y: Math.round(box!.y) };
}

test.describe("Ng/ContextMenu C2-0", () => {
  test("Global: opens at the pointer + 1px, identically across three opens", async ({ page }) => {
    await open(page, "ng-contextmenu--global");
    for (let run = 0; run < 3; run++) {
      await page.mouse.click(300, 200, { button: "right" });
      await expect.poll(() => menuTopLeft(page)).toEqual({ x: 301, y: 201 });
      await page.mouse.click(1200, 680); // outside left-click dismisses
      await expect(page.locator(".u-contextmenu")).toHaveCount(0);
    }
  });

  test("Global: a second right-click while open repositions the menu", async ({ page }) => {
    await open(page, "ng-contextmenu--global");
    await page.mouse.click(300, 200, { button: "right" });
    await expect.poll(() => menuTopLeft(page)).toEqual({ x: 301, y: 201 });
    await page.mouse.click(500, 320, { button: "right" });
    await expect.poll(() => menuTopLeft(page)).toEqual({ x: 501, y: 321 });
  });

  test("Default: a right-click inside the host hit area opens the menu at the pointer", async ({
    page,
  }) => {
    await open(page, "ng-contextmenu--default");
    const host = await page.locator("u-context-menu").boundingBox();
    expect(host, "host bounding box").not.toBeNull();
    expect(host!.height).toBeGreaterThan(50);
    const x = Math.round(host!.x + 40);
    const y = Math.round(host!.y + 30);
    await page.mouse.click(x, y, { button: "right" });
    await expect.poll(() => menuTopLeft(page)).toEqual({ x: x + 1, y: y + 1 });
    await page.mouse.click(1200, 680);
    await expect(page.locator(".u-contextmenu")).toHaveCount(0);
  });

  test("Default: a right-click outside the host does not open the menu", async ({ page }) => {
    await open(page, "ng-contextmenu--default");
    const host = await page.locator("u-context-menu").boundingBox();
    expect(host, "host bounding box").not.toBeNull();
    const viewport = page.viewportSize();
    expect(viewport, "viewport size").not.toBeNull();
    const point = outsidePoint(host!, viewport!);
    // the chosen point is inside the viewport and outside the host box
    expect(point.x).toBeGreaterThanOrEqual(0);
    expect(point.x).toBeLessThan(viewport!.width);
    expect(point.y).toBeGreaterThanOrEqual(0);
    expect(point.y).toBeLessThan(viewport!.height);
    const insideHost =
      point.x >= host!.x &&
      point.x <= host!.x + host!.width &&
      point.y >= host!.y &&
      point.y <= host!.y + host!.height;
    expect(insideHost, `point ${point.x},${point.y} must be outside the host`).toBe(false);
    await page.mouse.click(point.x, point.y, { button: "right" });
    // let a regression's post-render open land before asserting the negative
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    );
    await expect(page.locator(".u-contextmenu")).toHaveCount(0);
  });
});
