import { describe, it, expect } from "vitest";
import { ALL_COMPONENTS } from "@ultimate/component-metadata";
import { renderSection } from "../src/render-section";

const TABLE = ALL_COMPONENTS.find((c) => c.name === "Table")!;
const BUTTON = ALL_COMPONENTS.find((c) => c.name === "Button")!;

describe("renderSection", () => {
  it("renders non-empty preferred-patterns content for Table, the one record with populated guidance.usageNotes", () => {
    const result = renderSection("preferred-patterns", TABLE, ["ng", "react", "vue"]);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain("virtualized window");
  });

  it("renders empty preferred-patterns content for Button, whose guidance.usageNotes is absent", () => {
    const result = renderSection("preferred-patterns", BUTTON, ["ng", "react", "vue"]);
    expect(result).toBe("");
  });

  it("renders empty anti-patterns content for Button, whose guidance.antiPatterns is absent", () => {
    const result = renderSection("anti-patterns", BUTTON, ["ng", "react", "vue"]);
    expect(result).toBe("");
  });

  it("renders allowed-apis content listing every prop name for the requested frameworks, for Button", () => {
    const result = renderSection("allowed-apis", BUTTON, ["ng"]);
    expect(result).toContain("label");
    expect(result).toContain("icon");
    expect(result).toContain("iconPos");
  });

  it("renders allowed-apis content narrowed to only the requested frameworks — react props absent when only ng is requested", () => {
    const result = renderSection("allowed-apis", BUTTON, ["ng"]);
    // "badge" is a real react-only Button prop (per component-metadata/src/records/button.ts),
    // not present in ng's prop list — confirms narrowing, not just presence-checking.
    expect(result).not.toContain("badge");
  });

  it("renders empty accessibility-guidance content for Button, whose accessibility facet is entirely absent", () => {
    const result = renderSection("accessibility-guidance", BUTTON, ["ng", "react", "vue"]);
    expect(result).toBe("");
  });

  it("renders non-empty related-components content for Table, whose relationships.dependsOn is [\"Paginator\", \"Scroller\"]", () => {
    const result = renderSection("related-components", TABLE, ["ng", "react", "vue"]);
    expect(result).toContain("Paginator");
    expect(result).toContain("Scroller");
  });

  it("renders empty related-components content for Button, whose relationships facet is entirely absent", () => {
    const result = renderSection("related-components", BUTTON, ["ng", "react", "vue"]);
    expect(result).toBe("");
  });

  it("is deterministic — rendering the same section twice from the same input produces byte-identical output", () => {
    const first = renderSection("allowed-apis", TABLE, ["ng", "react", "vue"]);
    const second = renderSection("allowed-apis", TABLE, ["ng", "react", "vue"]);
    expect(first).toBe(second);
  });
});
