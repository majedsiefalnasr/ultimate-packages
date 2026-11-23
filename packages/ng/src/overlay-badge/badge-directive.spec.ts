import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UBadgeDirective } from "./badge-directive";

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
    return root.querySelector(".host-icon > u-badge.u-badge");
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
