import { describe, it, expect, vi } from "vitest";
import { EventBus } from "../src/eventbus";

describe("EventBus", () => {
  it("invokes a handler registered with on() when the matching type is emitted", () => {
    const bus = EventBus();
    const handler = vi.fn();

    bus.on("change", handler);
    bus.emit("change", { value: 1 });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ value: 1 });
  });

  it("stops invoking a handler after off()", () => {
    const bus = EventBus();
    const handler = vi.fn();

    bus.on("change", handler);
    bus.off("change", handler);
    bus.emit("change");

    expect(handler).not.toHaveBeenCalled();
  });

  it("clear() removes all handlers for all event types", () => {
    const bus = EventBus();
    const handler = vi.fn();

    bus.on("change", handler);
    bus.clear();
    bus.emit("change");

    expect(handler).not.toHaveBeenCalled();
  });

  it("does nothing when emitting a type with no registered handlers", () => {
    const bus = EventBus();

    expect(() => bus.emit("unknown-type")).not.toThrow();
  });
});
