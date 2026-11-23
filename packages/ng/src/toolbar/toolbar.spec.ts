import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { UToolbar } from "./toolbar";

describe("UToolbar", () => {
  it("has role=toolbar", () => {
    @Component({ standalone: true, imports: [UToolbar], template: `<u-toolbar></u-toolbar>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="toolbar"]')).toBeTruthy();
  });

  it("renders projected default content", () => {
    @Component({
      standalone: true,
      imports: [UToolbar],
      template: `<u-toolbar>Plain content</u-toolbar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Plain content");
  });

  it("renders start/center/end template slots", () => {
    @Component({
      standalone: true,
      imports: [UToolbar],
      template: `<u-toolbar>
        <ng-template #start>Start</ng-template>
        <ng-template #center>Center</ng-template>
        <ng-template #end>End</ng-template>
      </u-toolbar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-toolbar-start")?.textContent).toBe("Start");
    expect(fixture.nativeElement.querySelector(".u-toolbar-center")?.textContent).toBe("Center");
    expect(fixture.nativeElement.querySelector(".u-toolbar-end")?.textContent).toBe("End");
  });

  it("does not render an end wrapper when no end template is provided", () => {
    @Component({
      standalone: true,
      imports: [UToolbar],
      template: `<u-toolbar><ng-template #start>Start</ng-template></u-toolbar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-toolbar-end")).toBeFalsy();
  });

  it("sets aria-labelledby when provided", () => {
    @Component({
      standalone: true,
      imports: [UToolbar],
      template: `<u-toolbar [ariaLabelledBy]="'actions-heading'"></u-toolbar>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role="toolbar"]')?.getAttribute("aria-labelledby")
    ).toBe("actions-heading");
  });

  describe("pass-through, unstyled and dt", () => {
    @Component({
      standalone: true,
      imports: [UToolbar],
      template: `<u-toolbar [pt]="pt" [unstyled]="unstyled">
        <ng-template #start>Start</ng-template>
        <ng-template #center>Center</ng-template>
        <ng-template #end>End</ng-template>
      </u-toolbar>`,
    })
    class PtHostComponent {
      pt: Record<string, unknown> = {
        root: { id: "toolbar-root", class: "extra-root" },
        start: { "data-test": "start" },
        center: { "data-test": "center" },
        end: { "data-test": "end" },
      };
      unstyled = false;
    }

    function render(configure?: (host: PtHostComponent) => void) {
      const fixture = TestBed.createComponent(PtHostComponent);
      configure?.(fixture.componentInstance);
      fixture.detectChanges();
      fixture.detectChanges();
      return fixture;
    }

    it("applies root pt attributes and keeps the root class", () => {
      const host = render().nativeElement.querySelector("u-toolbar") as HTMLElement;
      expect(host.id).toBe("toolbar-root");
      expect(host.classList.contains("u-toolbar")).toBe(true);
      expect(host.classList.contains("extra-root")).toBe(true);
      expect(host.getAttribute("data-pc-name")).toBe("toolbar");
      expect(host.getAttribute("data-pc-section")).toBe("root");
    });

    it("applies pt attributes and section datasets to each region", () => {
      const root = render().nativeElement as HTMLElement;
      for (const region of ["start", "center", "end"]) {
        const element = root.querySelector(`.u-toolbar-${region}`) as HTMLElement;
        expect(element.getAttribute("data-test")).toBe(region);
        expect(element.getAttribute("data-pc-section")).toBe(region);
      }
    });

    it("unstyled drops the Ultimate classes", () => {
      const root = render((host) => (host.unstyled = true)).nativeElement as HTMLElement;
      const host = root.querySelector("u-toolbar") as HTMLElement;
      expect(host.classList.contains("u-toolbar")).toBe(false);
      expect(root.querySelector(".u-toolbar-start")).toBeNull();
      expect(host.classList.contains("extra-root")).toBe(true);
    });

    it("scopes dt variables to the instance", () => {
      Theme.setTheme({
        preset: { components: { toolbar: { gap: "0.5rem" } } },
        options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
      });
      @Component({
        standalone: true,
        imports: [UToolbar],
        template: `<u-toolbar [dt]="{ gap: '2rem' }"></u-toolbar>`,
      })
      class DtHostComponent {}
      const fixture = TestBed.createComponent(DtHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();
      const host = fixture.nativeElement.querySelector("u-toolbar") as HTMLElement;
      const [attr] = host.getAttributeNames().filter((name) => name.startsWith("pc"));
      const scoped = document.head.querySelector(`style[data-u-ng-style="${attr}-toolbar"]`);
      expect(scoped?.textContent).toContain(`[${attr}]{--u-toolbar-gap:2rem;}`);

      fixture.destroy();
      expect(document.head.querySelector(`style[data-u-ng-style="${attr}-toolbar"]`)).toBeNull();
    });
  });
});
