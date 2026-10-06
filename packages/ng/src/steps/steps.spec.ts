import { TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";
import { describe, expect, it, vi } from "vitest";
import { USteps } from "./steps";
import type { UMenuItem } from "@ultimate/ng-core";

describe("USteps", () => {
  const items: UMenuItem[] = [
    { label: "Personal" },
    { label: "Payment" },
    { label: "Confirmation" },
  ];

  function setup(model: UMenuItem[] = items, activeIndex = 0, readonly = true) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(USteps);
    fixture.componentRef.setInput("model", model);
    fixture.componentRef.setInput("activeIndex", activeIndex);
    fixture.componentRef.setInput("readonly", readonly);
    fixture.detectChanges();
    return fixture;
  }

  it("renders one list item per model entry, in order", () => {
    const fixture = setup();
    const labels = Array.from(fixture.nativeElement.querySelectorAll(".u-steps-item-label")).map(
      (el: unknown) => (el as HTMLElement).textContent
    );
    expect(labels).toEqual(["Personal", "Payment", "Confirmation"]);
  });

  it('marks the item at activeIndex aria-current="step"', () => {
    const fixture = setup(items, 1);
    const listItems = fixture.nativeElement.querySelectorAll("li");
    expect(listItems[0].getAttribute("aria-current")).toBeNull();
    expect(listItems[1].getAttribute("aria-current")).toBe("step");
  });

  it("renders 1-based step numbers", () => {
    const fixture = setup();
    const numbers = Array.from(fixture.nativeElement.querySelectorAll(".u-steps-item-number")).map(
      (el: unknown) => (el as HTMLElement).textContent
    );
    expect(numbers).toEqual(["1", "2", "3"]);
  });

  it("when readonly, non-active items are disabled and clicking them does not emit onSelect", () => {
    const fixture = setup();
    let emitted: unknown;
    fixture.componentInstance.onSelect.subscribe((e: unknown) => (emitted = e));
    const secondLink: HTMLAnchorElement = fixture.nativeElement.querySelectorAll("a")[1];
    expect(secondLink.getAttribute("aria-disabled")).toBe("true");
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    secondLink.dispatchEvent(click);
    fixture.detectChanges();
    expect(emitted).toBeUndefined();
    expect(click.defaultPrevented).toBe(true);
    const listItems = fixture.nativeElement.querySelectorAll("li");
    expect(listItems[0].getAttribute("aria-current")).toBe("step");
    expect(listItems[1].getAttribute("aria-current")).toBeNull();
  });

  // G3-C1 PX-C1: disabled items are not dimmed and keep `pointer-events: auto` (upstream parity;
  // the pre-port rules never matched these items), so the click guard alone keeps them
  // non-interactive (Spec §17).
  it("an explicitly disabled item stays non-interactive when not readonly", () => {
    let called = false;
    const model: UMenuItem[] = [
      { label: "One" },
      { label: "Two", disabled: true, command: () => (called = true) },
      { label: "Three" },
    ];
    const fixture = setup(model, 0, false);
    let emitted: unknown;
    fixture.componentInstance.onSelect.subscribe((e: unknown) => (emitted = e));
    const secondLink: HTMLAnchorElement = fixture.nativeElement.querySelectorAll("a")[1];
    expect(secondLink.getAttribute("aria-disabled")).toBe("true");
    expect(secondLink.getAttribute("tabindex")).toBe("-1");
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    secondLink.dispatchEvent(click);
    fixture.detectChanges();
    expect(emitted).toBeUndefined();
    expect(called).toBe(false);
    expect(click.defaultPrevented).toBe(true);
    const listItems = fixture.nativeElement.querySelectorAll("li");
    expect(listItems[0].getAttribute("aria-current")).toBe("step");
    expect(listItems[1].getAttribute("aria-current")).toBeNull();
  });

  it("when not readonly, clicking a non-active item emits onSelect with the item and index", () => {
    const fixture = setup(items, 0, false);
    let emitted: { item: UMenuItem; index: number } | undefined;
    fixture.componentInstance.onSelect.subscribe(
      (e: { item: UMenuItem; index: number }) => (emitted = e)
    );
    const secondLink = fixture.nativeElement.querySelectorAll("a")[1];
    secondLink.click();
    expect(emitted?.index).toBe(1);
    expect(emitted?.item.label).toBe("Payment");
  });

  it("invokes item.command on click when not readonly", () => {
    let called = false;
    const model: UMenuItem[] = [{ label: "One" }, { label: "Two", command: () => (called = true) }];
    const fixture = setup(model, 0, false);
    const secondLink = fixture.nativeElement.querySelectorAll("a")[1];
    secondLink.click();
    expect(called).toBe(true);
  });

  it("skips items with visible: false", () => {
    const model: UMenuItem[] = [
      { label: "One" },
      { label: "Hidden", visible: false },
      { label: "Three" },
    ];
    const fixture = setup(model);
    const labels = Array.from(fixture.nativeElement.querySelectorAll(".u-steps-item-label")).map(
      (el: unknown) => (el as HTMLElement).textContent
    );
    expect(labels).toEqual(["One", "Three"]);
  });
});

describe("keyboard navigation (Spec §5.1, GAP-052)", () => {
  function setup(model: UMenuItem[], readonly = false) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(USteps);
    fixture.componentRef.setInput("model", model);
    fixture.componentRef.setInput("readonly", readonly);
    fixture.detectChanges();
    return fixture;
  }

  it("ArrowRight moves focus to the next enabled step", () => {
    const fixture = setup([{ label: "A" }, { label: "B" }, { label: "C" }]);
    const links = fixture.nativeElement.querySelectorAll("a");
    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    expect(document.activeElement).toBe(links[1]);
  });

  it("ArrowLeft moves focus to the previous enabled step", () => {
    const fixture = setup([{ label: "A" }, { label: "B" }]);
    const links = fixture.nativeElement.querySelectorAll("a");
    links[1].focus();
    links[1].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft", bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
  });

  it("Home moves focus to the first enabled step, End to the last", () => {
    const fixture = setup([{ label: "A" }, { label: "B" }, { label: "C" }]);
    const links = fixture.nativeElement.querySelectorAll("a");
    links[1].focus();
    links[1].dispatchEvent(new KeyboardEvent("keydown", { code: "End", bubbles: true }));
    expect(document.activeElement).toBe(links[2]);
    links[2].dispatchEvent(new KeyboardEvent("keydown", { code: "Home", bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
  });

  it("ArrowRight skips a disabled step", () => {
    const fixture = setup([{ label: "A" }, { label: "B", disabled: true }, { label: "C" }]);
    const links = fixture.nativeElement.querySelectorAll("a");
    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    expect(document.activeElement).toBe(links[2]);
  });

  describe("with a hidden item (rendered-link index vs model index)", () => {
    const model: UMenuItem[] = [
      { label: "A" },
      { label: "H", visible: false },
      { label: "B", disabled: true },
      { label: "C" },
    ];
    const press = (el: HTMLElement, code: string) =>
      el.dispatchEvent(new KeyboardEvent("keydown", { code, bubbles: true }));

    it("ArrowRight from A skips the disabled step and reaches C", () => {
      const fixture = setup(model);
      const links = fixture.nativeElement.querySelectorAll("a");
      links[0].focus();
      press(links[0], "ArrowRight");
      expect(document.activeElement).toBe(links[2]);
    });

    it("Home skips hidden/disabled items and reaches the first valid step", () => {
      const fixture = setup([
        { label: "H", visible: false },
        { label: "B", disabled: true },
        { label: "C" },
        { label: "D" },
      ]);
      const links = fixture.nativeElement.querySelectorAll("a");
      links[2].focus();
      press(links[2], "Home");
      expect(document.activeElement).toBe(links[1]);
    });

    it("End skips hidden/disabled items and reaches the last valid step", () => {
      const fixture = setup([
        { label: "A" },
        { label: "B" },
        { label: "H", visible: false },
        { label: "D", disabled: true },
      ]);
      const links = fixture.nativeElement.querySelectorAll("a");
      links[0].focus();
      press(links[0], "End");
      expect(document.activeElement).toBe(links[1]);
    });

    it("readonly: a hidden item before the active step does not shift the active comparison", () => {
      const fixture = setup([{ label: "H", visible: false }, { label: "B" }, { label: "C" }], true);
      fixture.componentRef.setInput("activeIndex", 2);
      fixture.detectChanges();
      const links = fixture.nativeElement.querySelectorAll("a");
      links[0].focus();
      press(links[0], "End");
      expect(document.activeElement).toBe(links[1]);
    });
  });
});

describe("routerLink (Spec §5.2, GAP-053)", () => {
  function setup(model: UMenuItem[]) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(USteps);
    fixture.componentRef.setInput("model", model);
    fixture.detectChanges();
    return fixture;
  }

  it("binds routerLink when an item has one, omitting href", () => {
    const fixture = setup([{ label: "A", routerLink: "/a" }]);
    fixture.componentRef.setInput("readonly", false);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector("a");
    expect(link.getAttribute("href")).toBe("/a"); // RouterLink sets href itself when rendered with RouterModule's test harness
  });

  it("does not bind routerLink when the item is disabled", () => {
    const fixture = setup([{ label: "A", routerLink: "/a", disabled: true }]);
    const link = fixture.nativeElement.querySelector("a");
    expect(link.getAttribute("href")).not.toBe("/a");
  });

  it("does not navigate via routerLink when readonly (non-active step)", () => {
    const fixture = setup([{ label: "A" }, { label: "B", routerLink: "/b" }]);
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), "navigateByUrl");
    const link = fixture.nativeElement.querySelectorAll("a")[1];
    expect(link.getAttribute("href")).not.toBe("/b");
    link.click();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it("navigates via routerLink when not readonly", () => {
    const fixture = setup([{ label: "A" }, { label: "B", routerLink: "/b" }]);
    fixture.componentRef.setInput("readonly", false);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelectorAll("a")[1];
    expect(link.getAttribute("href")).toBe("/b");
  });

  it("falls back to url/# href when no routerLink is set", () => {
    const fixture = setup([{ label: "A" }]);
    expect(fixture.nativeElement.querySelector("a").getAttribute("href")).toBe("#");
  });
});
