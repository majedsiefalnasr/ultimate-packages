import * as React from "react";
import { render, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { UDeferredContent } from "./deferred-content";

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  disconnected = false;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {
    this.disconnected = true;
  }
  trigger(entry: Partial<IntersectionObserverEntry>): void {
    this.callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

describe("UDeferredContent", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      MockIntersectionObserver;
  });

  it("does not render children before the element intersects the viewport", () => {
    const { container } = render(
      <UDeferredContent>
        <span>Loaded</span>
      </UDeferredContent>
    );
    expect(container.querySelector("span")).toBeNull();
  });

  it("renders children once the element intersects the viewport", () => {
    render(
      <UDeferredContent>
        <span>Loaded</span>
      </UDeferredContent>
    );
    const [observer] = MockIntersectionObserver.instances;
    act(() => {
      observer.trigger({ isIntersecting: true });
    });
    expect(document.querySelector("span")?.textContent).toBe("Loaded");
  });

  it("calls onLoad exactly once when the content becomes visible", () => {
    const onLoad = vi.fn();
    render(
      <UDeferredContent onLoad={onLoad}>
        <span>Loaded</span>
      </UDeferredContent>
    );
    const [observer] = MockIntersectionObserver.instances;
    act(() => {
      observer.trigger({ isIntersecting: true });
    });
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it("disconnects the observer once loaded", () => {
    render(
      <UDeferredContent>
        <span>Loaded</span>
      </UDeferredContent>
    );
    const [observer] = MockIntersectionObserver.instances;
    act(() => {
      observer.trigger({ isIntersecting: true });
    });
    expect(observer.disconnected).toBe(true);
  });

  it("does not render children while not intersecting", () => {
    render(
      <UDeferredContent>
        <span>Loaded</span>
      </UDeferredContent>
    );
    const [observer] = MockIntersectionObserver.instances;
    act(() => {
      observer.trigger({ isIntersecting: false });
    });
    expect(document.querySelector("span")).toBeNull();
  });
});
