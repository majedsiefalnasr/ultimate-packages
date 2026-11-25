import { Component, PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UKnob, type UKnobValueTemplate } from "./knob";

@Component({
  standalone: true,
  imports: [UKnob, ReactiveFormsModule],
  template: `
    <u-knob
      [formControl]="control"
      [readonly]="readonly"
      [invalid]="invalid"
      [tabindex]="tabindex"
      [ariaLabel]="ariaLabel"
      [ariaLabelledBy]="ariaLabelledBy"
      [valueTemplate]="valueTemplate"
      [pt]="pt"
      [unstyled]="unstyled"
      (onChange)="changes.push($event)"
    />
  `,
})
class KnobHostComponent {
  control = new FormControl<number>(30);
  readonly = false;
  invalid = false;
  tabindex = 0;
  ariaLabel: string | undefined = undefined;
  ariaLabelledBy: string | undefined = undefined;
  valueTemplate: UKnobValueTemplate = "{value}";
  pt: Record<string, unknown> = {};
  unstyled = false;
  changes: number[] = [];
}

function mountKnob(setup: (host: KnobHostComponent) => void = () => {}) {
  const fixture = TestBed.createComponent(KnobHostComponent);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement.querySelector("u-knob");
  const svg = root.querySelector("svg") as SVGSVGElement;
  vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    right: 100,
    bottom: 100,
    toJSON: () => ({}),
  } as DOMRect);
  return { fixture, host: fixture.componentInstance, root, svg };
}

function touch(
  type: string,
  target: EventTarget,
  identifier: number,
  clientX: number,
  clientY: number
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "changedTouches", { value: [{ identifier, clientX, clientY }] });
  target.dispatchEvent(event);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("UKnob", () => {
  it("renders an SVG with role=slider reflecting the current value", async () => {
    @Component({
      standalone: true,
      imports: [UKnob, FormsModule],
      template: `<u-knob [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 30;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    // NgModel's own writeValue call is dispatched via a queued microtask,
    // not synchronously inside the first detectChanges() (zoneless testing)
    // — await whenStable() before asserting on the initial bound value,
    // same pattern as dialog.spec.ts.
    await fixture.whenStable();
    fixture.detectChanges();
    const svg: SVGElement = fixture.nativeElement.querySelector("svg");
    expect(svg.getAttribute("role")).toBe("slider");
    expect(svg.getAttribute("aria-valuenow")).toBe("30");
  });

  it("clicking the SVG at a given offset updates the value via ngModel", async () => {
    @Component({
      standalone: true,
      imports: [UKnob, FormsModule],
      template: `<u-knob [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 0;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const svg: SVGElement = fixture.nativeElement.querySelector("svg");
    // jsdom's MouseEvent.offsetX/offsetY are read-only getters — define
    // configurable overrides rather than assigning directly.
    const event = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(event, "offsetX", { value: 50, configurable: true });
    Object.defineProperty(event, "offsetY", { value: 5, configurable: true });
    svg.dispatchEvent(event);
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBeGreaterThan(0);
  });

  it("ArrowUp increments the value by step", async () => {
    @Component({
      standalone: true,
      imports: [UKnob, FormsModule],
      template: `<u-knob [step]="5" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 50;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const svg: SVGElement = fixture.nativeElement.querySelector("svg");
    svg.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(55);
  });

  it("ArrowDown decrements the value by step", async () => {
    @Component({
      standalone: true,
      imports: [UKnob, FormsModule],
      template: `<u-knob [step]="5" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 50;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const svg: SVGElement = fixture.nativeElement.querySelector("svg");
    svg.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(45);
  });

  it("Home/End jump to min/max", async () => {
    @Component({
      standalone: true,
      imports: [UKnob, FormsModule],
      template: `<u-knob [min]="0" [max]="100" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 50;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const svg: SVGElement = fixture.nativeElement.querySelector("svg");
    svg.dispatchEvent(new KeyboardEvent("keydown", { code: "End", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(100);

    svg.dispatchEvent(new KeyboardEvent("keydown", { code: "Home", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(0);
  });

  it("readonly prevents value changes", async () => {
    @Component({
      standalone: true,
      imports: [UKnob, FormsModule],
      template: `<u-knob [readonly]="true" [(ngModel)]="value" />`,
    })
    class HostComponent {
      value = 50;
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const svg: SVGElement = fixture.nativeElement.querySelector("svg");
    svg.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(50);
  });

  it("disabled state via reactive forms prevents value changes", () => {
    @Component({
      standalone: true,
      imports: [UKnob, ReactiveFormsModule],
      template: `<u-knob [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<number>({ value: 50, disabled: true });
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const svg: SVGElement = fixture.nativeElement.querySelector("svg");
    svg.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowUp", bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(50);
  });

  describe("SSR safety (GAP-065)", () => {
    @Component({
      standalone: true,
      imports: [UKnob, FormsModule],
      template: `<u-knob [(ngModel)]="value" />`,
    })
    class SsrHostComponent {
      value = 30;
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

  describe("touch and drag", () => {
    it("drags with touchstart, touchmove and touchend", () => {
      const { host, svg } = mountKnob();
      touch("touchstart", svg, 1, 50, 5);
      touch("touchmove", document, 1, 50, 5);
      expect(host.control.value).toBe(50);
      touch("touchend", document, 1, 50, 5);
      touch("touchmove", document, 1, 95, 50);
      expect(host.control.value).toBe(50);
    });

    it("follows only the touch that started the drag", () => {
      const { host, svg } = mountKnob();
      touch("touchstart", svg, 1, 50, 5);
      touch("touchmove", document, 2, 95, 50);
      expect(host.control.value).toBe(30);
      touch("touchmove", document, 1, 95, 50);
      expect(host.control.value).toBe(80);
      touch("touchcancel", document, 1, 95, 50);
    });

    it("ignores touch on a readonly knob", () => {
      const { host, svg } = mountKnob((knob) => {
        knob.readonly = true;
      });
      touch("touchstart", svg, 1, 50, 5);
      touch("touchmove", document, 1, 50, 5);
      expect(host.control.value).toBe(30);
    });

    it("removes the drag listeners when destroyed mid-drag", () => {
      const { fixture, host, svg } = mountKnob();
      const remove = vi.spyOn(document, "removeEventListener");
      svg.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
      fixture.destroy();
      expect(remove).toHaveBeenCalledWith("mousemove", expect.any(Function));
      expect(remove).toHaveBeenCalledWith("mouseup", expect.any(Function));
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, clientY: 5 }));
      expect(host.control.value).toBe(30);
    });
  });

  describe("accessibility and state", () => {
    it("uses the configured tab index and -1 when readonly or disabled", () => {
      const configured = mountKnob((knob) => {
        knob.tabindex = 3;
      });
      expect(configured.svg.getAttribute("tabindex")).toBe("3");
      const readonly = mountKnob((knob) => {
        knob.tabindex = 3;
        knob.readonly = true;
      });
      expect(readonly.svg.getAttribute("tabindex")).toBe("-1");
      const disabled = mountKnob((knob) => {
        knob.tabindex = 3;
        knob.control.disable();
      });
      expect(disabled.svg.getAttribute("tabindex")).toBe("-1");
    });

    it("names the dial with aria-label and aria-labelledby", () => {
      const { svg } = mountKnob((knob) => {
        knob.ariaLabel = "Volume";
        knob.ariaLabelledBy = "volume-label";
      });
      expect(svg.getAttribute("aria-label")).toBe("Volume");
      expect(svg.getAttribute("aria-labelledby")).toBe("volume-label");
    });

    it("adds p-disabled and p-invalid to the root", () => {
      const { fixture, host, root } = mountKnob((knob) => {
        knob.invalid = true;
      });
      expect(root.classList.contains("p-invalid")).toBe(true);
      expect(root.classList.contains("p-disabled")).toBe(false);
      host.control.disable();
      fixture.detectChanges();
      expect(root.classList.contains("p-disabled")).toBe(true);
    });
  });

  describe("styling and templates", () => {
    it("applies pt sections to the root, svg, arcs and text", () => {
      const { fixture, root, svg } = mountKnob((knob) => {
        knob.pt = {
          root: { "data-test": "root" },
          svg: { "data-test": "svg" },
          range: { "data-test": "range" },
          value: { "data-test": "value" },
          text: { "data-test": "text" },
        };
      });
      fixture.detectChanges();
      const paths = svg.querySelectorAll("path");
      expect(root.getAttribute("data-test")).toBe("root");
      expect(svg.getAttribute("data-test")).toBe("svg");
      expect(paths[0].getAttribute("data-test")).toBe("range");
      expect(paths[1].getAttribute("data-test")).toBe("value");
      expect(svg.querySelector("text")?.getAttribute("data-test")).toBe("text");
    });

    it("drops the component classes when unstyled", () => {
      const { root, svg } = mountKnob((knob) => {
        knob.unstyled = true;
      });
      expect(root.classList.contains("u-knob")).toBe(false);
      expect(svg.querySelector("path")?.classList.contains("u-knob-range")).toBe(false);
    });

    it("defaults the colours to the knob token variables", () => {
      const { svg } = mountKnob();
      const paths = svg.querySelectorAll("path");
      expect(paths[0].getAttribute("stroke")).toBe("var(--u-knob-range-background)");
      expect(paths[1].getAttribute("stroke")).toBe("var(--u-knob-value-background)");
      expect(svg.querySelector("text")?.getAttribute("fill")).toBe("var(--u-knob-text-color)");
    });

    it("replaces every {value} placeholder in a string template", () => {
      const { svg } = mountKnob((knob) => {
        knob.valueTemplate = "{value} of {value}";
      });
      expect(svg.querySelector("text")?.textContent?.trim()).toBe("30 of 30");
    });

    it("formats the value with a function template", () => {
      const { svg } = mountKnob((knob) => {
        knob.valueTemplate = (value) => `${value}%`;
      });
      expect(svg.querySelector("text")?.textContent?.trim()).toBe("30%");
    });
  });
});
