import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BASE_ROLE,
  BASE_SOURCES,
  COUNTS,
  FIXTURE,
  FRAMEWORKS,
  KEYS,
  MAPPING,
  OMITTED,
  REPO,
  RETAINED,
  TOTALS,
  actualCssText,
  actualRules,
  declarations,
  expected,
  expectedCss,
  mapSelector,
  norm,
  parseGroups,
} from "./utils/g3c1-port.mjs";

/**
 * GAP-064 G3-C1 C3 (Spec §5, §6, §8, §15): each of the 10 framework style
 * files contains exactly D3 → D1 (upstream source order) → D5, derived from
 * the committed @primeuix/styles 2.0.3 fixture; D2 never appears.
 */
type Fw = "ng" | "vue";
type Rules = Record<Fw, Record<string, string[]>>;
const CASES = (FRAMEWORKS as Fw[]).flatMap((fw) => (KEYS as string[]).map((key) => ({ fw, key })));
const decl = (body: string) =>
  Object.fromEntries(
    norm(body)
      .split(";")
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(":")).trim(), d.slice(d.indexOf(":") + 1).trim()])
  );
const bodyOf = (rule: string) => rule.slice(rule.indexOf("{") + 1, -1);

describe("G3-C1 upstream fixture and data model (Spec §8)", () => {
  it("covers the 5 G3-C1 keys plus base and records its source", () => {
    expect(Object.keys(FIXTURE.modules).sort()).toEqual([...KEYS, "base"].sort());
    expect(FIXTURE._meta.source).toContain("@primeuix/styles@2.0.3");
  });

  it.each(FRAMEWORKS as Fw[])(
    "%s: D1 + D2 = 90, disjoint, per-key counts pinned (ng 79 + 11, vue 81 + 9)",
    (fw) => {
      let upstream = 0;
      let ported = 0;
      let omitted = 0;
      for (const key of KEYS as string[]) {
        const e = expected(fw, key);
        const [u, ng, vue] = (COUNTS as Record<string, number[]>)[key];
        expect(e.upstream, key).toBe(u);
        expect(e.d1.length, key).toBe(fw === "ng" ? ng : vue);
        const d1n = e.d1.map((r: { n: number }) => r.n);
        const d2n = e.d2.map((r: { n: number }) => r.n);
        expect(
          d1n.filter((n: number) => d2n.includes(n)),
          key
        ).toEqual([]);
        expect(
          [...d1n, ...d2n].sort((a, b) => a - b),
          key
        ).toEqual(Array.from({ length: u }, (_, i) => i + 1));
        upstream += e.upstream;
        ported += e.d1.length;
        omitted += e.d2.length;
      }
      expect({ upstream, ported, omitted }).toEqual((TOTALS as Record<Fw, unknown>)[fw]);
    }
  );

  it("D2 tags are exactly FX-C1..FX-C6; FX-C6 is Angular-only", () => {
    const tags = (fw: Fw) =>
      new Set(
        Object.values((OMITTED as Record<Fw, Record<string, Record<number, string>>>)[fw]).flatMap(
          (m) => Object.values(m)
        )
      );
    expect([...tags("ng")].sort()).toEqual(["FX-C1", "FX-C2", "FX-C3", "FX-C4", "FX-C5", "FX-C6"]);
    expect([...tags("vue")].sort()).toEqual(["FX-C1", "FX-C2", "FX-C3", "FX-C4", "FX-C5"]);
  });

  it("D1 is in upstream source order (strictly increasing group numbers)", () => {
    for (const fw of FRAMEWORKS as Fw[])
      for (const key of KEYS as string[]) {
        const ns = expected(fw, key).d1.map((r: { n: number }) => r.n);
        ns.forEach(
          (n: number, i: number) => i > 0 && expect(n, `${fw} ${key}`).toBeGreaterThan(ns[i - 1])
        );
      }
  });

  it("Spec §4 normative mapping examples", () => {
    for (const fw of FRAMEWORKS as Fw[]) {
      expect(mapSelector(fw, "steps", ".p-steps-item.p-disabled, .p-steps-item.p-disabled *")).toBe(
        ".u-steps-item.u-steps-item-disabled, .u-steps-item.u-steps-item-disabled *"
      );
      expect(mapSelector(fw, "tabs", ".p-tablist-nav-button:hover")).toBe(
        ".u-tablist-prev-button:hover, .u-tablist-next-button:hover"
      );
      expect(mapSelector(fw, "tabs", ".p-tablist-viewport::-webkit-scrollbar")).toBe(
        ".u-tablist-content::-webkit-scrollbar"
      );
      expect(mapSelector(fw, "stepper", ".p-stepitem .p-steppanel-content-wrapper")).toBe(
        ".u-step-item .u-step-panel-content-wrapper"
      );
      expect(mapSelector(fw, "stepper", ".p-stepitem.p-stepitem-active")).toBe(
        ".u-step-item.u-step-item-active"
      );
    }
  });

  it("PX-C2: steps group 9 is the only adapted selector; its focus filter sits on the item", () => {
    const ADAPTED = ".u-steps-item:not(.u-steps-item-disabled) .u-steps-item-link:focus-visible";
    for (const fw of FRAMEWORKS as Fw[]) {
      const group9 = expected(fw, "steps").d1.find((r: { n: number }) => r.n === 9);
      expect(group9.text.startsWith(`${ADAPTED}{`), fw).toBe(true);
      // The plain C-1 mapping (inert, as upstream) never appears.
      expect(expectedCss(fw, "steps").join("\n")).not.toContain(
        ".u-steps-item-link:not(.u-steps-item-disabled)"
      );
      // Declarations are upstream's, unchanged.
      const upstream = parseGroups(FIXTURE.modules.steps)[8];
      expect(norm(upstream.head)).toBe(".p-steps-item-link:not(.p-disabled):focus-visible");
      expect(bodyOf(group9.text)).toBe(bodyOf(norm(`${upstream.head}{${upstream.body}}`)));
      // Exactly one mapping entry of kind "text" exists across all keys: the group 9 adaptation.
      const textEntries = Object.values((MAPPING as Record<Fw, Record<string, unknown[][]>>)[fw])
        .flat()
        .filter((e) => e[0] === "text");
      expect(textEntries, fw).toHaveLength(1);
    }
  });

  it("D3 is never emitted for steps (PX-C1, SR-C1-1)", () => {
    for (const fw of FRAMEWORKS as Fw[]) expect((BASE_ROLE as Rules)[fw].steps, fw).toBeUndefined();
  });

  it("D3 declarations equal the upstream base groups exactly", () => {
    const base = parseGroups(FIXTURE.modules.base).map((g: { head: string; body: string }) => ({
      head: norm(g.head),
      body: g.body,
    }));
    for (const src of BASE_SOURCES) {
      const group = base.find((b: { head: string }) => b.head === src.base);
      expect(group, src.base).toBeDefined();
      for (const fw of FRAMEWORKS as Fw[])
        for (const key of src.keys)
          expect(
            decl(bodyOf(norm((BASE_ROLE as Rules)[fw][key][src.ruleIndex]))),
            `${fw} ${key} ${src.base}`
          ).toEqual(decl(group!.body));
    }
  });

  it("D5 is exactly R-C1, R-C2 (dock) and R-C3 (Angular stepper)", () => {
    expect(Object.keys((RETAINED as Rules).ng).sort()).toEqual(["dock", "stepper"]);
    expect(Object.keys((RETAINED as Rules).vue)).toEqual(["dock"]);
    expect((RETAINED as Rules).ng.dock).toEqual((RETAINED as Rules).vue.dock);
    expect((RETAINED as Rules).ng.dock).toHaveLength(2);
    expect((RETAINED as Rules).ng.stepper).toEqual([".u-step-panel[hidden] { display: none; }"]);
  });

  it("D5 never redeclares a D1 property on the same selector", () => {
    for (const fw of FRAMEWORKS as Fw[])
      for (const key of KEYS as string[]) {
        const d1 = expected(fw, key).d1.map((r: { text: string }) => declarations(r.text));
        for (const x of ((RETAINED as Rules)[fw][key] ?? []).map((r) => declarations(norm(r)))) {
          const clash = d1
            .filter((u: { selector: string }) => u.selector === x.selector)
            .flatMap((u: { props: string[] }) => u.props.filter((p) => x.props.includes(p)));
          expect(clash, `${fw} ${key} ${x.selector}`).toEqual([]);
        }
      }
  });

  const vendor = join(REPO, ".vendor-extracted/uix-styles-full/src");
  describe.skipIf(!existsSync(vendor))("fixture vs .vendor-extracted source", () => {
    it.each(KEYS as string[])("%s matches the vendored source", (key) => {
      const src = readFileSync(join(vendor, key, "index.ts"), "utf8");
      const css = (src.match(/\/\*css\*\/\s*`([\s\S]*?)`/) ?? [])[1] ?? "";
      expect(norm(css)).toBe(norm((FIXTURE.modules as Record<string, string>)[key]));
    });
  });
});

describe.each(CASES)("$fw $key style module (C3)", ({ fw, key }) => {
  it("contains exactly D3 → D1 → D5, nothing else", () => {
    expect(actualRules(fw, key)).toEqual(expectedCss(fw, key));
  });

  it("every rule belongs to exactly one of D1, D3, D5; nothing from D2", () => {
    const d1 = expected(fw, key).d1.map((r: { text: string }) => r.text);
    const d3 = ((BASE_ROLE as Rules)[fw][key] ?? []).map(norm);
    const d5 = ((RETAINED as Rules)[fw][key] ?? []).map(norm);
    for (const rule of actualRules(fw, key)) {
      const hits = [d1, d3, d5].filter((set) => set.includes(rule)).length;
      expect(hits, rule).toBe(1);
    }
    const heads = actualRules(fw, key).map((r) => r.slice(0, r.indexOf("{")));
    for (const g of expected(fw, key).d2)
      expect(heads, g.head).not.toContain(mapSelector(fw, key, g.head));
  });

  it("keeps no upstream p- name and no raw --u- variable", () => {
    const css = norm(actualCssText(fw, key));
    expect(css).not.toMatch(/\.p-[a-z]/);
    expect(css).not.toMatch(/var\(--u-/);
  });

  it("D1 references at least one own token (C2 own-token invariant)", () => {
    expect(
      expected(fw, key)
        .d1.map((r: { text: string }) => r.text)
        .join(" ")
    ).toContain(`dt('${key}.`);
  });
});
