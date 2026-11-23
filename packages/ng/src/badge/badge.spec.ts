import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { Theme } from "@ultimate/uix-styled";
import { UBadge, UBadgeDirective } from "./badge";

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

describe("UBadgeDirective", () => {
  @Component({
    standalone: true,
    imports: [UBadgeDirective],
    template: `<i
      class="host-icon"
      uBadge
      [value]="value()"
      [severity]="severity()"
      [badgeSize]="badgeSize()"
      [badgeDisabled]="disabled()"
      [badgeStyle]="style()"
      [badgeStyleClass]="styleClass()"
    ></i>`,
  })
  class DirectiveHostComponent {
    value = signal<string | number | null>("9");
    severity = signal<"danger" | null>("danger");
    badgeSize = signal<"large" | null>("large");
    disabled = signal(false);
    style = signal<Record<string, string | number> | null>({ "background-color": "red" });
    styleClass = signal("mine");
  }

  function render() {
    const fixture = TestBed.createComponent(DirectiveHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    return fixture;
  }

  function badgeOf(root: HTMLElement): HTMLElement | null {
    return root.querySelector(".host-icon > span.u-badge");
  }

  it("renders a badge span inside the host and marks the host as an overlay", () => {
    const root = render().nativeElement as HTMLElement;
    const badge = badgeOf(root);
    expect(badge).not.toBeNull();
    expect(badge?.textContent).toBe("9");
    expect(root.querySelector(".host-icon")?.classList.contains("u-overlaybadge")).toBe(true);
  });

  it("maps severity, size, style and class onto the badge", () => {
    const badge = badgeOf(render().nativeElement) as HTMLElement;
    expect(badge.classList.contains("u-badge-danger")).toBe(true);
    expect(badge.classList.contains("u-badge-lg")).toBe(true);
    expect(badge.classList.contains("u-badge-circle")).toBe(true);
    expect(badge.classList.contains("mine")).toBe(true);
    expect(badge.style.backgroundColor).toBe("red");
  });

  it("updates the value and the dot shape", () => {
    const fixture = render();
    fixture.componentInstance.value.set(null);
    fixture.detectChanges();
    fixture.detectChanges();
    const badge = badgeOf(fixture.nativeElement) as HTMLElement;
    expect(badge.textContent).toBe("");
    expect(badge.classList.contains("u-badge-dot")).toBe(true);
    expect(badge.classList.contains("u-badge-circle")).toBe(false);
  });

  it("removes the badge and the overlay class when badgeDisabled is set, and restores them", () => {
    const fixture = render();
    const host = fixture.nativeElement.querySelector(".host-icon") as HTMLElement;
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(badgeOf(fixture.nativeElement)).toBeNull();
    expect(host.classList.contains("u-overlaybadge")).toBe(false);

    fixture.componentInstance.disabled.set(false);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(badgeOf(fixture.nativeElement)).not.toBeNull();
    expect(host.classList.contains("u-overlaybadge")).toBe(true);
  });

  it("clears style keys that are no longer set", () => {
    const fixture = render();
    fixture.componentInstance.style.set(null);
    fixture.detectChanges();
    fixture.detectChanges();
    expect((badgeOf(fixture.nativeElement) as HTMLElement).style.backgroundColor).toBe("");
  });
});
