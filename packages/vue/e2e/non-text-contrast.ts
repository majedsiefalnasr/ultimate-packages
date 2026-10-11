import type { Locator, Page } from "@playwright/test";

/**
 * GAP-124 Spec §10: non-text contrast of an icon against the mask behind it.
 * Layer L1 (asserted): the minimum contrast between EVERY fully covered icon pixel and EVERY
 * adjacent mask pixel, with anti-aliased edge pixels identified by measured coverage and excluded
 * (W3C evaluates contrast with anti-aliasing turned off). Layer L2 (reported): `renderedMedian`.
 */
export type Rgb = readonly [number, number, number];

export interface IconContrast {
  /** L1: min over (core pixel, adjacent pixel) pairs. */
  ratio: number;
  /** Fully covered pixels: W − K ≥ 254 on every channel (full coverage within 8-bit rounding). */
  corePixels: number;
  /** Pixels with coverage α ≥ 0.05. */
  inkPixels: number;
  /** Largest per-channel distance of a core pixel from the icon's computed `color`. */
  maxCoreDeviation: number;
  /** L2: median contrast of pixels with α ≥ 0.5 against the least-contrasting adjacent pixel. */
  renderedMedian: number;
}

const channel = (v: number): number => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgb): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** WCAG 2.2 contrast ratio. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Spec B-AC6 (Amendment A2): the L1 range allowed by 8-bit compositing, with each channel of the
 * mask composite rounded down or up, and by the ±2 core-colour guard (B-AC7).
 */
export function roundingRange(fill: Rgb, surface: Rgb, alpha: number): [number, number] {
  const combos = (options: number[][]): Rgb[] =>
    options.reduce<number[][]>(
      (acc, opts) => acc.flatMap((a) => opts.map((o) => [...a, o])),
      [[]]
    ) as unknown as Rgb[];
  const masks = combos(
    surface.map((c) => [Math.floor(c * (1 - alpha)), Math.floor(c * (1 - alpha)) + 1])
  );
  const fills = combos(fill.map((c) => [-2, 0, 2].map((d) => Math.min(255, Math.max(0, c + d)))));
  const ratios = fills.flatMap((f) => masks.map((m) => contrastRatio(f, m)));
  return [Math.min(...ratios), Math.max(...ratios)];
}

const MARGIN = 6; // CSS px of mask captured around the icon box
const FULL = 254; // W − K per channel; 255 = exact full coverage, 254 allows 8-bit rounding
const INK = 0.05;
const MIN_CORE = 100;
const MIN_CORE_SHARE = 0.25;

/** Decodes a PNG screenshot in the page (canvas), so no PNG dependency is needed. */
async function capture(page: Page, clip: { x: number; y: number; width: number; height: number }) {
  const png = await page.screenshot({ clip, animations: "disabled" });
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    return Array.from(ctx.getImageData(0, 0, img.width, img.height).data);
  }, png.toString("base64"));
}

export async function measureIconContrast(
  page: Page,
  icon: Locator,
  { validate = true }: { validate?: boolean } = {}
): Promise<IconContrast> {
  const box = await icon.boundingBox();
  if (!box) throw new Error("icon has no bounding box");
  const clip = {
    x: box.x - MARGIN,
    y: box.y - MARGIN,
    width: box.width + 2 * MARGIN,
    height: box.height + 2 * MARGIN,
  };
  const original = await icon.evaluate((el) => (el as SVGElement).style.cssText);
  const computed = (await icon.evaluate((el) => getComputedStyle(el).color))
    .match(/\d+/g)!
    .slice(0, 3)
    .map(Number);
  const withStyle = async (extra: string) => {
    await icon.evaluate(
      (el, css) => ((el as SVGElement).style.cssText = css),
      `${original};${extra}`
    );
    return capture(page, clip);
  };
  const N = await withStyle("");
  const H = await withStyle("visibility:hidden");
  const K = await withStyle("color:#000");
  const W = await withStyle("color:#fff");
  await icon.evaluate((el, css) => ((el as SVGElement).style.cssText = css), original);

  const px = (d: number[], k: number): Rgb => [d[k], d[k + 1], d[k + 2]];
  const adjacent = [
    ...new Map(
      Array.from({ length: H.length / 4 }, (_, i) => px(H, i * 4)).map((c) => [c.join(","), c])
    ).values(),
  ];
  const core: Rgb[] = [];
  const partial: Rgb[] = [];
  let ink = 0;
  for (let k = 0; k < N.length; k += 4) {
    const alpha = (W[k] - K[k] + (W[k + 1] - K[k + 1]) + (W[k + 2] - K[k + 2])) / (3 * 255);
    if (alpha >= INK) ink++;
    if (W[k] - K[k] >= FULL && W[k + 1] - K[k + 1] >= FULL && W[k + 2] - K[k + 2] >= FULL)
      core.push(px(N, k));
    if (alpha >= 0.5) partial.push(px(N, k));
  }
  const maxCoreDeviation = Math.max(
    0,
    ...core.map((c) => Math.max(...c.map((v, i) => Math.abs(v - computed[i]))))
  );
  if (validate) {
    if (core.length < MIN_CORE || core.length < MIN_CORE_SHARE * ink)
      throw new Error(`invalid measurement: ${core.length} fully covered of ${ink} icon pixels`);
    if (maxCoreDeviation > 2)
      throw new Error(
        `invalid measurement: core pixels deviate ${maxCoreDeviation} from computed color ${computed}`
      );
  }
  const uniqueCore = [...new Map(core.map((c) => [c.join(","), c])).values()];
  const ratio = Math.min(...uniqueCore.flatMap((c) => adjacent.map((a) => contrastRatio(c, a))));
  const worstAdjacent = (c: Rgb) => Math.min(...adjacent.map((a) => contrastRatio(c, a)));
  const sorted = partial.map(worstAdjacent).sort((a, b) => a - b);
  const renderedMedian = sorted.length ? sorted[Math.floor(sorted.length / 2)] : NaN;
  return { ratio, corePixels: core.length, inkPixels: ink, maxCoreDeviation, renderedMedian };
}
