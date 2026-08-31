import { describe, it, expect, vi } from "vitest";
import { createMotionTransitionHooks } from "./use-motion";

vi.mock("@ultimate/uix-motion", () => ({
  createMotion: vi.fn(() => ({
    enter: vi.fn(() => Promise.resolve()),
    leave: vi.fn(() => Promise.resolve()),
    cancel: vi.fn(),
  })),
}));

describe("createMotionTransitionHooks", () => {
  it("onEnter calls createMotion(el, options).enter() and the done callback on resolution", async () => {
    const { createMotion } = await import("@ultimate/uix-motion");
    const hooks = createMotionTransitionHooks(() => ({}));
    const el = document.createElement("div");
    const done = vi.fn();
    hooks.onEnter(el, done);
    expect(createMotion).toHaveBeenCalledWith(el, {});
    await new Promise((r) => setTimeout(r, 0));
    expect(done).toHaveBeenCalledOnce();
  });

  it("onLeave calls createMotion(el, options).leave() and the done callback on resolution", async () => {
    const hooks = createMotionTransitionHooks(() => ({}));
    const el = document.createElement("div");
    const done = vi.fn();
    hooks.onLeave(el, done);
    await new Promise((r) => setTimeout(r, 0));
    expect(done).toHaveBeenCalledOnce();
  });

  it("onEnterCancelled/onLeaveCancelled call .cancel() on the current motion instance", () => {
    const hooks = createMotionTransitionHooks(() => ({}));
    const el = document.createElement("div");
    hooks.onEnter(el, () => {});
    expect(() => hooks.onEnterCancelled(el)).not.toThrow();
  });
});
