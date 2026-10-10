import { expect, type Page } from "@playwright/test";
import type { Action, Fact } from "../cases-g3e";

/** Runs a case's actions on one side. `sel` maps part names to that side's selectors. */
export async function run(
  page: Page,
  sel: Record<string, string>,
  actions: Action[] = []
): Promise<void> {
  for (const a of actions) {
    if ("click" in a) await page.locator(sel[a.click]).first().click();
    else if ("press" in a) await page.keyboard.press(a.press);
    else if ("hover" in a) await page.locator(sel[a.hover]).first().hover();
    else if ("focus" in a) await page.locator(sel[a.focus]).first().focus();
    else if ("fill" in a) await page.locator(sel[a.fill[0]]).first().fill(a.fill[1]);
    else if ("range" in a)
      await page
        .locator(sel[a.range[0]])
        .first()
        .evaluate((el, v) => {
          (el as HTMLInputElement).value = String(v);
          el.dispatchEvent(new Event("input", { bubbles: true }));
        }, a.range[1]);
    else if ("advance" in a) await page.clock.runFor(a.advance);
    else if ("drag" in a) {
      // Explicit pointer steps: `dragTo` waits for a stable target, but CDK drag reflows the list.
      const box = async (i: number) => {
        const b = await page.locator(sel[a.drag[0]]).nth(i).boundingBox();
        if (!b) throw new Error(`drag: ${a.drag[0]}[${i}] has no box`);
        return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      };
      const from = await box(a.drag[1]);
      const to = await box(a.drag[2]);
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move(to.x, to.y, { steps: 10 });
      await page.mouse.up();
    }
    await page.waitForTimeout(150);
  }
  await page.mouse.move(0, 0);
}

/** Observable facts, compared Prime ↔ Ultimate. */
export async function facts(
  page: Page,
  sel: Record<string, string>,
  list: Fact[] = []
): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  for (const f of list) {
    if ("shown" in f)
      out[`shown:${f.shown}`] = await page
        .locator(sel[f.shown])
        .first()
        .isVisible()
        .catch(() => false);
    else if ("texts" in f)
      out[`texts:${f.texts}`] = (await page.locator(sel[f.texts]).allTextContents()).map((t) =>
        t.trim()
      );
    else if ("attr" in f)
      out[`attr:${f.attr[0]}.${f.attr[1]}`] = await page
        .locator(sel[f.attr[0]])
        .evaluateAll((els, n) => els.map((e) => e.getAttribute(n)), f.attr[1]);
    else if ("focused" in f)
      out.focused = await page.evaluate((s) => {
        const a = document.activeElement;
        return (
          Object.entries(s).find(([, q]) => a && a !== document.body && a.closest(q))?.[0] ??
          "outside"
        );
      }, sel);
    else if ("direction" in f)
      out[`direction:${f.direction}`] = await page
        .locator(sel[f.direction])
        .first()
        .evaluate((e) => getComputedStyle(e).direction);
  }
  return out;
}

/** Review Focus 1: every image inside the probed root has loaded. */
export async function imagesLoaded(page: Page, root: string): Promise<void> {
  for (const img of await page.locator(`${root} img`).all())
    await expect
      .poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0))
      .toBe(true);
}
