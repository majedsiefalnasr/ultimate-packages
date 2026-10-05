import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BASE_EXCLUDED,
  BASE_ROLE,
  BASE_SOURCES,
  COUNTS,
  FIXTURE,
  FRAMEWORKS,
  INLINE_ROLE,
  KEYS,
  OMITTED,
  REPO,
  RETAINED,
  TOTALS,
  actualCssText,
  actualRules,
  declarations,
  expected,
  expectedCss,
  norm,
  parseGroups,
} from "./utils/g3b-port.mjs";

/**
 * GAP-064 G3-B C3 (Spec §8 C3, §5.4, §5.9, §13): each of the 20 framework style
 * files contains exactly D3 → D1 (upstream source order) → D4 → D5, derived
 * from the committed @primeuix/styles 2.0.3 fixture; D2 and D6 never appear.
 */
type Fw = "ng" | "vue";
const CASES = (FRAMEWORKS as Fw[]).flatMap((fw) => (KEYS as string[]).map((key) => ({ fw, key })));
const decl = (body: string) =>
  Object.fromEntries(
    norm(body)
      .split(";")
      .filter(Boolean)
      .map((d) => [d.slice(0, d.indexOf(":")).trim(), d.slice(d.indexOf(":") + 1).trim()])
  );
const bodyOf = (rule: string) => rule.slice(rule.indexOf("{") + 1, -1);

describe("G3-B upstream fixture and data model (Spec §5.9)", () => {
  it("covers the 10 G3-B keys plus base and records its source", () => {
    expect(Object.keys(FIXTURE.modules).sort()).toEqual([...KEYS, "base"].sort());
    expect(FIXTURE._meta.source).toContain("@primeuix/styles@2.0.3");
  });

  it.each(FRAMEWORKS as Fw[])(
    "%s: D1 + D2 = 89 per framework (76 + 13), disjoint, per-key counts pinned",
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
      expect({ upstream, ported, omitted }).toEqual(TOTALS);
    }
  );

  it("D2 tags are exactly FX-B1..FX-B7 (FX-B8 is D6, not a component group)", () => {
    const tags = new Set(
      (FRAMEWORKS as Fw[]).flatMap((fw) =>
        Object.values((OMITTED as Record<Fw, Record<string, Record<number, string>>>)[fw]).flatMap(
          (m) => Object.values(m)
        )
      )
    );
    expect([...tags].sort()).toEqual([
      "FX-B1",
      "FX-B2",
      "FX-B3",
      "FX-B4",
      "FX-B5",
      "FX-B6",
      "FX-B7",
    ]);
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

  it("D3 declarations equal the upstream base groups, except the recorded PX-B3 difference", () => {
    const base = parseGroups(FIXTURE.modules.base).map((g: { head: string; body: string }) => ({
      head: norm(g.head),
      body: g.body,
    }));
    for (const src of BASE_SOURCES) {
      const group = base.find((b: { head: string }) => b.head === src.base);
      expect(group, src.base).toBeDefined();
      const upstream = decl(group!.body);
      for (const fw of FRAMEWORKS as Fw[])
        for (const key of src.keys) {
          const mine = decl(
            bodyOf(
              norm((BASE_ROLE as Record<Fw, Record<string, string[]>>)[fw][key][src.ruleIndex])
            )
          );
          const want = Object.fromEntries(
            Object.entries(upstream).map(([p, v]) => {
              const diff = (src as { differences?: Record<string, string[]> }).differences?.[p];
              if (diff) expect(v, `${src.base} ${p}`).toBe(diff[0]);
              return [p, diff ? diff[1] : v];
            })
          );
          expect(mine, `${fw} ${key} ${src.base}`).toEqual(want);
        }
    }
  });

  it("D6 groups exist in the upstream base module", () => {
    const heads = parseGroups(FIXTURE.modules.base).map((g: { head: string }) => norm(g.head));
    for (const h of BASE_EXCLUDED) expect(heads, h).toContain(h);
  });

  it("D4 and D5 never redeclare a D1 property on the same selector", () => {
    for (const fw of FRAMEWORKS as Fw[])
      for (const key of KEYS as string[]) {
        const d1 = expected(fw, key).d1.map((r: { text: string }) => declarations(r.text));
        const extra = [
          ...((INLINE_ROLE as Record<string, string[]>)[key] ?? []),
          ...((RETAINED as Record<string, string[]>)[key] ?? []),
        ].map((r) => declarations(norm(r)));
        for (const x of extra) {
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
  it("contains exactly D3 → D1 → D4 → D5, nothing else", () => {
    expect(actualRules(fw, key)).toEqual(expectedCss(fw, key));
  });

  it("every rule belongs to exactly one of D1, D3, D4, D5; nothing from D2 or D6", () => {
    const d1 = expected(fw, key).d1.map((r: { text: string }) => r.text);
    const d3 = ((BASE_ROLE as Record<Fw, Record<string, string[]>>)[fw][key] ?? []).map(norm);
    const d4 = ((INLINE_ROLE as Record<string, string[]>)[key] ?? []).map(norm);
    const d5 = ((RETAINED as Record<string, string[]>)[key] ?? []).map(norm);
    for (const rule of actualRules(fw, key)) {
      const hits = [d1, d3, d4, d5].filter((set) => set.includes(rule)).length;
      expect(hits, rule).toBe(1);
    }
    const css = norm(actualCssText(fw, key));
    for (const g of expected(fw, key).d2) expect(css).not.toContain(g.head.replace(/\.p-/g, ".u-"));
    expect(css).not.toMatch(/overlay-mask-(enter|leave)|animate-overlay-mask/);
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
