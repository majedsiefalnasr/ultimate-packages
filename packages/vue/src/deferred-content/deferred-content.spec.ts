import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { UDeferredContent } from "./index";

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

  it("does not render slot content before the element intersects the viewport", () => {
    const wrapper = mount(UDeferredContent, { slots: { default: "<span>Loaded</span>" } });
    expect(wrapper.find("span").exists()).toBe(false);
  });

  it("renders slot content once the element intersects the viewport", async () => {
    const wrapper = mount(UDeferredContent, { slots: { default: "<span>Loaded</span>" } });
    const [observer] = MockIntersectionObserver.instances;
    observer.trigger({ isIntersecting: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.find("span").text()).toBe("Loaded");
  });

  it("emits load exactly once when the content becomes visible", async () => {
    const wrapper = mount(UDeferredContent, { slots: { default: "<span>Loaded</span>" } });
    const [observer] = MockIntersectionObserver.instances;
    observer.trigger({ isIntersecting: true });
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("load")).toHaveLength(1);
  });

  it("disconnects the observer once loaded", () => {
    mount(UDeferredContent, { slots: { default: "<span>Loaded</span>" } });
    const [observer] = MockIntersectionObserver.instances;
    observer.trigger({ isIntersecting: true });
    expect(observer.disconnected).toBe(true);
  });

  it("does not render slot content while not intersecting", async () => {
    const wrapper = mount(UDeferredContent, { slots: { default: "<span>Loaded</span>" } });
    const [observer] = MockIntersectionObserver.instances;
    observer.trigger({ isIntersecting: false });
    await wrapper.vm.$nextTick();
    expect(wrapper.find("span").exists()).toBe(false);
  });
});
