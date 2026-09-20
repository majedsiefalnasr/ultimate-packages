import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { UAnimateOnScroll } from "./animate-on-scroll";

/** jsdom does not implement IntersectionObserver — mock it and expose the
 * registered callbacks so tests can simulate viewport-intersection events. */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: IntersectionObserverCallback;
  observedElements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }
  observe(el: Element): void {
    this.observedElements.push(el);
  }
  unobserve(el: Element): void {
    this.observedElements = this.observedElements.filter((e) => e !== el);
  }
  disconnect(): void {}
  trigger(entry: Partial<IntersectionObserverEntry>): void {
    this.callback([entry as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

describe("UAnimateOnScroll", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockIntersectionObserver.instances = [];
    (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      MockIntersectionObserver;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds the enterClass when the element becomes intersecting", () => {
    @Component({
      standalone: true,
      imports: [UAnimateOnScroll],
      template: `<div uAnimateOnScroll enterClass="fade-in" leaveClass="fade-out"></div>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    vi.runAllTimers();

    const [observer] = MockIntersectionObserver.instances;
    observer.trigger({ isIntersecting: true, boundingClientRect: { top: 100 } as DOMRect });

    const el: HTMLElement = fixture.nativeElement.querySelector("div");
    expect(el.classList.contains("fade-in")).toBe(true);
  });

  it("sets opacity 0 initially when an enterClass is configured", () => {
    @Component({
      standalone: true,
      imports: [UAnimateOnScroll],
      template: `<div uAnimateOnScroll enterClass="fade-in"></div>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement.querySelector("div");
    expect(el.style.opacity).toBe("0");
  });

  it("applies the leaveClass once already-active and no longer intersecting (top > 0)", () => {
    @Component({
      standalone: true,
      imports: [UAnimateOnScroll],
      template: `<div uAnimateOnScroll enterClass="fade-in" leaveClass="fade-out"></div>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    vi.runAllTimers();

    const [observer] = MockIntersectionObserver.instances;
    observer.trigger({ isIntersecting: true, boundingClientRect: { top: 100 } as DOMRect });
    observer.trigger({ isIntersecting: false, boundingClientRect: { top: 100 } as DOMRect });

    const el: HTMLElement = fixture.nativeElement.querySelector("div");
    expect(el.classList.contains("fade-out")).toBe(true);
    expect(el.classList.contains("fade-in")).toBe(false);
  });

  it("stops observing after the first enter when once is true", () => {
    @Component({
      standalone: true,
      imports: [UAnimateOnScroll],
      template: `<div uAnimateOnScroll enterClass="fade-in" [once]="true"></div>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    vi.runAllTimers();

    const [observer] = MockIntersectionObserver.instances;
    observer.trigger({ isIntersecting: true, boundingClientRect: { top: 100 } as DOMRect });

    expect(observer.observedElements.length).toBe(0);
  });

  it("removes the applied class after the animationend event fires", () => {
    @Component({
      standalone: true,
      imports: [UAnimateOnScroll],
      template: `<div uAnimateOnScroll enterClass="fade-in"></div>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    vi.runAllTimers();

    const [observer] = MockIntersectionObserver.instances;
    observer.trigger({ isIntersecting: true, boundingClientRect: { top: 100 } as DOMRect });

    const el: HTMLElement = fixture.nativeElement.querySelector("div");
    expect(el.classList.contains("fade-in")).toBe(true);
    el.dispatchEvent(new Event("animationend"));
    expect(el.classList.contains("fade-in")).toBe(false);
  });
});
