import { describe, it, expect } from "vitest";
import { style as buttonStyle } from "@ultimate/uix-styles/button";

describe("RTL/LTR direction", () => {
  it("uix-styles' Button CSS still contains its native :dir(rtl) rule, unaffected by Phase 5's dt() wiring changes", () => {
    expect(buttonStyle).toContain(":dir(rtl)");
    expect(buttonStyle).toContain(".u-button-icon-right:dir(rtl)");
  });
});
