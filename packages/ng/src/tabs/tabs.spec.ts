import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UTab } from "./tab";
import { UTabList } from "./tab-list";
import { UTabPanel } from "./tab-panel";
import { UTabPanels } from "./tab-panels";
import { UTabs } from "./tabs";

@Component({
  standalone: true,
  imports: [UTabs, UTabList, UTab, UTabPanels, UTabPanel],
  template: `
    <u-tabs [value]="value">
      <u-tab-list>
        <u-tab [value]="0">Header 1</u-tab>
        <u-tab [value]="1">Header 2</u-tab>
        <u-tab [value]="2" [disabled]="true">Header 3</u-tab>
      </u-tab-list>
      <u-tab-panels>
        <u-tab-panel [value]="0">Content 1</u-tab-panel>
        <u-tab-panel [value]="1">Content 2</u-tab-panel>
        <u-tab-panel [value]="2">Content 3</u-tab-panel>
      </u-tab-panels>
    </u-tabs>
  `,
})
class TestHostComponent {
  value: number | undefined = 0;
}

describe("Tabs family (UTabs/UTabList/UTab/UTabPanels/UTabPanel)", () => {
  function setup() {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it("renders all tabs and panels, only the active panel visible", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelectorAll('[role="tab"]').length).toBe(3);
    const panels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]'));
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
    expect(panels[2].hidden).toBe(true);
  });

  it("marks the active tab with aria-selected and data-u-active", () => {
    const fixture = setup();
    const tabs: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(tabs[0].getAttribute("data-u-active")).toBe("true");
    expect(tabs[1].getAttribute("aria-selected")).toBe("false");
  });

  it("clicking a tab activates it and its matching panel", () => {
    const fixture = setup();
    const tabs: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
    tabs[1].click();
    fixture.detectChanges();
    const panels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]'));
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(panels[1].hidden).toBe(false);
    expect(panels[0].hidden).toBe(true);
  });

  it("ArrowRight moves focus to the next tab, skipping disabled tabs is not required but Home/End work", () => {
    const fixture = setup();
    const tabs: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
    tabs[0].focus();
    tabs[0].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowRight", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs[1]);
  });

  it("ArrowLeft moves focus to the previous tab", () => {
    const fixture = setup();
    const tabs: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
    tabs[1].focus();
    tabs[1].dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs[0]);
  });

  it("Home focuses the first tab, End focuses the last non-disabled tab", () => {
    const fixture = setup();
    const tabs: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
    // tabs[2] ("Header 3") is disabled in the host template, so End must
    // skip it and land on the last *eligible* tab, tabs[1].
    tabs[0].focus();
    tabs[0].dispatchEvent(new KeyboardEvent("keydown", { code: "End", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs[1]);
    tabs[1].dispatchEvent(new KeyboardEvent("keydown", { code: "Home", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs[0]);
  });

  it("disabled tabs cannot be activated by click", () => {
    const fixture = setup();
    const tabs: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
    tabs[2].click();
    fixture.detectChanges();
    expect(tabs[2].getAttribute("aria-selected")).toBe("false");
  });
});
