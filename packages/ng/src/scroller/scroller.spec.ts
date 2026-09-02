import { TestBed } from "@angular/core/testing";
import { beforeAll, describe, expect, it } from "vitest";
import { applyUltimateTheme } from "@ultimate/themes";
import { calculateNumItemsInViewport } from "@ultimate/uix-data";
import { UScroller } from "./scroller";

describe("UScroller", () => {
  beforeAll(() => {
    applyUltimateTheme();
  });

  it("computes numItemsInViewport via uix-data's calculateNumItemsInViewport, wired to the real shared function", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 100 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.detectChanges();
    // contentSize is a fixed 0 until Task 3's real DOM measurement lands, so
    // calculateNumItemsInViewport(0, 20) is a real, computable, deterministic
    // result — asserting the actual expected number, not merely that the
    // component's calculateNumItemsInViewport import was called at all, is
    // what proves genuine wiring to the shared uix-data function rather than
    // a hardcoded stand-in value.
    const rootDiv = fixture.nativeElement.querySelector(".u-scroller");
    expect(rootDiv?.getAttribute("data-num-items-in-viewport")).toBe(
      String(calculateNumItemsInViewport(0, 20))
    );
  });

  it("clamps last (getLast) against the live items array length, per spec §9", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", Array.from({ length: 5 }, (_, i) => i));
    fixture.componentRef.setInput("itemSize", 20);
    fixture.componentRef.setInput("numToleratedItems", 50); // deliberately large tolerance
    fixture.detectChanges();
    // calculateLast's raw output would exceed 5 with a tolerance this large;
    // getLast must clamp it down to the live items.length.
    const rootDiv = fixture.nativeElement.querySelector(".u-scroller");
    expect(rootDiv?.getAttribute("data-last")).toBe("5");
  });

  it("returns 0 for last when items is empty", () => {
    const fixture = TestBed.createComponent(UScroller);
    fixture.componentRef.setInput("items", []);
    fixture.detectChanges();
    const rootDiv = fixture.nativeElement.querySelector(".u-scroller");
    expect(rootDiv?.getAttribute("data-last")).toBe("0");
  });
});
