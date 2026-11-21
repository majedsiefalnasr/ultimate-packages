import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { afterEach, describe, expect, it } from "vitest";
import { UltimateConfig } from "@ultimate/ng-core";
import { Theme } from "@ultimate/uix-styled";
import { UTag } from "./tag";

describe("UTag", () => {
  it("renders projected content", () => {
    @Component({ standalone: true, imports: [UTag], template: `<u-tag>New</u-tag>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-tag-label")?.textContent?.trim()).toBe("New");
  });

  it("falls back to the value input when no content is projected", () => {
    @Component({ standalone: true, imports: [UTag], template: `<u-tag [value]="'Hot'"></u-tag>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-tag-label")?.textContent?.trim()).toBe("Hot");
  });

  it("applies severity class", () => {
    @Component({
      standalone: true,
      imports: [UTag],
      template: `<u-tag severity="danger">Alert</u-tag>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-tag")?.classList.contains("u-tag-danger")).toBe(
      true
    );
  });

  it("applies rounded class", () => {
    @Component({
      standalone: true,
      imports: [UTag],
      template: `<u-tag [rounded]="true">Round</u-tag>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-tag")?.classList.contains("u-tag-rounded")).toBe(
      true
    );
  });

  it("renders an icon when provided", () => {
    @Component({
      standalone: true,
      imports: [UTag],
      template: `<u-tag icon="pi pi-check">Done</u-tag>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".pi-check")).toBeTruthy();
  });
});

// F15 pilot: per-instance `unstyled` and `dt` come from `UBaseComponent`
// (PrimeNG 21.1.9 BaseComponent `$unstyled`/`cx`/`_loadScopedThemeStyles`).
describe("UTag — per-instance unstyled and dt (F15 pilot)", () => {
  afterEach(() => {
    document.head.querySelectorAll("style[data-u-ng-style]").forEach((el) => el.remove());
  });

  it("renders no Ultimate classes when unstyled, and keeps the icon classes clean", () => {
    @Component({
      standalone: true,
      imports: [UTag],
      template: `<u-tag [unstyled]="true" severity="danger" [rounded]="true" icon="pi pi-check"
        >Plain</u-tag
      >`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-tag");
    expect(host.className).toBe("");
    expect(host.textContent?.trim()).toBe("Plain");
    expect(host.querySelector("[class*='u-tag']")).toBeNull();
    expect(host.querySelector(".pi-check")?.className).toBe("pi pi-check");
  });

  it("follows the global UltimateConfig.unstyled", () => {
    @Component({ standalone: true, imports: [UTag], template: `<u-tag>Plain</u-tag>` })
    class HostComponent {}
    TestBed.inject(UltimateConfig).unstyled.set(true);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("u-tag").className).toBe("");
  });

  it("scopes dt variables to the instance", () => {
    Theme.setTheme({
      preset: { components: { tag: { borderRadius: "4px" } } },
      options: { prefix: "u", darkModeSelector: "system", cssLayer: false },
    });
    @Component({
      standalone: true,
      imports: [UTag],
      template: `<u-tag [dt]="{ borderRadius: '2rem' }">Tag</u-tag>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement.querySelector("u-tag");
    const [attr] = host.getAttributeNames().filter((name) => name.startsWith("pc"));
    const scoped = document.head.querySelector(`style[data-u-ng-style="${attr}-tag"]`);
    expect(scoped?.textContent).toContain(`[${attr}]{--u-tag-border-radius:2rem;}`);

    fixture.destroy();
    expect(document.head.querySelector(`style[data-u-ng-style="${attr}-tag"]`)).toBeNull();
  });
});
