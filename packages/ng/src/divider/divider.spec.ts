import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UDivider } from "./divider";

describe("UDivider", () => {
  it("renders projected content", () => {
    @Component({
      standalone: true,
      imports: [UDivider],
      template: `<u-divider><span class="label">OR</span></u-divider>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".label")?.textContent).toBe("OR");
  });

  it("defaults to horizontal layout", () => {
    @Component({
      standalone: true,
      imports: [UDivider],
      template: `<u-divider></u-divider>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-divider") as HTMLElement;
    expect(root.classList.contains("u-divider-horizontal")).toBe(true);
    expect(root.getAttribute("aria-orientation")).toBe("horizontal");
    expect(root.getAttribute("role")).toBe("separator");
  });

  it("applies vertical layout when specified", () => {
    @Component({
      standalone: true,
      imports: [UDivider],
      template: `<u-divider [layout]="'vertical'"></u-divider>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector(".u-divider") as HTMLElement;
    expect(root.classList.contains("u-divider-vertical")).toBe(true);
    expect(root.getAttribute("aria-orientation")).toBe("vertical");
  });
});
