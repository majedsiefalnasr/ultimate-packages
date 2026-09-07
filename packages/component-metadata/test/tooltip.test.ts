import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { TOOLTIP_METADATA } from "../src/records/tooltip";
import { ALL_COMPONENTS } from "../src/index";

describe("Tooltip metadata record (ground truth: packages/{ng,react,vue}/src/tooltip/* — a directive in ng and vue, a component in react)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(TOOLTIP_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("records the real 'uTooltip'/'uTooltipPosition'/'uTooltipDisabled' signal-input props on ng (tooltip.ts:78,80,82)", () => {
    const ngPropNames = TOOLTIP_METADATA.api?.ng?.props.map((p) => p.name) ?? [];
    expect(ngPropNames).toContain("uTooltip");
    expect(ngPropNames).toContain("uTooltipPosition");
    expect(ngPropNames).toContain("uTooltipDisabled");
  });

  it("has an empty ng events array (UTooltip is a [uTooltip] attribute directive with only internal show()/hide() methods — no output()s exist)", () => {
    expect(TOOLTIP_METADATA.api?.ng?.events).toEqual([]);
  });

  it("has an empty react events array (UTooltipProps has no onShow/onHide callback props — confirmed absent from the full interface, tooltip.tsx:15-28)", () => {
    expect(TOOLTIP_METADATA.api?.react?.events).toEqual([]);
  });

  it("records the real react 'target'/'content'/'event' props, including the hover|focus|both event-trigger prop (tooltip.tsx:16-19)", () => {
    const reactPropNames = TOOLTIP_METADATA.api?.react?.props.map((p) => p.name) ?? [];
    expect(reactPropNames).toContain("target");
    expect(reactPropNames).toContain("content");
    expect(reactPropNames).toContain("event");
  });

  it("has an empty vue events array (tooltipDirective is a Vue custom directive with only mounted/updated/unmounted hooks — no emits exist)", () => {
    expect(TOOLTIP_METADATA.api?.vue?.events).toEqual([]);
  });

  it("records the real vue TooltipBindingValue fields as props, including the escape security-relevant flag (tooltip.ts:6-16)", () => {
    const vuePropNames = TOOLTIP_METADATA.api?.vue?.props.map((p) => p.name) ?? [];
    expect(vuePropNames).toContain("value");
    expect(vuePropNames).toContain("escape");
  });
});
