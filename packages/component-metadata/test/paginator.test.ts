import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { PAGINATOR_METADATA } from "../src/records/paginator";
import { ALL_COMPONENTS } from "../src/index";

describe("Paginator metadata record (ground truth: packages/{ng,react,vue}/src/paginator/*)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(PAGINATOR_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("records the real first/rows/totalRecords props on every framework (paginator.ts:173-176, paginator.tsx:14-17, base-paginator.ts:9-11)", () => {
    for (const fw of ["ng", "react", "vue"] as const) {
      const propNames = PAGINATOR_METADATA.api?.[fw]?.props.map((p) => p.name) ?? [];
      expect(propNames, `${fw} props`).toContain("first");
      expect(propNames, `${fw} props`).toContain("rows");
      expect(propNames, `${fw} props`).toContain("totalRecords");
    }
  });

  it("records ng's real onPageChange output (paginator.ts:178, output<PaginatorPageChangeEvent>())", () => {
    const ngEvents = PAGINATOR_METADATA.api?.ng?.events ?? [];
    const pageChange = ngEvents.find((e) => e.semanticId === "pageChanged");
    expect(pageChange?.frameworkName).toBe("onPageChange");
    expect(pageChange?.mechanism).toBe("output");
  });

  it("records react's real onPageChange callback prop (paginator.tsx:18, required — no uncontrolled fallback)", () => {
    const reactEvents = PAGINATOR_METADATA.api?.react?.events ?? [];
    const pageChange = reactEvents.find((e) => e.semanticId === "pageChanged");
    expect(pageChange?.frameworkName).toBe("onPageChange");
    expect(pageChange?.mechanism).toBe("callback-prop");
  });

  it("records vue's real 'page' emit — NOT 'onPageChange' — matching its actual emits array (base-paginator.ts:14, $emit('page', ...) in Paginator.vue:91)", () => {
    const vueEvents = PAGINATOR_METADATA.api?.vue?.events ?? [];
    const pageChange = vueEvents.find((e) => e.semanticId === "pageChanged");
    expect(pageChange?.frameworkName).toBe("page");
    expect(pageChange?.mechanism).toBe("emit");
  });

  it("records vue's real update:first/update:rows v-model companion emits, with no ng/react equivalent (base-paginator.ts:14, Paginator.vue:92-93)", () => {
    const vueEvents = PAGINATOR_METADATA.api?.vue?.events ?? [];
    const eventNames = vueEvents.map((e) => e.frameworkName);
    expect(eventNames).toContain("update:first");
    expect(eventNames).toContain("update:rows");
  });
});
