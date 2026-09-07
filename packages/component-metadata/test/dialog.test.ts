import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { DIALOG_METADATA } from "../src/records/dialog";
import { ALL_COMPONENTS } from "../src/index";

describe("Dialog metadata record (ground truth: packages/ng/src/dialog/dialog.ts:180,182 — real output<void>()s)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(DIALOG_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("records onShow/onHide as void-payload lifecycle events, distinct shape from Table's payload-bearing state-change events", () => {
    const ngEvents = DIALOG_METADATA.api?.ng?.events ?? [];
    const show = ngEvents.find((e) => e.semanticId === "shown");
    const hide = ngEvents.find((e) => e.semanticId === "hidden");
    expect(show?.frameworkName).toBe("onShow");
    expect(hide?.frameworkName).toBe("onHide");
    expect(show?.mechanism).toBe("output");
  });
});
