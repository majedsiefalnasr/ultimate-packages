import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { USteps } from "./steps";
import type { UMenuItem } from "@ultimate/ng-core";

describe("USteps", () => {
  const items: UMenuItem[] = [{ label: "Personal" }, { label: "Payment" }, { label: "Confirmation" }];

  function setup(model: UMenuItem[] = items, activeIndex = 0, readonly = true) {
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
    const secondLink = fixture.nativeElement.querySelectorAll("a")[1];
    expect(secondLink.getAttribute("aria-disabled")).toBe("true");
    secondLink.click();
    expect(emitted).toBeUndefined();
  });

  it("when not readonly, clicking a non-active item emits onSelect with the item and index", () => {
    const fixture = setup(items, 0, false);
    let emitted: { item: UMenuItem; index: number } | undefined;
    fixture.componentInstance.onSelect.subscribe((e: { item: UMenuItem; index: number }) => (emitted = e));
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
    const model: UMenuItem[] = [{ label: "One" }, { label: "Hidden", visible: false }, { label: "Three" }];
    const fixture = setup(model);
    const labels = Array.from(fixture.nativeElement.querySelectorAll(".u-steps-item-label")).map(
      (el: unknown) => (el as HTMLElement).textContent
    );
    expect(labels).toEqual(["One", "Three"]);
  });
});
