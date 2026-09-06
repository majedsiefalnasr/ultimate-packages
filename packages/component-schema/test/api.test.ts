import { describe, it, expect } from "vitest";
import type { EventFact } from "../src/api";

describe("EventFact — Table's sort-changed divergence (spec §12 worked example)", () => {
  it("represents the same semanticId with three different, non-unified frameworkName/mechanism pairs", () => {
    const ngEvent: EventFact = { semanticId: "sort-changed", frameworkName: "sortFieldChange", mechanism: "output" };
    const reactEvent: EventFact = { semanticId: "sort-changed", frameworkName: "onSort", mechanism: "callback-prop" };
    const vueEvent: EventFact = { semanticId: "sort-changed", frameworkName: "sort", mechanism: "emit" };
    expect(ngEvent.semanticId).toBe(reactEvent.semanticId);
    expect(ngEvent.semanticId).toBe(vueEvent.semanticId);
    expect(new Set([ngEvent.frameworkName, reactEvent.frameworkName, vueEvent.frameworkName]).size).toBe(3);
  });
});

describe("EventFact — Button's empty-events case", () => {
  it("permits an empty events array (no custom events, native click passthrough only)", () => {
    const events: EventFact[] = [];
    expect(events).toHaveLength(0);
  });
});
