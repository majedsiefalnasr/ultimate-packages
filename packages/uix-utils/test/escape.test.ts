import { describe, it, expect, beforeEach } from "vitest";
import { escapeRegistry, displayOrderRegistry, ESCAPE_PRIORITIES } from "../src/escape";

function fireEscape() {
  document.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape" }));
}

describe("escapeRegistry", () => {
  it("calls the registered callback on Escape", () => {
    let called = false;
    escapeRegistry.register(ESCAPE_PRIORITIES.DIALOG, 1, () => {
      called = true;
    });
    fireEscape();
    expect(called).toBe(true);
    escapeRegistry.unregister(ESCAPE_PRIORITIES.DIALOG, 1);
  });

  it("only the highest-priority-tuple listener fires when two are registered", () => {
    let dialogCalled = false;
    let menuCalled = false;
    escapeRegistry.register(ESCAPE_PRIORITIES.DIALOG, 1, () => {
      dialogCalled = true;
    });
    escapeRegistry.register(ESCAPE_PRIORITIES.MENU, 1, () => {
      menuCalled = true;
    });
    fireEscape();
    // MENU (500) > DIALOG (300) — MENU's tuple wins.
    expect(menuCalled).toBe(true);
    expect(dialogCalled).toBe(false);
    escapeRegistry.unregister(ESCAPE_PRIORITIES.DIALOG, 1);
    escapeRegistry.unregister(ESCAPE_PRIORITIES.MENU, 1);
  });

  it("unregistering stops the callback from firing on a later Escape", () => {
    let called = false;
    escapeRegistry.register(ESCAPE_PRIORITIES.TOOLTIP, 1, () => {
      called = true;
    });
    escapeRegistry.unregister(ESCAPE_PRIORITIES.TOOLTIP, 1);
    fireEscape();
    expect(called).toBe(false);
  });
});

describe("displayOrderRegistry", () => {
  it("assigns increasing order to successively registered ids in the same group", () => {
    const first = displayOrderRegistry.register("test-group-a", 1);
    const second = displayOrderRegistry.register("test-group-a", 2);
    expect(second).toBeGreaterThan(first);
    displayOrderRegistry.unregister("test-group-a", 1);
    displayOrderRegistry.unregister("test-group-a", 2);
  });
});
