import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UOverlayBadge } from "./overlay-badge";

describe("UOverlayBadge", () => {
  it("renders the projected content and a composed badge", () => {
    @Component({
      standalone: true,
      imports: [UOverlayBadge],
      template: `<u-overlay-badge value="2" severity="danger"><i class="pi pi-bell"></i></u-overlay-badge>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".u-overlaybadge")).not.toBeNull();
    expect(fixture.nativeElement.querySelector(".pi-bell")).not.toBeNull();
    const badge = fixture.nativeElement.querySelector("u-badge");
    expect(badge?.textContent?.trim()).toBe("2");
  });

  it("forwards badgeSize and badgeDisabled to the composed badge", () => {
    @Component({
      standalone: true,
      imports: [UOverlayBadge],
      template: `<u-overlay-badge value="9" badgeSize="large" [badgeDisabled]="true"><span>Icon</span></u-overlay-badge>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const badgeHost = fixture.nativeElement.querySelector("u-badge");
    expect(badgeHost.style.display).toBe("none");
  });

  it("renders without a value (empty badge, matching plain dot-badge usage)", () => {
    @Component({
      standalone: true,
      imports: [UOverlayBadge],
      template: `<u-overlay-badge severity="success"><span>Icon</span></u-overlay-badge>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector("u-badge");
    expect(badge).not.toBeNull();
    expect(badge.textContent?.trim()).toBe("");
  });
});
