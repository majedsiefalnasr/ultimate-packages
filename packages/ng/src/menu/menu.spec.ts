import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, expect, it } from "vitest";
import { UMenu } from "./menu";
import type { UMenuItem } from "@ultimate/ng-core";

describe("UMenu", () => {
  const items: UMenuItem[] = [
    { label: "Home", icon: "home" },
    { separator: true },
    { label: "Settings", routerLink: "/settings" },
  ];

  it('renders role="menu" on the root list and role="menuitem" per item', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", items);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(2);
  });

  it('renders role="separator" for separator items', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", items);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="separator"]')).not.toBeNull();
  });

  it("moves focus to the next menuitem on ArrowDown (roving tabindex)", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", items);
    fixture.detectChanges();
    const menuItems = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    menuItems[0].focus();
    menuItems[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(menuItems[1]);
  });

  it("skips disabled items when navigating with ArrowDown (roving tabindex)", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [
      { label: "Home" },
      { label: "Disabled", disabled: true },
      { label: "Settings" },
    ]);
    fixture.detectChanges();
    const menuItems = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    menuItems[0].focus();
    menuItems[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    // The disabled "Disabled" item (index 1) must be skipped — focus should
    // land on "Settings" (index 2), not on the disabled item in between.
    expect(document.activeElement).toBe(menuItems[2]);
  });

  it("seeds tabindex=0 on the first non-separator item, not model index 0", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [
      { separator: true },
      { label: "Home" },
      { label: "Settings" },
    ]);
    fixture.detectChanges();
    const menuItems = fixture.nativeElement.querySelectorAll('[role="menuitem"]');
    // With a leading separator, the first rendered anchor ("Home") must be
    // the one reachable by Tab — not the model's index-0 entry, which is
    // the separator and renders no anchor at all.
    expect(menuItems[0].getAttribute("tabindex")).toBe("0");
    expect(menuItems[1].getAttribute("tabindex")).toBe("-1");
  });

  it("does not apply routerLink to a disabled item, even if routerLink is set", () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: "settings", children: [] }])],
    });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [
      { label: "Settings", routerLink: "/settings", disabled: true },
    ]);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLAnchorElement;
    // A disabled item must not be a real navigable link — routerLink being
    // bound regardless of item.disabled would leave a real href in place,
    // reachable via middle-click/ctrl-click/screen-reader link lists even
    // though onItemClick's preventDefault blocks plain mouse clicks.
    expect(link.getAttribute("href")).toBeNull();
  });

  it("applies the p-disabled modifier class to a disabled item (matches uix-styles' real selector)", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "Off", disabled: true }]);
    fixture.detectChanges();
    const li = fixture.nativeElement.querySelector('[role="none"]') as HTMLElement;
    // @ultimate/uix-styles/menu's CSS selects .p-disabled (a PrimeNG-wide
    // shared modifier, kept unrenamed like checkbox-style.ts's p-highlight/
    // p-disabled) — a u-disabled class here would match no selector at all.
    expect(li.classList.contains("p-disabled")).toBe(true);
  });

  it("applies routerLink navigation to items with a routerLink field", () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: "settings", children: [] }])],
    });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", items);
    fixture.detectChanges();
    const settingsLink = Array.from(fixture.nativeElement.querySelectorAll("a")).find((a) =>
      (a as HTMLElement).textContent?.includes("Settings")
    ) as HTMLAnchorElement;
    expect(settingsLink.getAttribute("href")).toContain("/settings");
  });

  it("shows a tooltip on hover when an item opts in via item.tooltip", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [
      { label: "Long label", tooltip: "A very long menu item label that truncates" },
    ]);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('[role="menuitem"] span, [role="menuitem"]');
    label.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  });

  it("shows no tooltip when item.tooltip is unset, even on hover", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [{ label: "Plain item" }]);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('[role="menuitem"] span, [role="menuitem"]');
    label.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    // Regression guard: [uTooltip]="item.label" previously showed a
    // redundant tooltip duplicating the visible label on every item.
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });
});
