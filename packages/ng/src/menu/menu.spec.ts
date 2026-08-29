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

  it("applies [uTooltip] to an item label so a tooltip appears on hover for long labels", () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UMenu);
    fixture.componentRef.setInput("model", [
      { label: "A very long menu item label that truncates" },
    ]);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('[role="menuitem"] span, [role="menuitem"]');
    label.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    fixture.detectChanges();
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  });
});
