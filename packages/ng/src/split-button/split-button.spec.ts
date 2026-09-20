import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { describe, expect, it } from "vitest";
import { USplitButton } from "./split-button";
import type { UMenuItem } from "@ultimate/ng-core";

describe("USplitButton", () => {
  const items: UMenuItem[] = [{ label: "Delete" }, { label: "Rename" }];

  function setup(model: UMenuItem[] = items) {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(USplitButton);
    fixture.componentRef.setInput("label", "Save");
    fixture.componentRef.setInput("model", model);
    fixture.detectChanges();
    return fixture;
  }

  it("renders two buttons — the default command button and the dropdown toggle", () => {
    const fixture = setup();
    const buttons = fixture.nativeElement.querySelectorAll("button");
    expect(buttons.length).toBe(2);
  });

  it("does not render the popup menu until the dropdown button is clicked", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  it("opens the popup menu on dropdown button click", () => {
    const fixture = setup();
    const buttons = fixture.nativeElement.querySelectorAll("button");
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(2);
  });

  it("closes the popup menu on a second dropdown button click", () => {
    const fixture = setup();
    const buttons = fixture.nativeElement.querySelectorAll("button");
    buttons[1].click();
    fixture.detectChanges();
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  it("emits onClick and does not open the menu when the default button is clicked", () => {
    const fixture = setup();
    let emitted: MouseEvent | undefined;
    fixture.componentInstance.onClick.subscribe((e: MouseEvent) => (emitted = e));
    const buttons = fixture.nativeElement.querySelectorAll("button");
    buttons[0].click();
    fixture.detectChanges();
    expect(emitted).toBeDefined();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  it("closes the popup and invokes the item's command when a menu item is selected", () => {
    let called = false;
    const model: UMenuItem[] = [{ label: "Delete", command: () => (called = true) }];
    const fixture = setup(model);
    const buttons = fixture.nativeElement.querySelectorAll("button");
    buttons[1].click();
    fixture.detectChanges();
    const menuItemLink = fixture.nativeElement.querySelector('[role="menuitem"]');
    menuItemLink.click();
    fixture.detectChanges();
    expect(called).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  it("closes the popup menu on Escape", () => {
    const fixture = setup();
    const buttons = fixture.nativeElement.querySelectorAll("button");
    buttons[1].click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });

  it("closes the popup when the default button is clicked while expanded", () => {
    const fixture = setup();
    const buttons = fixture.nativeElement.querySelectorAll("button");
    buttons[1].click();
    fixture.detectChanges();
    buttons[0].click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="menu"]')).toBeNull();
  });
});
