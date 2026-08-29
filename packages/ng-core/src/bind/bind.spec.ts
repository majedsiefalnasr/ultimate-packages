import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UBind } from "./bind";

@Component({
  standalone: true,
  imports: [UBind],
  template: `<div [uBind]="attrs"></div>`,
})
class TestHostComponent {
  attrs: Record<string, unknown> = { "data-testid": "example", class: "foo bar" };
}

describe("UBind", () => {
  it("applies attributes from the bound object to the host element", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector("div");
    expect(div.getAttribute("data-testid")).toBe("example");
  });

  it("applies class strings via the class key", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector("div");
    expect(div.classList.contains("foo")).toBe(true);
    expect(div.classList.contains("bar")).toBe(true);
  });

  it("removes an attribute when its value becomes null", async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    fixture.componentInstance.attrs = { "data-testid": null };
    // This project is zoneless: a plain-property mutation on the host
    // component does not by itself mark its view dirty for the scheduler,
    // so `markForCheck()` is needed to force a re-check, and `UBind` reacts
    // via `effect()`, which flushes asynchronously — `whenStable()` lets the
    // pending effect run before asserting (same pattern as overlay.spec.ts).
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges(false);
    await fixture.whenStable();
    const div = fixture.nativeElement.querySelector("div");
    expect(div.hasAttribute("data-testid")).toBe(false);
  });
});
