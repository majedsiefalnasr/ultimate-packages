import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UFluid } from "./fluid";

describe("UFluid", () => {
  it("applies the u-fluid class to its host", () => {
    const fixture = TestBed.createComponent(UFluid);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains("u-fluid")).toBe(true);
  });

  it("projects content via ng-content", () => {
    const fixture = TestBed.createComponent(UFluid);
    const div = document.createElement("div");
    div.textContent = "projected";
    fixture.nativeElement.appendChild(div);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("projected");
  });
});
