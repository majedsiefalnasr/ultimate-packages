import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Browser } from "@playwright/test";
import type { Framework } from "../cases";
import { G3E, type G3EComponent, type G3ECase } from "../cases-g3e";
import { facts, imagesLoaded, run } from "./actions";
import {
  capture,
  compare,
  composite,
  environment,
  load,
  probe,
  settled,
  type Difference,
  type Side,
  type Target,
} from "./probe";

/**
 * GAP-064 G3-E comparison runner (Spec §3; PARITY_PLAYBOOK.md §6–§8). Report mode: parity
 * differences are recorded, never failed; a failure means a harness problem. Select a batch
 * with G3E_BATCH (default "smoke").
 */
const BATCH = process.env.G3E_BATCH ?? "smoke";
const OUT = resolve(__dirname, `../../../test-results/prime-parity-g3e/${BATCH}`);
const FWS: Framework[] = ["ng", "vue"];
const NAME: Record<Framework, string> = { ng: "PrimeNG 21.1.9", vue: "PrimeVue 4.5.5" };

interface Row {
  component: string;
  id: string;
  fw: Framework | "-";
  kind: string;
  verdict: string;
  differences?: Difference[];
  explanatory?: Difference[];
  facts?: { prime: Record<string, unknown>; ultimate: Record<string, unknown> };
  pixelRatio?: number;
  noise?: { probe: number; primePixels: number; ultimatePixels: number };
  image?: string;
  note?: string;
}
const rows: Row[] = [];
test.describe.configure({ mode: "serial" });
mkdirSync(OUT, { recursive: true });

/** A part's selector on one side of one framework (part maps may be keyed by framework). */
const pick = (c: G3EComponent, part: string, fw: Framework, side: Side): string => {
  const entry = c.parts[part];
  const pair = Array.isArray(entry) ? entry : entry[fw];
  return pair[side === "prime" ? 0 : 1];
};
const sels = (c: G3EComponent, names: string[], fw: Framework, side: Side) =>
  Object.fromEntries(names.map((n) => [n, pick(c, n, fw, side)]));

async function observe(browser: Browser, comp: G3EComponent, c: G3ECase, t: Target) {
  const page = await load(browser, t);
  try {
    const all = sels(comp, Object.keys(comp.parts), t.fw, t.side);
    // The environment is the page before the case's actions: a component may legitimately
    // change <body> (e.g. scroll locking when an overlay opens), which is behavior, not environment.
    const env = await environment(page, t.side);
    await run(page, all, c.actions);
    await settled(page, t.clock);
    const parts = await probe(page, sels(comp, c.parts, t.fw, t.side));
    expect(
      parts[c.parts[0]].missing,
      `${t.side} ${t.fw} ${t.ref}: first part missing (harness)`
    ).toBeFalsy();
    await imagesLoaded(page, all[c.parts[0]]);
    return {
      env,
      parts,
      facts: await facts(page, all, c.facts),
      png: await capture(page, t.side, c.capture),
    };
  } finally {
    await page.close();
  }
}

const target = (c: G3ECase, fw: Framework, side: Side): Target => ({
  side,
  fw,
  ref: side === "prime" ? `g3e/${c.prime}` : c.story[fw]!,
  open: c.open[fw],
  state: c.state,
  clock: c.clock,
});

for (const comp of G3E.filter((x) => x.batch === BATCH)) {
  for (const c of comp.cases) {
    for (const fw of FWS.filter((f) => c.story[f])) {
      test(`${c.id} [${fw}] ${NAME[fw]} vs Ultimate`, async ({ browser }) => {
        const prime = await observe(browser, comp, c, target(c, fw, "prime"));
        const ult = await observe(browser, comp, c, target(c, fw, "ultimate"));
        expect(ult.env, "environment probe (harness artifact if this fails)").toEqual(prime.env);
        const differences = compare(prime.parts, ult.parts);
        const factDiffs: Difference[] = Object.keys(prime.facts)
          .filter((k) => JSON.stringify(prime.facts[k]) !== JSON.stringify(ult.facts[k]))
          .map((k) => ({
            part: "fact",
            property: k,
            expected: JSON.stringify(prime.facts[k]),
            actual: JSON.stringify(ult.facts[k]),
          }));
        const review = await composite(browser, prime.png, ult.png, [NAME[fw], `Ultimate ${fw}`]);
        const image = `${c.id.replaceAll("/", "--")}.${fw}.png`;
        writeFileSync(resolve(OUT, image), review.png);
        const prime2 = await observe(browser, comp, c, target(c, fw, "prime"));
        const ult2 = await observe(browser, comp, c, target(c, fw, "ultimate"));
        const noise = {
          probe: compare(prime.parts, prime2.parts).length + compare(ult.parts, ult2.parts).length,
          primePixels: (await composite(browser, prime.png, prime2.png, ["", ""])).differing,
          ultimatePixels: (await composite(browser, ult.png, ult2.png, ["", ""])).differing,
        };
        const all = [...differences, ...factDiffs];
        rows.push({
          component: comp.key,
          id: c.id,
          fw,
          kind: c.kind,
          // Playbook §6.4 / R-3: a probe match with differing pixels is not a Match until reviewed.
          verdict: all.length ? "differs" : review.differing > 0 ? "review image" : "match",
          differences: all,
          explanatory: compare(prime.parts, ult.parts, true),
          facts: { prime: prime.facts, ultimate: ult.facts },
          pixelRatio: review.ratio,
          noise,
          image,
        });
      });
    }
  }
  for (const r of comp.recorded) {
    test(`${r.id} [${r.kind}]`, () => {
      rows.push({
        component: comp.key,
        id: r.id,
        fw: "-",
        kind: r.kind,
        verdict: r.kind,
        note: r.reason,
      });
    });
  }
}

test.afterAll(() => {
  writeFileSync(resolve(OUT, "report.json"), JSON.stringify({ batch: BATCH, rows }, null, 2));
  const list = (ds?: Difference[]) =>
    (ds ?? []).map((x) => `${x.part}.${x.property}: ${x.expected} → ${x.actual}`).join("<br>");
  const lines = [
    `# G3-E ${BATCH} comparison`,
    "",
    "| Case | fw | Kind | Verdict | Material | Explanatory | Pixel ratio | Noise (probe/Prime px/Ultimate px) | Image |",
    "|---|---|---|---|---|---|---|---|---|",
    ...rows.map(
      (r) =>
        `| ${r.id} | ${r.fw} | ${r.kind} | ${r.verdict} | ${list(r.differences) || r.note || ""} | ${list(r.explanatory)} | ${r.pixelRatio?.toFixed(4) ?? ""} | ${r.noise ? `${r.noise.probe}/${r.noise.primePixels}/${r.noise.ultimatePixels}` : ""} | ${r.image ?? ""} |`
    ),
  ];
  writeFileSync(resolve(OUT, "summary.md"), lines.join("\n") + "\n");
});
