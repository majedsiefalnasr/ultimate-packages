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

  // Security note (accepted, not a defect): UBind applies arbitrary
  // attributes/properties from its bound object via Angular's Renderer2 —
  // this is inherited unchanged from PrimeNG's own verified Bind directive
  // and is required by the directive's passthrough purpose (it has no
  // Phase 2 consumer yet; a future consumer choosing what object to bind is
  // responsible for not passing untrusted keys/values). These tests
  // document that boundary rather than attempt to sanitize it here: any
  // future restriction of accepted keys/values is a separate architectural
  // decision, not a Phase 2 change.
  it("sets a caller-supplied href attribute verbatim, including an unsafe scheme — Renderer2.setAttribute performs no sanitization here, matching upstream", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.attrs = { href: "javascript:alert(1)" };
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector("div");
    expect(div.getAttribute("href")).toBe("javascript:alert(1)");
  });

  it("does not use innerHTML/outerHTML to apply any bound value — direct property assignment only touches the named key", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.attrs = { title: "<img src=x onerror=alert(1)>" };
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector("div");
    // The value lands in the `title` attribute/property only — it is never
    // parsed as markup, so no <img> element is created and no script runs.
    expect(div.innerHTML).not.toContain("<img");
    expect(div.title).toBe("<img src=x onerror=alert(1)>");
  });
});
