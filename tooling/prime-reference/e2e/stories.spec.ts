import { expect, test } from "@playwright/test";

/** G3E-2: every G3-E verification story renders its root, with no page error and no network image. */
const STORIES: ReadonlyArray<readonly [number, string, string]> = [
  ...(["ng", "vue"] as const).flatMap((fw) => {
    const p = fw === "ng" ? 6001 : 6003;
    return [
      [p, `${fw}-image--default`, ".u-image"],
      [p, `${fw}-image--with-preview`, ".u-image"],
      [p, `${fw}-imagecompare--default`, ".u-image-compare"],
      [p, `${fw}-imagecompare--sized`, ".u-image-compare"],
      [p, `${fw}-imagecompare--rtl`, ".u-image-compare"],
      [p, `${fw}-carousel--vertical`, ".u-carousel-vertical"],
      [p, `${fw}-carousel--rtl`, ".u-carousel"],
      [p, `${fw}-galleria--default`, ".u-galleria"],
      [p, `${fw}-galleria--without-thumbnails`, ".u-galleria"],
      [p, `${fw}-galleria--full-screen`, "button"],
      [p, "data-dataview--default", ".u-data-view"],
      [p, "data-dataview--grid", ".u-data-view-grid"],
      [p, "data-dataview--paginator", ".u-paginator"],
      [p, "data-dataview--empty", ".u-data-view"],
    ] as const;
  }),
  [6001, "data-dataview--loading", "[role=status]"],
  [6001, "data-orderlist--filter", "input[role=searchbox]"],
  [6001, "data-picklist--filter", "input[role=searchbox]"],
  [6003, "panel-organizationchart--single-selection", ".u-organization-chart"],
  [6003, "panel-organizationchart--multiple-selection", ".u-organization-chart"],
  [6003, "panel-organizationchart--collapsible", ".u-organization-chart"],
];

for (const [port, id, root] of STORIES) {
  test(`${id} renders (:${port})`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on(
      "request",
      (r) => r.url().includes("primefaces.org") && errors.push(`network: ${r.url()}`)
    );
    await page.goto(`http://localhost:${port}/iframe.html?id=${id}&viewMode=story`);
    await expect(page.locator(root).first()).toBeAttached();
    for (const img of await page.locator("#storybook-root img").all())
      await expect
        .poll(() => img.evaluate((i: HTMLImageElement) => i.naturalWidth), { message: id })
        .toBe(800);
    expect(errors, id).toEqual([]);
  });
}

test("data-dataview--default renders its item text (Spec §4.1 repair)", async ({ page }) => {
  await page.goto("http://localhost:6001/iframe.html?id=data-dataview--default&viewMode=story");
  await expect(page.locator(".u-data-view-list > li")).toHaveText(["Apple", "Banana"]);
});
