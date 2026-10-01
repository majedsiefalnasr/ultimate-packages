import { Component, PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { describe, expect, it, vi } from "vitest";
import { USlider } from "./slider";

describe("USlider", () => {
  it("renders a single handle by default with role=slider", async () => {
    @Component({
      standalone: true,
      imports: [USlider, FormsModule],
      template: `<u-slider [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 50;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    // NgModel's own writeValue call is dispatched via a queued microtask,
    // not synchronously inside the first detectChanges() (zoneless testing)
    // — await whenStable() before asserting on the initial bound value,
    // same pattern as dialog.spec.ts.
    await fixture.whenStable();
    fixture.detectChanges();
    const handles = fixture.nativeElement.querySelectorAll('[role="slider"]');
    expect(handles.length).toBe(1);
    expect(handles[0].getAttribute("aria-valuenow")).toBe("50");
  });

  it("range mode renders two handles", async () => {
    @Component({
      standalone: true,
      imports: [USlider, FormsModule],
      template: `<u-slider [range]="true" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = [20, 80];
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const handles = fixture.nativeElement.querySelectorAll('[role="slider"]');
    expect(handles.length).toBe(2);
    expect(handles[0].getAttribute("aria-valuenow")).toBe("20");
    expect(handles[1].getAttribute("aria-valuenow")).toBe("80");
  });

  it("ArrowRight increments the value by step (default 1)", async () => {
    @Component({
      standalone: true,
      imports: [USlider, FormsModule],
      template: `<u-slider [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 50;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const handle: HTMLElement = fixture.nativeElement.querySelector('[role="slider"]');
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(51);
  });

  it("ArrowLeft decrements the value", async () => {
    @Component({
      standalone: true,
      imports: [USlider, FormsModule],
      template: `<u-slider [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 50;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const handle: HTMLElement = fixture.nativeElement.querySelector('[role="slider"]');
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(49);
  });

  it("Home/End jump to min/max", async () => {
    @Component({
      standalone: true,
      imports: [USlider, FormsModule],
      template: `<u-slider [min]="0" [max]="100" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 50;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const handle: HTMLElement = fixture.nativeElement.querySelector('[role="slider"]');
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(100);

    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(0);
  });

  it("clicking the track sets the value from click position", async () => {
    @Component({
      standalone: true,
      imports: [USlider, FormsModule],
      template: `<u-slider [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 0;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement.querySelector(".u-slider");
    Object.defineProperty(root, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, width: 100, height: 20, right: 100, bottom: 20 }),
    });
    root.dispatchEvent(new MouseEvent("click", { bubbles: true, clientX: 25, clientY: 10 }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(25);
  });

  it("disabled state prevents keyboard interaction", () => {
    @Component({
      standalone: true,
      imports: [USlider, ReactiveFormsModule],
      template: `<u-slider [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<number>({ value: 50, disabled: true });
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const handle: HTMLElement = fixture.nativeElement.querySelector('[role="slider"]');
    handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(50);
  });

  describe("SSR safety (GAP-065)", () => {
    @Component({
      standalone: true,
      imports: [USlider, FormsModule],
      template: `<u-slider [(ngModel)]="value" />`,
    })
    class SsrHostComponent {
      value = 50;
    }

    it("reaches no browser globals on the server platform through mount, change detection and destroy", async () => {
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
        await fixture.whenStable();
        fixture.detectChanges();
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
