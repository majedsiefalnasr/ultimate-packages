// G3E-1: generates the four 800 × 600 verification images (no third-party content).
// Run once from the repository root: node tooling/prime-reference/fixtures/generate.mjs
// Shapes only (no text), so the output does not depend on fonts.
import { writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const PALETTES = [
  ["#0f766e", "#99f6e4", "#f59e0b"],
  ["#1d4ed8", "#bfdbfe", "#ef4444"],
  ["#7c3aed", "#ddd6fe", "#10b981"],
  ["#b45309", "#fde68a", "#2563eb"],
];
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [i, [dark, light, accent]] of PALETTES.entries()) {
  const dataUrl = await page.evaluate(
    ({ dark, light, accent, i }) => {
      const c = document.createElement("canvas");
      c.width = 800;
      c.height = 600;
      const x = c.getContext("2d");
      x.fillStyle = light;
      x.fillRect(0, 0, 800, 600);
      x.fillStyle = dark;
      x.fillRect(0, 400, 800, 200);
      x.fillStyle = accent;
      x.beginPath();
      x.arc(200 + i * 120, 220, 110, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = dark;
      for (let k = 0; k <= i; k++) x.fillRect(560, 80 + k * 70, 160, 40);
      return c.toDataURL("image/png");
    },
    { dark, light, accent, i }
  );
  writeFileSync(
    new URL(`./media/landscape-${i + 1}.png`, import.meta.url),
    Buffer.from(dataUrl.split(",")[1], "base64")
  );
}
await browser.close();
console.log("generated 4 images");
