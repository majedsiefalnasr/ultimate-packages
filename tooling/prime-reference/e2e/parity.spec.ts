import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  DRAWER,
  DRAWER_BEHAVIOR,
  PILOT,
  selector,
  type ComponentCases,
  type Framework,
  type VisualCase,
} from "../cases";
import {
  capture,
  compare,
  composite,
  container,
  environment,
  load,
  probe,
  type Difference,
  type Side,
  type Target,
} from "./probe";

/**
 * Prime-parity pilot runner (PARITY_PLAYBOOK.md §6–§8). Report mode: a parity
 * difference is recorded, not failed. A test fails only on a harness problem
 * (environment mismatch, a page that does not render).
 */
const OUT = resolve(__dirname, "../../../test-results/prime-parity");
const FWS: Framework[] = ["ng", "vue"];
const PRIME_NAME: Record<Framework, string> = { ng: "PrimeNG 21.1.9", vue: "PrimeVue 4.5.5" };

/** ADR-048: exact framework packages; `@primeuix/*` at or below their MIT ceilings. */
const EXACT: Record<string, string> = {
  primeng: "21.1.9",
  primevue: "4.5.5",
  "@primevue/core": "4.5.5",
};
const CEILING: Record<string, string> = {
  "@primeuix/themes": "2.0.3",
  "@primeuix/styles": "2.0.3",
  "@primeuix/styled": "0.7.4",
  "@primeuix/utils": "0.7.2",
  "@primeuix/motion": "0.0.10",
};
const atOrBelow = (v: string, max: string) => {
  const [a, b] = [v, max].map((s) => s.split(".").map(Number));
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return true;
};

/** Resolves `name` as seen from `from`, then each `@primeuix/*` dependency as seen from it. */
function resolvedVersions(from: string, name: string, found: Record<string, string>): void {
  // Node's lookup order, without `exports` (which hides package.json in some packages).
  let dir = from;
  while (!existsSync(resolve(dir, "node_modules", name, "package.json"))) {
    if (dirname(dir) === dir) throw new Error(`${name} not resolvable from ${from}`);
    dir = dirname(dir);
  }
  const pkgDir = realpathSync(resolve(dir, "node_modules", name));
  const pkg = JSON.parse(readFileSync(resolve(pkgDir, "package.json"), "utf8"));
  const seen = found[name] ? found[name].split(", ") : [];
  if (seen.includes(pkg.version)) return;
  found[name] = [...seen, pkg.version].join(", ");
  for (const dep of Object.keys(pkg.dependencies ?? {})) {
    if (dep.startsWith("@primeuix/") || dep.startsWith("@primevue/"))
      resolvedVersions(pkgDir, dep, found);
  }
}

interface Row {
  component: string;
  id: string;
  fw: Framework | "ng-vs-vue";
  kind: "visual" | "diagnostic" | "behavior" | "D" | "coverage-gap";
  verdict: string;
  differences?: Difference[];
  /** EXPLANATORY values that differ (not counted in the verdict). */
  explanatory?: Difference[];
  pixelRatio?: number;
  noise?: { probe: number; primePixels: number; ultimatePixels: number };
  image?: string;
  ms?: number;
  note?: string;
}
const rows: Row[] = [];

test.describe.configure({ mode: "serial" });
mkdirSync(OUT, { recursive: true });

const selectors = (c: ComponentCases, names: string[], fw: Framework, side: Side) =>
  Object.fromEntries(names.map((n) => [n, selector(c, n, fw, side)]));

const primeTarget = (c: VisualCase, fw: Framework): Target => ({
  side: "prime",
  fw,
  ref: c.prime ?? c.id,
  open: c.open[fw],
  state: c.state,
});
const ultimateTarget = (c: VisualCase, fw: Framework): Target => ({
  side: "ultimate",
  fw,
  ref: c.story[fw],
  open: c.open[fw],
  state: c.state,
});

/** One load: environment, probe and capture, then the page is closed. */
async function observe(browser: Browser, comp: ComponentCases, c: VisualCase, t: Target) {
  const page = await load(browser, t);
  try {
    const parts = await probe(page, selectors(comp, c.parts, t.fw, t.side));
    expect(
      parts.root.missing,
      `${t.side} ${t.fw} ${t.ref} rendered no root (harness problem)`
    ).toBeFalsy();
    return {
      env: await environment(page, t.side),
      parts,
      png: await capture(page, t.side, c.capture),
    };
  } finally {
    await page.close();
  }
}

const file = (id: string, suffix: string) => `${id.replace("/", "--")}.${suffix}.png`;

const versions: Record<Framework, Record<string, string>> = { ng: {}, vue: {} };

test("reference apps resolve the ADR-048 pinned Prime versions", () => {
  resolvedVersions(resolve(__dirname, "../ng"), "primeng", versions.ng);
  resolvedVersions(resolve(__dirname, "../ng"), "@primeuix/themes", versions.ng);
  resolvedVersions(resolve(__dirname, "../vue"), "primevue", versions.vue);
  resolvedVersions(resolve(__dirname, "../vue"), "@primeuix/themes", versions.vue);
  for (const found of Object.values(versions)) {
    for (const [name, all] of Object.entries(found)) {
      for (const v of all.split(", ")) {
        if (EXACT[name]) expect(v, name).toBe(EXACT[name]);
        else if (CEILING[name])
          expect(atOrBelow(v, CEILING[name]), `${name}@${v} ≤ ${CEILING[name]}`).toBe(true);
      }
    }
  }
});

for (const comp of PILOT) {
  test.describe(comp.key, () => {
    for (const c of comp.visual) {
      for (const fw of FWS) {
        test(`${c.id} [${fw}] ${PRIME_NAME[fw]} vs Ultimate`, async ({ browser }) => {
          const t0 = Date.now();
          const prime = await observe(browser, comp, c, primeTarget(c, fw));
          const ult = await observe(browser, comp, c, ultimateTarget(c, fw));
          expect(ult.env, "environment probe (harness artifact if this fails)").toEqual(prime.env);

          const differences = compare(prime.parts, ult.parts);
          const review = await composite(browser, prime.png, ult.png, [
            PRIME_NAME[fw],
            `Ultimate ${fw}`,
          ]);
          const image = file(c.id, fw);
          writeFileSync(resolve(OUT, image), review.png);
          const ms = Date.now() - t0;

          // Noise: a second load of each side must reproduce the first exactly.
          const prime2 = await observe(browser, comp, c, primeTarget(c, fw));
          const ult2 = await observe(browser, comp, c, ultimateTarget(c, fw));
          const noise = {
            probe:
              compare(prime.parts, prime2.parts).length + compare(ult.parts, ult2.parts).length,
            primePixels: (await composite(browser, prime.png, prime2.png, ["", ""])).differing,
            ultimatePixels: (await composite(browser, ult.png, ult2.png, ["", ""])).differing,
          };

          rows.push({
            component: comp.key,
            id: c.id,
            fw,
            kind: "visual",
            // Playbook §6.4: a probe match with differing pixels is not a Match until its image is reviewed.
            verdict: differences.length
              ? "differs"
              : review.differing > 0
                ? "review image"
                : "match",
            differences,
            explanatory: compare(prime.parts, ult.parts, true),
            pixelRatio: review.ratio,
            noise,
            image,
            ms,
          });
        });
      }

      test(`${c.id} [diagnostic] PrimeNG vs PrimeVue`, async ({ browser }) => {
        const t0 = Date.now();
        const ng = await observe(browser, comp, c, primeTarget(c, "ng"));
        const vue = await observe(browser, comp, c, primeTarget(c, "vue"));
        const differences = compare(ng.parts, vue.parts);
        const review = await composite(browser, ng.png, vue.png, [PRIME_NAME.ng, PRIME_NAME.vue]);
        const image = file(c.id, "primeng-vs-primevue");
        writeFileSync(resolve(OUT, image), review.png);
        rows.push({
          component: comp.key,
          id: c.id,
          fw: "ng-vs-vue",
          kind: "diagnostic",
          verdict: differences.length ? "differs" : "same probe",
          differences,
          explanatory: compare(ng.parts, vue.parts, true),
          pixelRatio: review.ratio,
          image,
          ms: Date.now() - t0,
          note:
            c.open.ng !== c.open.vue
              ? "pages differ by design: the Vue page has a 'Show drawer' button behind the mask"
              : undefined,
        });
      });
    }

    for (const r of comp.recorded) {
      test(`${r.id} [${r.kind}]`, async ({ browser }) => {
        let image: string | undefined;
        if (r.primeOnly) {
          for (const fw of FWS) {
            const page = await load(browser, { side: "prime", fw, ref: r.id, open: "none" });
            writeFileSync(
              resolve(OUT, file(r.id, `prime-${fw}`)),
              await capture(page, "prime", "container")
            );
            await page.close();
          }
          image = file(r.id, "prime-{ng,vue}");
        }
        rows.push({
          component: comp.key,
          id: r.id,
          fw: "ng-vs-vue",
          kind: r.kind,
          verdict: r.kind,
          note: r.reason,
          image,
        });
      });
    }
  });
}

/** Drawer behavior (§7): the same script on the Prime reference and on Ultimate. */
test.describe("drawer behavior", () => {
  const sel = (fw: Framework, side: Side) => selectors(DRAWER, Object.keys(DRAWER.parts), fw, side);

  async function facts(page: Page, fw: Framework, side: Side) {
    return page.evaluate(
      ({ parts, root }) => {
        const shown = (s: string) => {
          const e = document.querySelector(s);
          if (!e) return false;
          const r = e.getBoundingClientRect();
          return getComputedStyle(e).visibility !== "hidden" && r.width > 0 && r.height > 0;
        };
        const active = document.activeElement;
        const focused = Object.entries(parts).find(
          ([, s]) => active?.closest(s) && active !== document.body
        )?.[0];
        return {
          drawerShown: shown(parts.root),
          maskShown: shown(parts.mask),
          maskBackground: document.querySelector(parts.mask)
            ? getComputedStyle(document.querySelector(parts.mask)!).backgroundColor
            : "none",
          focusedPart:
            focused ??
            (active === document.body ? "body" : (active?.tagName.toLowerCase() ?? "none")),
          containerHeight: Math.round(document.querySelector(root)!.getBoundingClientRect().height),
        };
      },
      { parts: sel(fw, side), root: container(side) }
    );
  }

  for (const fw of FWS) {
    test(`drawer behavior [${fw}] ${PRIME_NAME[fw]} vs Ultimate`, async ({ browser }) => {
      const t0 = Date.now();
      const sides: Side[] = ["prime", "ultimate"];
      const result: Record<string, Record<Side, unknown>> = {};
      const set = (k: string, s: Side, v: unknown) =>
        ((result[k] ??= {} as Record<Side, unknown>)[s] = v);

      for (const s of sides) {
        const closedRef =
          s === "prime" ? DRAWER_BEHAVIOR.closed.prime : DRAWER_BEHAVIOR.closed.story[fw];
        const closed = await load(browser, { side: s, fw, ref: closedRef, open: "none" });
        const c = await facts(closed, fw, s);
        set("closed: drawer shown", s, c.drawerShown);
        set("closed: container height (footprint)", s, c.containerHeight);
        await closed.close();

        const openRef = s === "prime" ? DRAWER_BEHAVIOR.open.prime : DRAWER_BEHAVIOR.open.story[fw];
        const target: Target = { side: s, fw, ref: openRef, open: DRAWER_BEHAVIOR.open.open[fw] };
        const page = await load(browser, target);
        const o = await facts(page, fw, s);
        set("open: drawer shown", s, o.drawerShown);
        set("open: mask shown", s, o.maskShown);
        set("open: mask background", s, o.maskBackground);
        set("open: focused part", s, o.focusedPart);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(600);
        set("Escape: drawer shown", s, (await facts(page, fw, s)).drawerShown);
        await page.close();

        const again = await load(browser, target);
        await again.locator(sel(fw, s).close).first().click();
        await again.waitForTimeout(600);
        set("close button: drawer shown", s, (await facts(again, fw, s)).drawerShown);
        await again.close();
      }

      const differences: Difference[] = Object.entries(result)
        .filter(([, v]) => JSON.stringify(v.prime) !== JSON.stringify(v.ultimate))
        .map(([k, v]) => ({
          part: "behavior",
          property: k,
          expected: String(v.prime),
          actual: String(v.ultimate),
        }));
      rows.push({
        component: "drawer",
        id: "drawer/behavior",
        fw,
        kind: "behavior",
        verdict: differences.length ? "differs" : "match",
        differences,
        ms: Date.now() - t0,
        note: JSON.stringify(result),
      });
    });
  }
});

test.afterAll(() => {
  writeFileSync(resolve(OUT, "report.json"), JSON.stringify({ versions, rows }, null, 2));
  const lines = [
    "# Prime-parity pilot run",
    "",
    ...FWS.map(
      (fw) =>
        `- Resolved ${fw}: ${Object.entries(versions[fw])
          .map(([n, v]) => `${n}@${v}`)
          .join(", ")}`
    ),
    "",
    "| Case | Framework | Kind | Verdict | Material differences | Explanatory | Pixel ratio | Noise (probe / Prime px / Ultimate px) | ms | Image |",
    "|---|---|---|---|---|---|---|---|---|---|",
  ];
  const list = (ds?: Difference[]) =>
    (ds ?? []).map((x) => `${x.part}.${x.property}: ${x.expected} → ${x.actual}`).join("<br>");
  for (const r of rows) {
    const n = r.noise
      ? `${r.noise.probe} / ${r.noise.primePixels} / ${r.noise.ultimatePixels}`
      : "";
    lines.push(
      `| ${r.id} | ${r.fw} | ${r.kind} | ${r.verdict} | ${list(r.differences) || r.note || ""} | ${list(r.explanatory)} | ${r.pixelRatio?.toFixed(4) ?? ""} | ${n} | ${r.ms ?? ""} | ${r.image ?? ""} |`
    );
  }
  writeFileSync(resolve(OUT, "summary.md"), lines.join("\n") + "\n");
});
