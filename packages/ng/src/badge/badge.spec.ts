import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
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

  describe("pass-through, unstyled and dt", () => {
    @Component({
      standalone: true,
      imports: [UBadge],
      template: `<u-badge value="7" [pt]="pt" [unstyled]="unstyled"></u-badge>`,
    })
    class PtHostComponent {
      pt: Record<string, unknown> = { root: { id: "badge-root", class: "extra-root" } };
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
      const host = render().nativeElement.querySelector("u-badge") as HTMLElement;
      expect(host.id).toBe("badge-root");
      expect(host.classList.contains("u-badge")).toBe(true);
      expect(host.classList.contains("extra-root")).toBe(true);
      expect(host.getAttribute("data-pc-name")).toBe("badge");
      expect(host.getAttribute("data-pc-section")).toBe("root");
    });

    it("unstyled drops the Ultimate classes", () => {
      const host = render((component) => (component.unstyled = true)).nativeElement.querySelector(
        "u-badge"
      ) as HTMLElement;
      expect(host.classList.contains("u-badge")).toBe(false);
      expect(host.classList.contains("extra-root")).toBe(true);
    });

    it("scopes dt variables to the instance", () => {
      Theme.setTheme({
        preset: { components: { badge: { height: "1.5rem" } } },
        options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
      });
      @Component({
        standalone: true,
        imports: [UBadge],
        template: `<u-badge value="1" [dt]="{ height: '3rem' }"></u-badge>`,
      })
      class DtHostComponent {}
      const fixture = TestBed.createComponent(DtHostComponent);
      fixture.detectChanges();
      fixture.detectChanges();
      const host = fixture.nativeElement.querySelector("u-badge") as HTMLElement;
      const [attr] = host.getAttributeNames().filter((name) => name.startsWith("pc"));
      const scoped = document.head.querySelector(`style[data-u-ng-style="${attr}-badge"]`);
      expect(scoped?.textContent).toContain(`[${attr}]{--u-badge-height:3rem;}`);
    });
  });
});
