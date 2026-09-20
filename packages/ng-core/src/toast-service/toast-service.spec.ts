import { describe, expect, it } from "vitest";
import { UToastService } from "./toast-service";
import type { UToastMessageOptions } from "./toast-service";

describe("UToastService", () => {
  it("emits the message on messageObserver when add() is called", () => {
    const service = new UToastService();
    let received: UToastMessageOptions | UToastMessageOptions[] | undefined;
    service.messageObserver.subscribe((value) => (received = value));

    service.add({ severity: "info", summary: "Hello" });

    expect(received).toEqual({ severity: "info", summary: "Hello" });
  });

  it("emits an array on messageObserver when addAll() is called", () => {
    const service = new UToastService();
    let received: UToastMessageOptions | UToastMessageOptions[] | undefined;
    service.messageObserver.subscribe((value) => (received = value));

    service.addAll([{ summary: "A" }, { summary: "B" }]);

    expect(received).toEqual([{ summary: "A" }, { summary: "B" }]);
  });

  it("does not emit for an empty addAll() call", () => {
    const service = new UToastService();
    let callCount = 0;
    service.messageObserver.subscribe(() => callCount++);

    service.addAll([]);

    expect(callCount).toBe(0);
  });

  it("emits the key on clearObserver when clear(key) is called", () => {
    const service = new UToastService();
    let received: string | null | undefined;
    service.clearObserver.subscribe((value) => (received = value));

    service.clear("main");

    expect(received).toBe("main");
  });

  it("emits null on clearObserver when clear() is called without a key", () => {
    const service = new UToastService();
    let received: string | null | undefined = "prior";
    service.clearObserver.subscribe((value) => (received = value));

    service.clear();

    expect(received).toBeNull();
  });

  it("supports multiple independent subscribers", () => {
    const service = new UToastService();
    const receivedA: unknown[] = [];
    const receivedB: unknown[] = [];
    service.messageObserver.subscribe((v) => receivedA.push(v));
    service.messageObserver.subscribe((v) => receivedB.push(v));

    service.add({ summary: "hello" });

    expect(receivedA).toEqual([{ summary: "hello" }]);
    expect(receivedB).toEqual([{ summary: "hello" }]);
  });
});
