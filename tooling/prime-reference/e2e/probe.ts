import type { Browser, Page } from "@playwright/test";
import type { Framework, Open, State } from "../cases";

/** Reference apps and Ultimate Storybooks (see ../playwright.config.ts). */
const PRIME_ORIGIN: Record<Framework, string> = {
  ng: "http://localhost:6022",
  vue: "http://localhost:6021",
};
const ULTIMATE_ORIGIN: Record<Framework, string> = {
  ng: "http://localhost:6001",
  vue: "http://localhost:6003",
};

export type Side = "prime" | "ultimate";

export interface Target {
  side: Side;
  fw: Framework;
  /** Prime case id or Ultimate story id. */
  ref: string;
  open: Open;
  state?: State;
}

export const url = (t: Target): string =>
  t.side === "prime"
    ? `${PRIME_ORIGIN[t.fw]}/#/${t.ref}`
    : `${ULTIMATE_ORIGIN[t.fw]}/iframe.html?id=${t.ref}&viewMode=story`;

export const container = (side: Side): string => (side === "prime" ? "#root" : "#storybook-root");

/** Waits until no CSS animation/transition is running, twice in a row. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const idle = () => document.getAnimations().every((a) => a.playState !== "running");
    for (let stable = 0, i = 0; stable < 2 && i < 100; i++) {
      await new Promise((r) => setTimeout(r, 50));
      stable = idle() ? stable + 1 : 0;
    }
  });
}

/** Loads a target in a fresh page and applies its open action and state (X-6: pointer parked). */
export async function load(browser: Browser, t: Target): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(url(t));
  await page.locator(container(t.side)).waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  await settle(page);
  if (t.open === "button") {
    await page.getByRole("button", { name: "Show drawer" }).click();
    await settle(page);
  }
  await page.mouse.move(0, 0);
  if (t.state === "tab") await page.keyboard.press("Tab");
  await settle(page);
  return page;
}

/**
 * Environment probe (Playbook §6.2): values the page/harness sets, never values a
 * Prime or Ultimate stylesheet sets (so GAP-098's box model is not "environment").
 */
export async function environment(page: Page, side: Side): Promise<Record<string, string>> {
  return page.evaluate((sel) => {
    const out: Record<string, string> = {};
    const add = (prefix: string, e: Element, props: string[]) => {
      const s = getComputedStyle(e);
      for (const p of props) out[`${prefix}.${p}`] = s.getPropertyValue(p);
    };
    const text = ["font-family", "font-size", "line-height", "color", "background-color", "margin"];
    add("html", document.documentElement, text);
    add("body", document.body, [...text, "padding", "box-sizing"]);
    const r = document.querySelector(sel)!.getBoundingClientRect();
    out["container.x"] = String(r.x);
    out["container.y"] = String(r.y);
    out["container.width"] = String(r.width);
    out["viewport"] = `${innerWidth}x${innerHeight}@${devicePixelRatio}`;
    return out;
  }, container(side));
}

/** Probed values that are material when they differ (Playbook §8.1). */
export const PROPS = [
  "display",
  "visibility",
  "color",
  "background-color",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-color",
  "border-radius",
  "padding",
  "font-size",
  "font-weight",
  "line-height",
  "box-shadow",
  "opacity",
  "outline-style",
  "outline-width",
  "outline-color",
] as const;

/**
 * Probed values that explain a difference but are not user-visible by themselves:
 * their visible effect is already measured by the geometry (GAP-098's box model).
 * Reported, never counted in the verdict.
 */
export const EXPLANATORY = ["box-sizing"] as const;

export interface PartProbe {
  missing?: boolean;
  /** Bounding box in viewport coordinates, rounded to 0.1 px. */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  css?: Record<string, string>;
}

/** Probes the named parts; `parts` maps a part name to its selector on this side. */
export async function probe(
  page: Page,
  parts: Record<string, string>
): Promise<Record<string, PartProbe>> {
  return page.evaluate(
    ({ parts, props }) => {
      const out: Record<string, PartProbe> = {};
      const r1 = (n: number) => Math.round(n * 10) / 10;
      for (const [name, sel] of Object.entries(parts)) {
        const e = document.querySelector(sel);
        if (!e) {
          out[name] = { missing: true };
          continue;
        }
        const r = e.getBoundingClientRect();
        const s = getComputedStyle(e);
        out[name] = {
          x: r1(r.x),
          y: r1(r.y),
          w: r1(r.width),
          h: r1(r.height),
          css: Object.fromEntries(props.map((p) => [p, s.getPropertyValue(p)])),
        };
      }
      return out;
    },
    { parts, props: [...PROPS, ...EXPLANATORY] }
  );
}

export interface Difference {
  part: string;
  property: string;
  expected: string;
  actual: string;
}

/**
 * Material threshold (Playbook §8.1): geometry > 1 px, any `PROPS` value, presence.
 * With `explanatory`, compares the `EXPLANATORY` values instead.
 */
export function compare(
  expected: Record<string, PartProbe>,
  actual: Record<string, PartProbe>,
  explanatory = false
): Difference[] {
  const diffs: Difference[] = [];
  if (explanatory) {
    for (const part of Object.keys(expected)) {
      const e = expected[part].css;
      const a = actual[part].css;
      if (!e || !a) continue;
      for (const p of EXPLANATORY)
        if (e[p] !== a[p]) diffs.push({ part, property: p, expected: e[p], actual: a[p] });
    }
    return diffs;
  }
  for (const part of Object.keys(expected)) {
    const e = expected[part];
    const a = actual[part];
    if (e.missing || a.missing) {
      if (!!e.missing !== !!a.missing)
        diffs.push({
          part,
          property: "present",
          expected: String(!e.missing),
          actual: String(!a.missing),
        });
      continue;
    }
    for (const g of ["x", "y", "w", "h"] as const) {
      if (Math.abs(e[g]! - a[g]!) > 1)
        diffs.push({ part, property: g, expected: String(e[g]), actual: String(a[g]) });
    }
    for (const p of PROPS) {
      if (e.css![p] !== a.css![p])
        diffs.push({ part, property: p, expected: e.css![p], actual: a.css![p] });
    }
  }
  return diffs;
}

export async function capture(
  page: Page,
  side: Side,
  mode: "container" | "viewport"
): Promise<Buffer> {
  return mode === "viewport" ? page.screenshot() : page.locator(container(side)).screenshot();
}

/**
 * Builds one review image (expected | actual | diff) in the browser, without an
 * image-diff dependency. A pixel counts as different when a channel differs by
 * more than 24 of 255. The ratio is advisory only (Playbook §6.3).
 */
export async function composite(
  browser: Browser,
  expected: Buffer,
  actual: Buffer,
  labels: [string, string]
): Promise<{ png: Buffer; ratio: number; differing: number }> {
  const page = await browser.newPage();
  const result = await page.evaluate(
    async ({ a, b, labels }) => {
      const img = (src: string) =>
        new Promise<HTMLImageElement>((res) => {
          const i = new Image();
          i.onload = () => res(i);
          i.src = src;
        });
      const [ia, ib] = await Promise.all([img(a), img(b)]);
      const w = Math.max(ia.width, ib.width);
      const h = Math.max(ia.height, ib.height);
      const data = (i: HTMLImageElement) => {
        const c = new OffscreenCanvas(w, h);
        const x = c.getContext("2d")!;
        x.fillStyle = "#fff";
        x.fillRect(0, 0, w, h);
        x.drawImage(i, 0, 0);
        return x.getImageData(0, 0, w, h);
      };
      const da = data(ia);
      const db = data(ib);
      const diff = new ImageData(w, h);
      let differing = 0;
      for (let p = 0; p < da.data.length; p += 4) {
        const d = Math.max(
          Math.abs(da.data[p] - db.data[p]),
          Math.abs(da.data[p + 1] - db.data[p + 1]),
          Math.abs(da.data[p + 2] - db.data[p + 2])
        );
        const hit = d > 24;
        if (hit) differing++;
        const grey = 255 - (255 - da.data[p]) * 0.15;
        diff.data[p] = hit ? 230 : grey;
        diff.data[p + 1] = hit ? 0 : grey;
        diff.data[p + 2] = hit ? 60 : grey;
        diff.data[p + 3] = 255;
      }
      const gap = 12;
      const head = 22;
      const out = document.createElement("canvas");
      out.width = w * 3 + gap * 2;
      out.height = h + head;
      const o = out.getContext("2d")!;
      o.fillStyle = "#ddd";
      o.fillRect(0, 0, out.width, out.height);
      o.fillStyle = "#000";
      o.font = "14px sans-serif";
      [labels[0], labels[1], "diff (red = differs)"].forEach((t, k) =>
        o.fillText(t, k * (w + gap) + 4, 16)
      );
      o.putImageData(da, 0, head);
      o.putImageData(db, w + gap, head);
      o.putImageData(diff, (w + gap) * 2, head);
      return { url: out.toDataURL("image/png"), ratio: differing / (w * h), differing };
    },
    {
      a: `data:image/png;base64,${expected.toString("base64")}`,
      b: `data:image/png;base64,${actual.toString("base64")}`,
      labels,
    }
  );
  await page.close();
  return {
    png: Buffer.from(result.url.split(",")[1], "base64"),
    ratio: result.ratio,
    differing: result.differing,
  };
}
