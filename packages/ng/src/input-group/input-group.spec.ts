import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UInputGroup, UInputGroupAddon } from "./input-group";

@Component({
  standalone: true,
  imports: [UInputGroup, UInputGroupAddon],
  template: `
    <u-input-group>
      <u-input-group-addon [inlineStyle]="addonStyle">$</u-input-group-addon>
      <input type="text" />
      <u-input-group-addon>.00</u-input-group-addon>
    </u-input-group>
  `,
})
class TestHostComponent {
  addonStyle: Record<string, unknown> | undefined = undefined;
}

describe("UInputGroup", () => {
  it("projects addons and an input via ng-content", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll("u-input-group-addon")).toHaveLength(2);
    expect(host.querySelector("input")).toBeTruthy();
  });

  it("applies the u-input-group root class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector("u-input-group");
    expect(root.classList.contains("u-input-group")).toBe(true);
  });
});

describe("UInputGroupAddon", () => {
  it("renders projected content and applies the u-input-group-addon root class", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const addon = fixture.nativeElement.querySelector("u-input-group-addon");
    expect(addon.classList.contains("u-input-group-addon")).toBe(true);
    expect(addon.textContent.trim()).toBe("$");
  });

  it("applies an inline style via the inlineStyle input", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.addonStyle = { color: "red" };
    fixture.detectChanges();
    const addon = fixture.nativeElement.querySelector("u-input-group-addon") as HTMLElement;
    expect(addon.style.color).toBe("red");
  });
});
