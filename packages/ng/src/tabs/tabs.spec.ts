import { Component, PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

// jsdom has no ResizeObserver; UTabList creates one on init, so every test in
// this file needs the stub. `observers` records each instance for assertions.
let observers: { cb: ResizeObserverCallback; observed: Element[]; disconnected: boolean }[];

beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      private readonly rec: {
        cb: ResizeObserverCallback;
        observed: Element[];
        disconnected: boolean;
      };
      constructor(cb: ResizeObserverCallback) {
        this.rec = { cb, observed: [], disconnected: false };
        observers.push(this.rec);
      }
      observe(target: Element) {
        this.rec.observed.push(target);
      }
      disconnect() {
        this.rec.disconnected = true;
      }
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

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

describe("UTabList overflow navigators (GAP-071)", () => {
  function mockWidths(scrollWidth: number, clientWidth: number) {
    vi.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(scrollWidth);
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(clientWidth);
  }

  function nextButton(fixture: { nativeElement: HTMLElement }) {
    return fixture.nativeElement.querySelector('button[aria-label="Next"]');
  }

  it("shows the next navigator on first render when the tabs overflow", () => {
    mockWidths(500, 100);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(nextButton(fixture)).not.toBeNull();
  });

  it("shows no navigator on first render when the tabs fit", () => {
    mockWidths(100, 100);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(nextButton(fixture)).toBeNull();
    expect(fixture.nativeElement.querySelector('button[aria-label="Previous"]')).toBeNull();
  });

  it("re-computes navigator visibility when the tab list resizes", () => {
    mockWidths(100, 100);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(observers).toHaveLength(1);
    expect(observers[0].observed[0]).toBe(fixture.nativeElement.querySelector("u-tab-list"));

    vi.restoreAllMocks();
    mockWidths(500, 100);
    observers[0].cb([], {} as ResizeObserver);
    fixture.detectChanges();
    expect(nextButton(fixture)).not.toBeNull();
  });

  it("disconnects the observer on destroy", () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    fixture.destroy();
    expect(observers[0].disconnected).toBe(true);
  });

  it("creates no observer when showNavigators is false", () => {
    TestBed.overrideTemplate(
      TestHostComponent,
      `<u-tabs [value]="value" [showNavigators]="false"><u-tab-list><u-tab [value]="0">A</u-tab></u-tab-list></u-tabs>`
    );
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(observers).toHaveLength(0);
  });

  it("creates no ResizeObserver on the server platform and destroys cleanly", () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(() => fixture.destroy()).not.toThrow();
    expect(observers).toHaveLength(0);
  });
});
