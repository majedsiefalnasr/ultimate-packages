import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BASE_ROLE,
  BASE_SOURCES,
  CANDIDATES,
  COUNTS,
  FIXTURE,
  FRAMEWORKS,
  KEYS,
  OMITTED,
  REPO,
  RETAINED,
  RUNTIME_ROLE,
  TOTALS,
  actualCssText,
  actualRules,
  declarations,
  expected,
  expectedCss,
  mapSelector,
  norm,
  parseGroups,
} from "./utils/g3c2-port.mjs";

/**
 * GAP-064 G3-C2 (Spec §5, §6, §8, §9.5 AC3): each of the 10 menu style modules
 * contains exactly D3 → D1 (upstream order) → D4 → D5, derived from the
 * committed @primeuix/styles 2.0.3 fixture; D2 never appears.
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

describe("G3-C2 upstream fixture and data model (Spec §5, §8)", () => {
  it("covers the 5 G3-C2 keys plus base and records its source", () => {
    expect(Object.keys(FIXTURE.modules).sort()).toEqual([...KEYS, "base"].sort());
    expect(FIXTURE._meta.source).toContain("@primeuix/styles@2.0.3");
  });

  it.each(FRAMEWORKS as Fw[])(
    "%s: D1 + D2 = 177, disjoint, per-key counts pinned (100 + 77)",
    (fw) => {
      let upstream = 0;
      let ported = 0;
      let omitted = 0;
      for (const key of KEYS as string[]) {
        const e = expected(fw, key);
        const [u, p] = (COUNTS as Record<string, number[]>)[key];
        expect(e.upstream, key).toBe(u);
        expect(e.d1.length, key).toBe(p);
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

  it("D2 tags are exactly FX-M1..FX-M7, identical in both frameworks", () => {
    const tags = (fw: Fw) =>
      new Set(
        Object.values((OMITTED as Record<Fw, Record<string, Record<number, string>>>)[fw]).flatMap(
          (m) => Object.values(m)
        )
      );
    const all = ["FX-M1", "FX-M2", "FX-M3", "FX-M4", "FX-M5", "FX-M6", "FX-M7"];
    expect([...tags("ng")].sort()).toEqual(all);
    expect([...tags("vue")].sort()).toEqual(all);
  });

  it("Spec §4 normative mapping examples", () => {
    for (const fw of FRAMEWORKS as Fw[]) {
      expect(
        mapSelector(fw, "tieredmenu", ".p-tieredmenu-item-active > .p-tieredmenu-item-content")
      ).toBe(".u-tieredmenu-item-open > .u-tieredmenu-item-content");
      expect(
        mapSelector(
          fw,
          "tieredmenu",
          ".p-tieredmenu-item:not(.p-disabled) > .p-tieredmenu-item-content:hover"
        )
      ).toBe(
        ".u-tieredmenu-item:not(.u-tieredmenu-item-disabled) > .u-tieredmenu-item-content:hover"
      );
      expect(
        mapSelector(fw, "contextmenu", ".p-contextmenu-root-list, .p-contextmenu-submenu")
      ).toBe(".u-contextmenu-root-list");
      expect(
        mapSelector(fw, "contextmenu", ".p-contextmenu-item.p-focus > .p-contextmenu-item-content")
      ).toBe(".u-contextmenu-item.u-contextmenu-item-focused > .u-contextmenu-item-content");
      expect(mapSelector(fw, "megamenu", ".p-megamenu-horizontal .p-megamenu-root-list")).toBe(
        ".u-megamenu .u-megamenu-root-list"
      );
      expect(mapSelector(fw, "panelmenu", ".p-panelmenu-panel")).toBe(
        ".u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item)"
      );
      expect(mapSelector(fw, "panelmenu", ".p-panelmenu-submenu")).toBe(
        ".u-panelmenu-item .u-panelmenu-submenu"
      );
      expect(mapSelector(fw, "panelmenu", ".p-panelmenu-header-icon, .p-panelmenu-item-icon")).toBe(
        ".u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item) > .u-panelmenu-header-content .u-panelmenu-header-icon, .u-panelmenu-item .u-panelmenu-item > .u-panelmenu-header-content .u-panelmenu-header-icon"
      );
    }
    expect(
      mapSelector(
        "ng",
        "menubar",
        ".p-menubar-submenu > .p-menubar-item-active > .p-menubar-submenu"
      )
    ).toBe(".u-menubar-submenu > .u-menubar-item-open > u-menubar-sub > .u-menubar-submenu");
    expect(
      mapSelector(
        "vue",
        "menubar",
        ".p-menubar-submenu > .p-menubar-item-active > .p-menubar-submenu"
      )
    ).toBe(".u-menubar-submenu > .u-menubar-item-open > .u-menubar-submenu");
    expect(mapSelector("ng", "panelmenu", ".p-panelmenu-content-container")).toBe(
      ".u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item) > u-panel-menu-list > .u-panelmenu-submenu"
    );
    expect(mapSelector("vue", "panelmenu", ".p-panelmenu-content-container")).toBe(
      ".u-panelmenu-item:not(.u-panelmenu-item .u-panelmenu-item) > .u-panelmenu-submenu"
    );
  });

  it("D3 declarations equal the upstream base groups exactly, for all five keys", () => {
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
            `${fw} ${key}`
          ).toEqual(decl(group!.body));
    }
  });

  it("D4 is exactly the Spec §6.2 runtime-role rules (roles 1, 2, 3, 4; role 1b excluded, §18 A1)", () => {
    for (const fw of FRAMEWORKS as Fw[])
      expect(Object.keys((RUNTIME_ROLE as Rules)[fw]).sort(), fw).toEqual([
        "contextmenu",
        "menubar",
        "tieredmenu",
      ]);
    expect(JSON.stringify(RUNTIME_ROLE)).not.toContain("u-panelmenu"); // PR-7: no PanelMenu D4 rule
    expect((RUNTIME_ROLE as Rules).vue.contextmenu).toEqual([
      ".u-contextmenu { position: absolute; }",
    ]);
    expect((RUNTIME_ROLE as Rules).ng.tieredmenu[0]).toContain("> u-tiered-menu-sub >");
    expect((RUNTIME_ROLE as Rules).vue.tieredmenu[0]).not.toContain("u-tiered-menu-sub");
    expect((RUNTIME_ROLE as Rules).ng.tieredmenu).toContain(
      ".u-tieredmenu-submenu { inset-inline-start: 100%; top: 0; }"
    );
    expect(JSON.stringify(RUNTIME_ROLE)).not.toMatch(/data-u-/); // D-C2-2: classes, not attributes
  });

  it("D5 is a subset of the Spec §6.3 candidates; no other Ultimate-only rule", () => {
    const allowed = new Set(
      Object.values(CANDIDATES as Record<string, string[]>)
        .flat()
        .map(norm)
    );
    for (const fw of FRAMEWORKS as Fw[])
      for (const rules of Object.values((RETAINED as Rules)[fw]))
        for (const r of rules) expect(allowed.has(norm(r)), r).toBe(true);
    expect(JSON.stringify(RETAINED)).not.toContain("top: 0; left: 0"); // OI-2 dropped
  });

  it("D4 and D5 never redeclare a D1 property on the same selector", () => {
    for (const fw of FRAMEWORKS as Fw[])
      for (const key of KEYS as string[]) {
        const d1 = expected(fw, key).d1.map((r: { text: string }) => declarations(r.text));
        const extra = [
          ...((RUNTIME_ROLE as Rules)[fw][key] ?? []),
          ...((RETAINED as Rules)[fw][key] ?? []),
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

describe.each(CASES)("$fw $key style module (AC3)", ({ fw, key }) => {
  it("contains exactly D3 → D1 → D4 → D5, nothing else", () => {
    expect(actualRules(fw, key)).toEqual(expectedCss(fw, key));
  });

  it("every rule belongs to exactly one of D1, D3, D4, D5; nothing from D2", () => {
    const sets = [
      expected(fw, key).d1.map((r: { text: string }) => r.text),
      ((BASE_ROLE as Rules)[fw][key] ?? []).map(norm),
      ((RUNTIME_ROLE as Rules)[fw][key] ?? []).map(norm),
      ((RETAINED as Rules)[fw][key] ?? []).map(norm),
    ];
    for (const rule of actualRules(fw, key))
      expect(sets.filter((s) => s.includes(rule)).length, rule).toBe(1);
    const heads = actualRules(fw, key).map((r) => r.slice(0, r.indexOf("{")));
    for (const g of expected(fw, key).d2)
      expect(heads, g.head).not.toContain(mapSelector(fw, key, g.head));
  });

  it("keeps no upstream p- name, no raw --u- variable and no data-u- attribute selector", () => {
    const css = norm(actualCssText(fw, key));
    expect(css).not.toMatch(/\.p-[a-z]/);
    expect(css).not.toMatch(/var\(--u-/);
    expect(css).not.toMatch(/\[data-u-/);
  });

  it("D1 references at least one own token", () => {
    expect(
      expected(fw, key)
        .d1.map((r: { text: string }) => r.text)
        .join(" ")
    ).toContain(`dt('${key}.`);
  });
});
