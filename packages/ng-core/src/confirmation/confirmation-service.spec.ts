import { describe, expect, it } from "vitest";
import { UConfirmationService } from "./confirmation-service";
import type { UConfirmation } from "./confirmation";

describe("UConfirmationService", () => {
  it("emits the confirmation object on requireConfirmation$ when confirm() is called", () => {
    const service = new UConfirmationService();
    let received: UConfirmation | null | undefined;
    service.requireConfirmation$.subscribe((value) => (received = value));

    service.confirm({ message: "Are you sure?", key: "main" });

    expect(received).toEqual({ message: "Are you sure?", key: "main" });
  });

  it("emits null on requireConfirmation$ when close() is called", () => {
    const service = new UConfirmationService();
    let received: UConfirmation | null | undefined = { message: "prior" };
    service.requireConfirmation$.subscribe((value) => (received = value));

    service.close();

    expect(received).toBeNull();
  });

  it("returns `this` from confirm() and close() for chaining", () => {
    const service = new UConfirmationService();
    expect(service.confirm({ message: "x" })).toBe(service);
    expect(service.close()).toBe(service);
  });

  it("supports multiple independent subscribers", () => {
    const service = new UConfirmationService();
    const receivedA: (UConfirmation | null)[] = [];
    const receivedB: (UConfirmation | null)[] = [];
    service.requireConfirmation$.subscribe((v) => receivedA.push(v));
    service.requireConfirmation$.subscribe((v) => receivedB.push(v));

    service.confirm({ message: "hello" });

    expect(receivedA).toEqual([{ message: "hello" }]);
    expect(receivedB).toEqual([{ message: "hello" }]);
  });
});
