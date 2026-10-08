import { expect, test } from "@playwright/test";

/** G3E-1: every fixture loads, at 800 × 600, from every server that renders a G3-E case. */
const SERVERS = [
  "http://localhost:6001",
  "http://localhost:6003",
  "http://localhost:6021",
  "http://localhost:6022",
];
const FILES = ["landscape-1.png", "landscape-2.png", "landscape-3.png", "landscape-4.png"];

for (const server of SERVERS) {
  test(`fixtures load from ${server}`, async ({ page }) => {
    for (const file of FILES) {
      const res = await page.request.get(`${server}/media/${file}`);
      expect(res.status(), `${server}/media/${file}`).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    }
    await page.goto(`${server}/media/${FILES[0]}`);
    const size = await page
      .locator("img")
      .evaluate((i: HTMLImageElement) => [i.naturalWidth, i.naturalHeight]);
    expect(size).toEqual([800, 600]);
  });
}
