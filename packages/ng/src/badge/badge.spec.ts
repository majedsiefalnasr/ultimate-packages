import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UBadge } from "./badge";

describe("UBadge", () => {
  it("renders its value input as text content", () => {
    const fixture = TestBed.createComponent(UBadge);
    fixture.componentRef.setInput("value", "5");
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe("5");
  });

  it("applies the u-badge root class", () => {
    const fixture = TestBed.createComponent(UBadge);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains("u-badge")).toBe(true);
  });
});
