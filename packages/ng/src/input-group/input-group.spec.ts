import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
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

describe("UInputGroup pass-through, unstyled and dt", () => {
  @Component({
    standalone: true,
    imports: [UInputGroup, UInputGroupAddon],
    template: `
      <u-input-group [pt]="pt" [unstyled]="unstyled" [dt]="dt">
        <u-input-group-addon [pt]="addonPt">$</u-input-group-addon>
        <input type="text" />
      </u-input-group>
    `,
  })
  class PtHostComponent {
    pt: Record<string, unknown> = { root: { id: "group-root", class: "extra-root" } };
    addonPt: Record<string, unknown> = { root: { id: "group-addon" } };
    unstyled = false;
    dt: Record<string, unknown> = {};
  }

  function render(configure?: (host: PtHostComponent) => void) {
    const fixture = TestBed.createComponent(PtHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    fixture.detectChanges();
    return fixture;
  }

  it("applies root pt attributes and keeps the root class", () => {
    const host = render().nativeElement.querySelector("u-input-group") as HTMLElement;
    expect(host.id).toBe("group-root");
    expect(host.classList.contains("u-input-group")).toBe(true);
    expect(host.classList.contains("extra-root")).toBe(true);
    expect(host.getAttribute("data-pc-name")).toBe("inputgroup");
    expect(host.getAttribute("data-pc-section")).toBe("root");
  });

  it("applies addon pt attributes to the addon root", () => {
    const addon = render().nativeElement.querySelector("u-input-group-addon") as HTMLElement;
    expect(addon.id).toBe("group-addon");
    expect(addon.getAttribute("data-pc-name")).toBe("inputgroupaddon");
  });

  it("unstyled drops the Ultimate classes", () => {
    const host = render((component) => (component.unstyled = true)).nativeElement.querySelector(
      "u-input-group"
    ) as HTMLElement;
    expect(host.classList.contains("u-input-group")).toBe(false);
    expect(host.classList.contains("extra-root")).toBe(true);
  });

  it("scopes dt variables to the instance", () => {
    Theme.setTheme({
      preset: { components: { inputgroup: { color: "red" } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
    const fixture = render((component) => (component.dt = { color: "blue" }));
    const host = fixture.nativeElement.querySelector("u-input-group") as HTMLElement;
    const [attr] = host.getAttributeNames().filter((name) => name.startsWith("pc"));
    const scoped = document.head.querySelector(`style[data-u-ng-style="${attr}-inputgroup"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-inputgroup-color:blue;}`);
  });
});
