import { Component, PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it, vi } from "vitest";
import { USplitter, USplitterPanel } from "./splitter";

/** jsdom's `MouseEvent` doesn't accept `pageX`/`pageY` via its constructor init dict — set them directly (real, readonly-in-spec but writable-in-jsdom properties). */
function mouseEventAt(type: string, pageX: number): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true });
  Object.defineProperty(event, "pageX", { value: pageX, configurable: true });
  Object.defineProperty(event, "pageY", { value: 0, configurable: true });
  return event;
}

describe("USplitter", () => {
  it("renders one panel wrapper per uSplitterPanel template, with gutters between them", () => {
    @Component({
      standalone: true,
      imports: [USplitter, USplitterPanel],
      template: `<u-splitter>
        <ng-template uSplitterPanel>Left</ng-template>
        <ng-template uSplitterPanel>Right</ng-template>
      </u-splitter>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const panels = fixture.nativeElement.querySelectorAll(".u-splitter-panel");
    const gutters = fixture.nativeElement.querySelectorAll(".u-splitter-gutter");
    expect(panels.length).toBe(2);
    expect(gutters.length).toBe(1);
    expect(panels[0].textContent.trim()).toBe("Left");
    expect(panels[1].textContent.trim()).toBe("Right");
  });

  it("distributes initial panel sizes evenly", () => {
    @Component({
      standalone: true,
      imports: [USplitter, USplitterPanel],
      template: `<u-splitter>
        <ng-template uSplitterPanel>A</ng-template>
        <ng-template uSplitterPanel>B</ng-template>
      </u-splitter>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const panels: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-splitter-panel");
    expect(panels[0].style.flexBasis).toContain("50%");
    expect(panels[1].style.flexBasis).toContain("50%");
  });

  it("resizes panels on a mousedown/mousemove/mouseup drag sequence", () => {
    @Component({
      standalone: true,
      imports: [USplitter, USplitterPanel],
      template: `<u-splitter style="width: 400px; display: flex;">
        <ng-template uSplitterPanel>A</ng-template>
        <ng-template uSplitterPanel>B</ng-template>
      </u-splitter>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement.querySelector(".u-splitter");
    Object.defineProperty(root, "offsetWidth", { value: 400, configurable: true });
    const gutter: HTMLElement = fixture.nativeElement.querySelector(".u-splitter-gutter");

    gutter.dispatchEvent(mouseEventAt("mousedown", 200));
    document.dispatchEvent(mouseEventAt("mousemove", 240));
    document.dispatchEvent(mouseEventAt("mouseup", 240));
    fixture.detectChanges();

    const panels: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-splitter-panel");
    // moved gutter 40px right out of 400px total => +10% to the left panel
    expect(panels[0].style.flexBasis).toContain("60%");
    fixture.nativeElement.remove();
  });

  it("clamps resize against each panel's minSize", () => {
    @Component({
      standalone: true,
      imports: [USplitter, USplitterPanel],
      template: `<u-splitter style="width: 400px; display: flex;">
        <ng-template uSplitterPanel [uSplitterPanelMinSize]="45">A</ng-template>
        <ng-template uSplitterPanel>B</ng-template>
      </u-splitter>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();

    const root: HTMLElement = fixture.nativeElement.querySelector(".u-splitter");
    Object.defineProperty(root, "offsetWidth", { value: 400, configurable: true });
    const gutter: HTMLElement = fixture.nativeElement.querySelector(".u-splitter-gutter");

    // try to shrink the first panel from 50% down to well below its 45% minSize
    gutter.dispatchEvent(mouseEventAt("mousedown", 200));
    document.dispatchEvent(mouseEventAt("mousemove", 0));
    document.dispatchEvent(mouseEventAt("mouseup", 0));
    fixture.detectChanges();

    const panels: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-splitter-panel");
    expect(panels[0].style.flexBasis).toContain("45%");
    fixture.nativeElement.remove();
  });

  it("resizes on ArrowRight keydown for a horizontal layout, by step", () => {
    @Component({
      standalone: true,
      imports: [USplitter, USplitterPanel],
      template: `<u-splitter style="width: 400px; display: flex;" [step]="10">
        <ng-template uSplitterPanel>A</ng-template>
        <ng-template uSplitterPanel>B</ng-template>
      </u-splitter>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement.querySelector(".u-splitter");
    Object.defineProperty(root, "offsetWidth", { value: 400, configurable: true });
    const handle: HTMLElement = fixture.nativeElement.querySelector(".u-splitter-gutter-handle");

    handle.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, code: "ArrowRight" }));
    handle.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
    fixture.detectChanges();

    const panels: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-splitter-panel");
    // step=10 applied once as a percentage of the *panel's own current size* (100*(size+step)/total)
    expect(panels[0].style.flexBasis).not.toContain("50%");
    fixture.nativeElement.remove();
  });

  it("emits onResizeStart and onResizeEnd around a drag", () => {
    @Component({
      standalone: true,
      imports: [USplitter, USplitterPanel],
      template: `<u-splitter style="width: 400px; display: flex;" (onResizeStart)="started = true" (onResizeEnd)="ended = true">
        <ng-template uSplitterPanel>A</ng-template>
        <ng-template uSplitterPanel>B</ng-template>
      </u-splitter>`,
    })
    class HostComponent {
      started = false;
      ended = false;
    }
    const fixture = TestBed.createComponent(HostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement.querySelector(".u-splitter");
    Object.defineProperty(root, "offsetWidth", { value: 400, configurable: true });
    const gutter: HTMLElement = fixture.nativeElement.querySelector(".u-splitter-gutter");

    gutter.dispatchEvent(mouseEventAt("mousedown", 200));
    fixture.detectChanges();
    expect(fixture.componentInstance.started).toBe(true);
    document.dispatchEvent(mouseEventAt("mouseup", 200));
    fixture.detectChanges();
    expect(fixture.componentInstance.ended).toBe(true);
    fixture.nativeElement.remove();
  });

  it("applies vertical layout class", () => {
    @Component({
      standalone: true,
      imports: [USplitter, USplitterPanel],
      template: `<u-splitter layout="vertical">
        <ng-template uSplitterPanel>A</ng-template>
        <ng-template uSplitterPanel>B</ng-template>
      </u-splitter>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".u-splitter")?.classList.contains("u-splitter-vertical")
    ).toBe(true);
  });

  describe("SSR safety (GAP-065)", () => {
    @Component({
      standalone: true,
      imports: [USplitter, USplitterPanel],
      template: `<u-splitter>
        <ng-template uSplitterPanel>Left</ng-template>
        <ng-template uSplitterPanel>Right</ng-template>
      </u-splitter>`,
    })
    class SsrHostComponent {}

    it("reaches no browser globals on the server platform through mount, change detection and destroy", () => {
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
      const spies = {
        winAdd: vi.spyOn(window, "addEventListener"),
        winRemove: vi.spyOn(window, "removeEventListener"),
        docAdd: vi.spyOn(document, "addEventListener"),
        docRemove: vi.spyOn(document, "removeEventListener"),
      };
      try {
        const fixture = TestBed.createComponent(SsrHostComponent);
        fixture.detectChanges();
        // Panels project real content, so ngAfterContentInit and its destroy hook run.
        expect(fixture.nativeElement.querySelectorAll(".u-splitter-panel").length).toBe(2);
        fixture.destroy();

        for (const [spyName, spy] of Object.entries(spies)) {
          expect(spy, spyName).not.toHaveBeenCalled();
        }
      } finally {
        vi.restoreAllMocks();
      }
    });
  });
});
