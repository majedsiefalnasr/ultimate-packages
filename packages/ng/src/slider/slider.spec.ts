import { Component, PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { afterEach, describe, expect, it, vi } from "vitest";
import { USlider, type USliderChangeEvent } from "./slider";

@Component({
  standalone: true,
  imports: [USlider, ReactiveFormsModule],
  template: `
    <u-slider
      [formControl]="control"
      [min]="min"
      [max]="max"
      [step]="step"
      [range]="range"
      [orientation]="orientation"
      [invalid]="invalid"
      [tabindex]="tabindex"
      [ariaLabel]="ariaLabel"
      [ariaLabelledBy]="ariaLabelledBy"
      [pt]="pt"
      [unstyled]="unstyled"
      (onChange)="changes.push($event)"
      (onSlideEnd)="ends.push($event)"
    />
  `,
})
class SliderHostComponent {
  control = new FormControl<number | number[]>(50);
  min = 0;
  max = 100;
  step: number | undefined = undefined;
  range = false;
  orientation: "horizontal" | "vertical" = "horizontal";
  invalid = false;
  tabindex = 0;
  ariaLabel: string | undefined = undefined;
  ariaLabelledBy: string | undefined = undefined;
  pt: Record<string, unknown> = {};
  unstyled = false;
  changes: USliderChangeEvent[] = [];
  ends: USliderChangeEvent[] = [];
}

function mountSlider(setup: (host: SliderHostComponent) => void = () => {}) {
  const fixture = TestBed.createComponent(SliderHostComponent);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement.querySelector("u-slider");
  const handles = () => Array.from(root.querySelectorAll<HTMLElement>('[role="slider"]'));
  return { fixture, host: fixture.componentInstance, root, handles };
}

function stubRect(
  element: HTMLElement,
  rect: { left: number; top: number; width: number; height: number }
) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    ...rect,
    x: rect.left,
    y: rect.top,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    toJSON: () => ({}),
  } as DOMRect);
}

function mouse(type: string, target: EventTarget, clientX: number, clientY = 0) {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY }));
}

function touch(
  type: string,
  target: EventTarget,
  identifier: number,
  clientX: number,
  clientY = 0
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", { value: [{ identifier, clientX, clientY }] });
  target.dispatchEvent(event);
}

afterEach(() => {
  vi.restoreAllMocks();
});

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

  describe("state and accessibility", () => {
    it("puts the orientation, disabled and invalid state on the root", () => {
      const { root } = mountSlider((host) => {
        host.orientation = "vertical";
        host.invalid = true;
        host.control.disable();
      });
      expect(root.classList.contains("u-slider")).toBe(true);
      expect(root.classList.contains("u-slider-vertical")).toBe(true);
      expect(root.classList.contains("u-slider-horizontal")).toBe(false);
      expect(root.classList.contains("p-disabled")).toBe(true);
      expect(root.classList.contains("p-invalid")).toBe(true);
    });

    it("defaults to a tab stop of 0 and honours a custom tabindex", () => {
      expect(mountSlider().handles()[0].getAttribute("tabindex")).toBe("0");
      TestBed.resetTestingModule();
      expect(
        mountSlider((host) => {
          host.tabindex = 3;
        })
          .handles()[0]
          .getAttribute("tabindex")
      ).toBe("3");
    });

    it("removes the tab stop from every handle when disabled", () => {
      const { handles } = mountSlider((host) => {
        host.range = true;
        host.control.setValue([20, 80]);
        host.control.disable();
      });
      expect(handles().length).toBe(2);
      for (const handle of handles()) {
        expect(handle.hasAttribute("tabindex")).toBe(false);
      }
    });

    it("names every handle with aria-label and aria-labelledby", () => {
      const { handles } = mountSlider((host) => {
        host.range = true;
        host.control.setValue([20, 80]);
        host.ariaLabel = "Price";
        host.ariaLabelledBy = "price-label";
      });
      for (const handle of handles()) {
        expect(handle.getAttribute("aria-label")).toBe("Price");
        expect(handle.getAttribute("aria-labelledby")).toBe("price-label");
      }
    });

    it("exposes aria-orientation and the value range on the handle", () => {
      const handle = mountSlider((host) => {
        host.orientation = "vertical";
        host.min = 10;
        host.max = 90;
        host.control.setValue(30);
      }).handles()[0];
      expect(handle.getAttribute("aria-orientation")).toBe("vertical");
      expect(handle.getAttribute("aria-valuemin")).toBe("10");
      expect(handle.getAttribute("aria-valuemax")).toBe("90");
      expect(handle.getAttribute("aria-valuenow")).toBe("30");
    });

    it("applies pt sections to the root and the handle", () => {
      const { fixture, root, handles } = mountSlider((host) => {
        host.pt = { root: { "data-test": "root" }, handle: { "data-test": "handle" } };
      });
      fixture.detectChanges();
      expect(root.getAttribute("data-test")).toBe("root");
      expect(handles()[0].getAttribute("data-test")).toBe("handle");
    });

    it("drops the component classes when unstyled", () => {
      const { root, handles } = mountSlider((host) => {
        host.unstyled = true;
      });
      expect(root.classList.contains("u-slider")).toBe(false);
      expect(handles()[0].classList.contains("u-slider-handle")).toBe(false);
    });
  });

  describe("keyboard", () => {
    it("PageUp and PageDown move ten steps", () => {
      const { fixture, host, handles } = mountSlider((value) => {
        value.step = 2;
      });
      handles()[0].dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true }));
      fixture.detectChanges();
      expect(host.control.value).toBe(70);
      handles()[0].dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true }));
      handles()[0].dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true }));
      expect(host.control.value).toBe(30);
    });

    it("clamps keyboard changes to min and max", () => {
      const { host, handles } = mountSlider((value) => {
        value.control.setValue(99);
      });
      handles()[0].dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true }));
      expect(host.control.value).toBe(100);
    });
  });

  describe("pointer drag", () => {
    it("follows the mouse and reports the latest value on slide end", () => {
      const { fixture, host, root, handles } = mountSlider((value) => {
        value.control.setValue(0);
      });
      stubRect(root, { left: 0, top: 0, width: 200, height: 20 });
      mouse("mousedown", handles()[0], 0);
      mouse("mousemove", document, 100);
      mouse("mousemove", document, 150);
      mouse("mouseup", document, 150);
      fixture.detectChanges();
      expect(host.control.value).toBe(75);
      expect(host.changes.map((event) => event.value)).toEqual([50, 75]);
      expect(host.ends.map((event) => event.value)).toEqual([75]);
    });

    it("moves only the grabbed handle in range mode", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.range = true;
        value.control.setValue([20, 80]);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      mouse("mousedown", handles()[1], 80);
      mouse("mousemove", document, 90);
      mouse("mouseup", document, 90);
      expect(host.control.value).toEqual([20, 90]);
    });

    it("grabs the start handle when both handles sit at max", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.range = true;
        value.control.setValue([100, 100]);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      mouse("mousedown", handles()[1], 100);
      mouse("mousemove", document, 50);
      mouse("mouseup", document, 50);
      expect(host.control.value).toEqual([50, 100]);
    });

    it("does not start a drag when disabled", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.control.setValue(10);
        value.control.disable();
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      mouse("mousedown", handles()[0], 10);
      mouse("mousemove", document, 80);
      expect(host.control.value).toBe(10);
      expect(host.changes.length).toBe(0);
    });

    it("removes the document listeners when destroyed mid-drag", () => {
      const { fixture, host, root, handles } = mountSlider((value) => {
        value.control.setValue(0);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      const remove = vi.spyOn(document, "removeEventListener");
      mouse("mousedown", handles()[0], 0);
      fixture.destroy();
      const removed = remove.mock.calls.map((call) => call[0]);
      expect(removed).toContain("mousemove");
      expect(removed).toContain("mouseup");
      mouse("mousemove", document, 60);
      expect(host.changes.length).toBe(0);
    });

    it("does not treat the click after a drag as a track click", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.control.setValue(30);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      mouse("mousedown", handles()[0], 30);
      mouse("mouseup", document, 30);
      mouse("click", root, 90);
      expect(host.control.value).toBe(30);
      expect(host.ends.length).toBe(1);
    });

    it("ignores a zero-size track instead of emitting NaN", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.control.setValue(40);
      });
      stubRect(root, { left: 0, top: 0, width: 0, height: 0 });
      mouse("mousedown", handles()[0], 10);
      mouse("mousemove", document, 50);
      mouse("mouseup", document, 50);
      expect(host.control.value).toBe(40);
      expect(host.changes.length).toBe(0);
    });

    it("maps the vertical axis from the bottom", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.orientation = "vertical";
        value.control.setValue(0);
      });
      stubRect(root, { left: 0, top: 0, width: 20, height: 200 });
      mouse("mousedown", handles()[0], 10, 200);
      mouse("mousemove", document, 10, 50);
      mouse("mouseup", document, 10, 50);
      expect(host.control.value).toBe(75);
    });

    it("mirrors the horizontal axis in right-to-left", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.control.setValue(0);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      vi.spyOn(window, "getComputedStyle").mockReturnValue({
        direction: "rtl",
      } as CSSStyleDeclaration);
      mouse("mousedown", handles()[0], 100);
      mouse("mousemove", document, 25);
      mouse("mouseup", document, 25);
      expect(host.control.value).toBe(75);
    });
  });

  describe("track click", () => {
    it("reports slide end with the clicked value", () => {
      const { host, root } = mountSlider((value) => {
        value.control.setValue(0);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      mouse("click", root, 40);
      expect(host.control.value).toBe(40);
      expect(host.ends.map((event) => event.value)).toEqual([40]);
    });

    it("moves the nearest handle in range mode", () => {
      const { host, root } = mountSlider((value) => {
        value.range = true;
        value.control.setValue([20, 80]);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      mouse("click", root, 70);
      expect(host.control.value).toEqual([20, 70]);
      expect(host.ends.length).toBe(1);
    });

    it("ignores a click that lands on a handle", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.control.setValue(30);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      mouse("click", handles()[0], 90);
      expect(host.control.value).toBe(30);
    });

    it("does nothing when disabled", () => {
      const { host, root } = mountSlider((value) => {
        value.control.setValue(10);
        value.control.disable();
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      mouse("click", root, 90);
      expect(host.control.value).toBe(10);
    });
  });

  describe("touch drag", () => {
    it("drags with touchstart, touchmove and touchend", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.control.setValue(0);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      touch("touchstart", handles()[0], 1, 0);
      touch("touchmove", document, 1, 40);
      touch("touchend", document, 1, 40);
      expect(host.control.value).toBe(40);
      expect(host.ends.map((event) => event.value)).toEqual([40]);
    });

    it("follows only the touch that started the drag", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.control.setValue(0);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      touch("touchstart", handles()[0], 1, 0);
      touch("touchmove", document, 2, 90);
      expect(host.control.value).toBe(0);
      touch("touchmove", document, 1, 30);
      expect(host.control.value).toBe(30);
      touch("touchcancel", document, 1, 30);
      touch("touchmove", document, 1, 80);
      expect(host.control.value).toBe(30);
    });
  });

  describe("step snapping", () => {
    it("snaps relative to the current value so a non-zero min keeps its own grid", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.min = 10;
        value.max = 110;
        value.step = 5;
        value.control.setValue(10);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      mouse("mousedown", handles()[0], 0);
      mouse("mousemove", document, 47);
      expect(host.control.value).toBe(55);
      mouse("mouseup", document, 47);
    });

    it("keeps decimal steps free of float noise", () => {
      const { host, root, handles } = mountSlider((value) => {
        value.min = 0;
        value.max = 1;
        value.step = 0.1;
        value.control.setValue(0.1);
      });
      stubRect(root, { left: 0, top: 0, width: 100, height: 20 });
      mouse("mousedown", handles()[0], 10);
      mouse("mousemove", document, 75);
      mouse("mouseup", document, 75);
      expect(host.control.value).toBe(0.7);
    });

    it("does not divide by zero when max equals min", () => {
      const { fixture, handles } = mountSlider((value) => {
        value.min = 5;
        value.max = 5;
        value.control.setValue(5);
      });
      const range = fixture.nativeElement.querySelector(".u-slider-range") as HTMLElement;
      expect(range.style.width).toBe("0%");
      expect(handles()[0].getAttribute("aria-valuenow")).toBe("5");
    });
  });
});
