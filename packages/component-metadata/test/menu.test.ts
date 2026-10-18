import { describe, it, expect } from "vitest";
import { validateComponentMetadata } from "@ultimate/component-schema";
import { MENU_METADATA } from "../src/records/menu";
import { ALL_COMPONENTS } from "../src/index";

describe("Menu metadata record (ground truth: packages/{ng,react,vue}/src/menu/*)", () => {
  it("is valid against the schema", () => {
    expect(validateComponentMetadata(MENU_METADATA, ALL_COMPONENTS).valid).toBe(true);
  });

  it("records the real 'model' and 'popup' signal-input props on ng (menu.ts:143,145)", () => {
    const ngPropNames = MENU_METADATA.api?.ng?.props.map((p) => p.name) ?? [];
    expect(ngPropNames).toContain("model");
    expect(ngPropNames).toContain("popup");
  });

  it("records ng's real popup-mode onShow/onHide outputs (GAP-067, menu.ts:188-190), emitted synchronously from show()/hide()", () => {
    const ngEvents = MENU_METADATA.api?.ng?.events ?? [];
    expect(ngEvents.map((e) => [e.semanticId, e.frameworkName, e.mechanism])).toEqual([
      ["shown", "onShow", "output"],
      ["hidden", "onHide", "output"],
    ]);
  });

  it("records ng's GAP-067 popup inputs appendTo/baseZIndex/closeOnEscape (menu.ts:181-185)", () => {
    const ngPropNames = MENU_METADATA.api?.ng?.props.map((p) => p.name) ?? [];
    expect(ngPropNames).toEqual(["model", "popup", "appendTo", "baseZIndex", "closeOnEscape"]);
  });

  it("records react's real onShow/onHide callback props, called at toggle-start/leave-motion-complete respectively (menu.tsx:44-45,134-141,208-223)", () => {
    const reactEvents = MENU_METADATA.api?.react?.events ?? [];
    const shown = reactEvents.find((e) => e.semanticId === "shown");
    const hidden = reactEvents.find((e) => e.semanticId === "hidden");
    expect(shown?.frameworkName).toBe("onShow");
    expect(hidden?.frameworkName).toBe("onHide");
    expect(shown?.mechanism).toBe("callback-prop");
  });

  it("records vue's real show/hide emits (Menu.vue: emits array line 76, $emit('show')/$emit('hide') in onEnter/onLeave)", () => {
    const vueEvents = MENU_METADATA.api?.vue?.events ?? [];
    const shown = vueEvents.find((e) => e.semanticId === "shown");
    const hidden = vueEvents.find((e) => e.semanticId === "hidden");
    expect(shown?.frameworkName).toBe("show");
    expect(hidden?.frameworkName).toBe("hide");
    expect(shown?.mechanism).toBe("emit");
  });

  it("records the real react popupAlignment prop (accepted for API parity, positioning deliberately deferred — menu.tsx:35)", () => {
    const reactPropNames = MENU_METADATA.api?.react?.props.map((p) => p.name) ?? [];
    expect(reactPropNames).toContain("popupAlignment");
  });

  it("records the real vue autoZIndex/tabindex props (BaseMenu.ts:18,20)", () => {
    const vuePropNames = MENU_METADATA.api?.vue?.props.map((p) => p.name) ?? [];
    expect(vuePropNames).toContain("autoZIndex");
    expect(vuePropNames).toContain("tabindex");
  });
});
