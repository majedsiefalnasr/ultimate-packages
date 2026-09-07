import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { SCROLLER_METADATA } from "../src/records/scroller";
import { ALL_COMPONENTS } from "../src/index";

describe("Scroller metadata record (ground truth: packages/{ng,react,vue}/src/scroller/*)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(SCROLLER_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("records the real items/itemSize/numToleratedItems props on every framework (scroller.ts:96-98, scroller.tsx:21-23, base-scroller.ts:9-11)", () => {
    for (const fw of ["ng", "react", "vue"] as const) {
      const propNames = SCROLLER_METADATA.api?.[fw]?.props.map((p) => p.name) ?? [];
      expect(propNames, `${fw} props`).toContain("items");
      expect(propNames, `${fw} props`).toContain("itemSize");
      expect(propNames, `${fw} props`).toContain("numToleratedItems");
    }
  });

  it("records ng's real onLazyLoad output (scroller.ts:103, output<{first, last}>())", () => {
    const ngEvents = SCROLLER_METADATA.api?.ng?.events ?? [];
    const lazyLoad = ngEvents.find((e) => e.semanticId === "lazyLoad");
    expect(lazyLoad?.frameworkName).toBe("onLazyLoad");
    expect(lazyLoad?.mechanism).toBe("output");
  });

  it("records react's real onLazyLoad callback prop (scroller.tsx:27, optional callback)", () => {
    const reactEvents = SCROLLER_METADATA.api?.react?.events ?? [];
    const lazyLoad = reactEvents.find((e) => e.semanticId === "lazyLoad");
    expect(lazyLoad?.frameworkName).toBe("onLazyLoad");
    expect(lazyLoad?.mechanism).toBe("callback-prop");
  });

  it("records vue's real 'lazy-load' emit — NOT 'onLazyLoad' — matching its actual emits array (Scroller.vue:62, $emit('lazy-load', ...) in Scroller.vue:149)", () => {
    const vueEvents = SCROLLER_METADATA.api?.vue?.events ?? [];
    const lazyLoad = vueEvents.find((e) => e.semanticId === "lazyLoad");
    expect(lazyLoad?.frameworkName).toBe("lazy-load");
    expect(lazyLoad?.mechanism).toBe("emit");
  });
});
