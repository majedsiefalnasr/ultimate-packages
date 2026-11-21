import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { StyleSheet, Theme, registerThemeVariables, type StyleMeta } from "../src/index";

class DomStyleSheet extends StyleSheet<HTMLStyleElement> {
  override createStyleElement(meta: StyleMeta): HTMLStyleElement {
    const element = document.createElement("style");
    element.textContent = meta.css ?? "";
    if (meta.first) document.head.prepend(element);
    else document.head.appendChild(element);
    return element;
  }
  override updateStyleElement(element: HTMLStyleElement, meta: StyleMeta<HTMLStyleElement>) {
    element.textContent = meta.css ?? "";
  }
}

const LAYER_ORDER_KEY = "u-layer-order";

const basePreset = {
  primitive: { blue: { 500: "#3B82F6" } },
  semantic: { primary: { color: "{blue.500}" } },
  components: { button: { borderRadius: "4px" } },
};

function applyTheme(cssLayer: boolean | object, preset: Record<string, unknown> = basePreset) {
  Theme.setTheme({
    preset,
    options: { prefix: "u", darkModeSelector: "system", cssLayer },
  });
}

function headStyleTexts(): string[] {
  return Array.from(document.head.querySelectorAll("style")).map((el) => el.textContent ?? "");
}

describe("StyleSheet.add with first", () => {
  it("moves a first entry to the front of the registry order", () => {
    const sheet = new StyleSheet();
    sheet.add("a", ".a{}");
    sheet.add("b", ".b{}");
    sheet.add("lead", "@layer x", { first: true });

    expect([...sheet.getStyles().keys()]).toEqual(["lead", "a", "b"]);
    expect(sheet.getAllCSS()).toEqual(["@layer x", ".a{}", ".b{}"]);
  });

  it("reports first on the meta passed to createStyleElement", () => {
    const seen: Array<boolean | undefined> = [];
    class Spy extends StyleSheet {
      override createStyleElement(meta: StyleMeta) {
        seen.push(meta.first);
        return undefined;
      }
    }
    const sheet = new Spy();

    sheet.add("a", ".a{}");
    sheet.add("lead", "@layer x", { first: true });

    expect(seen).toEqual([undefined, true]);
  });

  it("keeps the position of a first entry when it is updated", () => {
    const sheet = new StyleSheet();
    sheet.add("lead", "@layer x", { first: true });
    sheet.add("a", ".a{}");

    sheet.update("lead", "@layer y");

    expect([...sheet.getStyles().keys()]).toEqual(["lead", "a"]);
    expect(sheet.get("lead")?.css).toBe("@layer y");
  });

  it("registers a missing key as first through update", () => {
    const sheet = new StyleSheet();
    sheet.add("a", ".a{}");

    sheet.update("lead", "@layer x", { first: true });

    expect([...sheet.getStyles().keys()]).toEqual(["lead", "a"]);
  });
});

describe("registerThemeVariables: CSS layer order (F6)", () => {
  let sheet: DomStyleSheet;

  beforeEach(() => {
    sheet = new DomStyleSheet();
  });

  afterEach(() => {
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("registers nothing for the layer order when cssLayer is off", () => {
    applyTheme(false);

    registerThemeVariables(sheet, "button");

    expect(sheet.has(LAYER_ORDER_KEY)).toBe(false);
    expect([...sheet.getStyles().keys()]).toEqual(["u-common-variables", "button-variables"]);
    expect(headStyleTexts().some((text) => text.includes("@layer"))).toBe(false);
  });

  it("registers nothing for the layer order when cssLayer is not set", () => {
    Theme.setTheme({ preset: basePreset, options: { prefix: "u", darkModeSelector: "system" } });

    registerThemeVariables(sheet, "button");

    expect(sheet.has(LAYER_ORDER_KEY)).toBe(false);
  });

  it("registers the layer-order statement when cssLayer is on", () => {
    applyTheme(true);

    registerThemeVariables(sheet, "button");

    expect(sheet.get(LAYER_ORDER_KEY)?.css).toBe("@layer ultimate");
  });

  it("puts the layer-order statement before every other registered style", () => {
    applyTheme(true, { ...basePreset, css: "li.u-x{transition:none;}" });
    sheet.add("early-unlayered", ".u-early{}");

    registerThemeVariables(sheet, "button");
    registerThemeVariables(sheet, "card");

    const keys = [...sheet.getStyles().keys()];
    expect(keys[0]).toBe(LAYER_ORDER_KEY);
    expect(keys).toContain("u-global-style");
    expect(sheet.getAllCSS()[0]).toBe("@layer ultimate");
  });

  it("puts the layer-order element first in the document head", () => {
    applyTheme(true);
    sheet.add("early-unlayered", ".u-early{}");

    registerThemeVariables(sheet, "button");

    const texts = headStyleTexts();
    expect(texts[0]).toBe("@layer ultimate");
    expect(texts.filter((text) => text === "@layer ultimate")).toHaveLength(1);
    expect(texts.findIndex((text) => /@layer ultimate\s*\{/.test(text))).toBeGreaterThan(0);
  });

  it("registers the statement once however many components register", () => {
    applyTheme(true);

    registerThemeVariables(sheet, "button");
    registerThemeVariables(sheet, "card");
    registerThemeVariables(sheet, "button");

    expect(headStyleTexts().filter((text) => text === "@layer ultimate")).toHaveLength(1);
  });

  it("uses the configured order when cssLayer carries one", () => {
    applyTheme({ name: "ultimate", order: "ultimate, primeng" });

    registerThemeVariables(sheet, "button");

    expect(sheet.get(LAYER_ORDER_KEY)?.css).toBe("@layer ultimate, primeng");
  });

  it("falls back to the layer name when cssLayer has no order", () => {
    applyTheme({ name: "brand" });

    registerThemeVariables(sheet, "button");

    expect(sheet.get(LAYER_ORDER_KEY)?.css).toBe("@layer brand");
  });

  it("computes a function order after the variables have recorded their layer names", () => {
    applyTheme({
      name: "fn-order-layer",
      order: ({ names }: { names: string[] }) => names.join(", "),
    });

    registerThemeVariables(sheet, "button");

    expect(sheet.get(LAYER_ORDER_KEY)?.css).toContain("fn-order-layer");
  });

  it("follows a cssLayer switched on after components are mounted", () => {
    applyTheme(false);
    registerThemeVariables(sheet, "button");
    expect(sheet.has(LAYER_ORDER_KEY)).toBe(false);

    Theme.setOptions({ prefix: "u", darkModeSelector: "system", cssLayer: true });

    expect(sheet.get(LAYER_ORDER_KEY)?.css).toBe("@layer ultimate");
    expect([...sheet.getStyles().keys()][0]).toBe(LAYER_ORDER_KEY);
    expect(headStyleTexts()[0]).toBe("@layer ultimate");
  });

  it("follows a changed order and empties the statement when cssLayer is switched off", () => {
    applyTheme(true);
    registerThemeVariables(sheet, "button");

    Theme.setOptions({
      prefix: "u",
      darkModeSelector: "system",
      cssLayer: { name: "ultimate", order: "ultimate, primeng" },
    });
    expect(sheet.get(LAYER_ORDER_KEY)?.css).toBe("@layer ultimate, primeng");

    Theme.setOptions({ prefix: "u", darkModeSelector: "system", cssLayer: false });
    expect(sheet.get(LAYER_ORDER_KEY)?.css).toBe("");
    expect(sheet.get(LAYER_ORDER_KEY)?.element?.textContent).toBe("");
  });

  it("keeps the statement first after a preset change rewrites the variables", () => {
    applyTheme(true, { ...basePreset, css: "li.u-x{transition:none;}" });
    registerThemeVariables(sheet, "button");

    Theme.setPreset({ ...basePreset, css: "li.u-y{transition:none;}" });

    expect([...sheet.getStyles().keys()][0]).toBe(LAYER_ORDER_KEY);
    expect(headStyleTexts()[0]).toBe("@layer ultimate");
    expect(sheet.get("u-global-style")?.css).toContain("li.u-y");
  });
});
