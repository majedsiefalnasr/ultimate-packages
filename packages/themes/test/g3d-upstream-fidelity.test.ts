import { describe, it, expect } from "vitest";
import {
  BASE_ROLE,
  BASE_SOURCES,
  CANDIDATES,
  COUNTS,
  FIXTURE,
  FRAMEWORKS,
  KEPT,
  KEYS,
  OMITTED,
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
} from "./utils/g3d-port.mjs";

/**
 * GAP-064 G3-D (Spec §5, §6, §8, §9.5 AC3): each of the 12 style modules
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

describe("G3-D upstream fixture and data model (Spec §5, §8)", () => {
  it("covers the 6 G3-D keys plus base and records its source", () => {
    expect(Object.keys(FIXTURE.modules).sort()).toEqual([...KEYS, "base"].sort());
    expect(FIXTURE._meta.source).toContain("@primeuix/styles@2.0.3");
  });

  it.each(FRAMEWORKS as Fw[])(
    "%s: D1 + D2 = 77, disjoint, per-key counts pinned (34 + 43)",
    (fw) => {
      let upstream = 0;
      let ported = 0;
      let omitted = 0;
      for (const key of KEYS as string[]) {
        const e = expected(fw, key);
        const [u, p] = (COUNTS as Record<string, number[]>)[key];
        expect(e.upstream, key).toBe(u);
        expect(e.d1.length, key).toBe(p);
        const all = [
          ...e.d1.map((r: { n: number }) => r.n),
          ...e.d2.map((r: { n: number }) => r.n),
        ];
        expect(
          all.sort((a, b) => a - b),
          key
        ).toEqual(Array.from({ length: u }, (_, i) => i + 1));
        upstream += e.upstream;
        ported += e.d1.length;
        omitted += e.d2.length;
      }
      expect({ upstream, ported, omitted }).toEqual((TOTALS as Record<Fw, unknown>)[fw]);
    }
  );

  it("Spec §5.7 per-key counts are literal", () => {
    expect(COUNTS).toEqual({
      confirmdialog: [2, 2],
      confirmpopup: [13, 6],
      drawer: [33, 12],
      popover: [9, 2],
      splitbutton: [10, 5],
      speeddial: [10, 7],
    });
  });

  it("D2 tags are exactly FX-D1..FX-D8, identical in both frameworks", () => {
    const tags = (fw: Fw) =>
      new Set(
        Object.values((OMITTED as Record<Fw, Record<string, Record<number, string>>>)[fw]).flatMap(
          (m) => Object.values(m)
        )
      );
    const all = ["FX-D1", "FX-D2", "FX-D3", "FX-D4", "FX-D5", "FX-D6", "FX-D7", "FX-D8"];
    expect([...tags("ng")].sort()).toEqual(all);
    expect([...tags("vue")].sort()).toEqual(all);
  });

  it("Spec §4 normative mapping examples", () => {
    for (const fw of FRAMEWORKS as Fw[]) {
      expect(mapSelector(fw, "confirmdialog", ".p-confirmdialog .p-dialog-content")).toBe(
        ".u-dialog-content:has(> .u-confirmdialog-message)"
      );
      expect(mapSelector(fw, "drawer", ".p-drawer-full .p-drawer")).toBe(
        ".u-drawer.u-drawer-position-full"
      );
      expect(
        mapSelector(
          fw,
          "drawer",
          ".p-drawer-left .p-drawer-content, .p-drawer-top .p-drawer-content"
        )
      ).toBe(
        ".u-drawer.u-drawer-position-left .u-drawer-content, .u-drawer.u-drawer-position-top .u-drawer-content"
      );
      expect(mapSelector(fw, "drawer", ".p-drawer-mask:dir(rtl)")).toBe(".u-drawer-mask:dir(rtl)");
      expect(mapSelector(fw, "speeddial", ".p-speeddial-open .p-speeddial-item")).toBe(
        ".u-speeddial:has(> .u-speeddial-button.u-speeddial-open) .u-speeddial-item"
      );
    }
    expect(
      mapSelector("ng", "splitbutton", ".p-splitbutton-button.p-button:not(:disabled):hover")
    ).toBe(".u-splitbutton-button > .u-button:not(:disabled):hover");
    expect(
      mapSelector("vue", "splitbutton", ".p-splitbutton-dropdown.p-button:focus-visible")
    ).toBe(".u-splitbutton-dropdown.u-button:focus-visible");
  });

  it("D3 declarations equal the upstream base groups, except the recorded PX-B3 difference", () => {
    const base = parseGroups(FIXTURE.modules.base).map((g: { head: string; body: string }) => ({
      head: norm(g.head),
      body: g.body,
    }));
    for (const src of BASE_SOURCES) {
      const group = base.find((b: { head: string }) => b.head === src.base);
      expect(group, src.base).toBeDefined();
      const want = decl(group!.body);
      for (const [prop, [from, to]] of Object.entries(src.differs as Record<string, string[]>)) {
        expect(want[prop], `${src.base} ${prop}`).toBe(from);
        want[prop] = to;
      }
      for (const fw of FRAMEWORKS as Fw[])
        for (const key of src.keys)
          expect(
            decl(bodyOf(norm((BASE_ROLE as Rules)[fw][key][src.ruleIndex]))),
            `${fw} ${key}`
          ).toEqual(want);
    }
  });

  it("D4 is exactly the Spec §6.2 runtime roles (R-1..R-4)", () => {
    for (const fw of FRAMEWORKS as Fw[])
      expect(Object.keys((RUNTIME_ROLE as Rules)[fw]).sort(), fw).toEqual([
        "drawer",
        "popover",
        "speeddial",
      ]);
    expect((RUNTIME_ROLE as Rules).vue.popover).toEqual([".u-popover { position: absolute; }"]); // OI-D1
    expect(JSON.stringify(RUNTIME_ROLE)).not.toMatch(/\.u-popover \{[^}]*(top|left)/);
    expect((RUNTIME_ROLE as Rules).ng.drawer).toContain(
      ".u-drawer-position-right { margin-left: auto; }"
    ); // OI-D3
    expect((RUNTIME_ROLE as Rules).ng.drawer).toContain(
      ".u-drawer-position-bottom { margin-top: auto; }"
    );
    expect(JSON.stringify(RUNTIME_ROLE)).not.toMatch(/margin-inline|margin-block/);
    expect((RUNTIME_ROLE as Rules).ng.drawer.join(" ")).toContain("[ufocustrap]"); // D-D7
    expect((RUNTIME_ROLE as Rules).vue.drawer.join(" ")).not.toContain("[ufocustrap]");
    expect(JSON.stringify(RUNTIME_ROLE)).not.toMatch(/data-u-/);
  });

  it("D5 is a subset of the Spec §6.4 rules; R-D1 always retained", () => {
    for (const fw of FRAMEWORKS as Fw[]) {
      const allowed = new Set(
        Object.values((CANDIDATES as Rules)[fw])
          .flat()
          .map(norm)
      );
      for (const rules of Object.values((RETAINED as Rules)[fw]))
        for (const r of rules) expect(allowed.has(norm(r)), `${fw}: ${r}`).toBe(true);
    }
    expect(KEPT).toContain("R-D1");
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

  it("SpeedDial mask cascade: D3 fixed role precedes D1 group 7 (Spec §16 lock)", () => {
    for (const fw of FRAMEWORKS as Fw[]) {
      const css = expectedCss(fw, "speeddial");
      const role = css.findIndex((r: string) => r.startsWith(".u-speeddial-mask{background:"));
      const g7 = css.findIndex((r: string) => r.startsWith(".u-speeddial-mask{position: absolute"));
      expect(role, fw).toBe(0);
      expect(g7, fw).toBeGreaterThan(role);
    }
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
