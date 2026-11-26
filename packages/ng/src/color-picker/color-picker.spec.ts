import { Component, PLATFORM_ID } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  UColorPicker,
  type UColorPickerAppendTo,
  type UColorPickerChangeEvent,
} from "./color-picker";

@Component({
  standalone: true,
  imports: [UColorPicker, FormsModule],
  template: `
    <div class="scroller" style="overflow: scroll">
      <u-color-picker
        [(ngModel)]="value"
        [format]="format"
        [inline]="inline"
        [appendTo]="appendTo"
        [inputId]="inputId"
        [tabindex]="tabindex"
        [pt]="pt"
        [unstyled]="unstyled"
        (onChange)="changes.push($event)"
        (onShow)="events.push('show')"
        (onHide)="events.push('hide')"
      />
    </div>
  `,
})
class ColorPickerHostComponent {
  value: unknown = null;
  format: "hex" | "rgb" | "hsb" = "hex";
  inline = false;
  appendTo: UColorPickerAppendTo | undefined = undefined;
  inputId: string | undefined = undefined;
  tabindex: number | undefined = undefined;
  pt: Record<string, unknown> = {};
  unstyled = false;
  changes: UColorPickerChangeEvent[] = [];
  events: string[] = [];
}

const RECT = {
  left: 0,
  top: 0,
  width: 150,
  height: 150,
  x: 0,
  y: 0,
  right: 150,
  bottom: 150,
  toJSON: () => ({}),
} as DOMRect;

async function mount(setup: (host: ColorPickerHostComponent) => void = () => {}) {
  const fixture = TestBed.createComponent(ColorPickerHostComponent);
  setup(fixture.componentInstance);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement.querySelector("u-color-picker");
  const input = root.querySelector("input") as HTMLInputElement | null;
  return { fixture, host: fixture.componentInstance, root, input };
}

async function settle(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise((resolve) => setTimeout(resolve));
  fixture.detectChanges();
}

async function open(fixture: ComponentFixture<unknown>, input: HTMLInputElement) {
  input.click();
  await settle(fixture);
}

function part(name: string): HTMLElement {
  const element = document.querySelector(`.u-color-picker-${name}`) as HTMLElement;
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue(RECT);
  return element;
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
  document.querySelectorAll(".u-color-picker-panel").forEach((el) => el.remove());
});

describe("UColorPicker", () => {
  it("renders a readonly preview input named 'Select a color' showing the default color", async () => {
    const { input } = await mount((host) => {
      host.inputId = "brand";
      host.tabindex = 3;
    });
    expect(input?.readOnly).toBe(true);
    expect(input?.getAttribute("aria-label")).toBe("Select a color");
    expect(input?.id).toBe("brand");
    expect(input?.getAttribute("tabindex")).toBe("3");
    expect(input?.style.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  it("opens the panel in place by default and emits onShow", async () => {
    const { fixture, host, root, input } = await mount();
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
    await open(fixture, input!);
    const panel = document.querySelector(".u-color-picker-panel");
    expect(root.contains(panel)).toBe(true);
    expect(input!.getAttribute("aria-expanded")).toBe("true");
    expect(host.events).toEqual(["show"]);
  });

  it("moves the panel to the body with appendTo='body'", async () => {
    const { fixture, root, input } = await mount((host) => (host.appendTo = "body"));
    await open(fixture, input!);
    const panel = document.querySelector(".u-color-picker-panel") as HTMLElement;
    expect(root.contains(panel)).toBe(false);
    expect(panel.parentElement).toBe(document.body);
    expect(panel.style.zIndex).not.toBe("");
  });

  it("Escape and Tab close the panel and emit onHide after the leave motion", async () => {
    const { fixture, host, input } = await mount();
    await open(fixture, input!);
    input!.dispatchEvent(new KeyboardEvent("keydown", { code: "Escape", bubbles: true }));
    await settle(fixture);
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
    expect(host.events).toEqual(["show", "hide"]);

    await open(fixture, input!);
    input!.dispatchEvent(new KeyboardEvent("keydown", { code: "Tab", bubbles: true }));
    await settle(fixture);
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
  });

  it("Space toggles the panel", async () => {
    const { fixture, input } = await mount();
    input!.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", bubbles: true }));
    await settle(fixture);
    expect(document.querySelector(".u-color-picker-panel")).not.toBeNull();
    input!.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", bubbles: true }));
    await settle(fixture);
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
  });

  it("closes on an outside click but not on a click inside the panel", async () => {
    const { fixture, input } = await mount();
    await open(fixture, input!);
    part("hue").click();
    await settle(fixture);
    expect(document.querySelector(".u-color-picker-panel")).not.toBeNull();
    document.body.click();
    await settle(fixture);
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
  });

  it("closes when a scrollable ancestor scrolls", async () => {
    const { fixture, input } = await mount();
    await open(fixture, input!);
    const scroller = fixture.nativeElement.querySelector(".scroller") as HTMLElement;
    scroller.dispatchEvent(new Event("scroll"));
    await settle(fixture);
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
  });

  it("writes #rrggbb on a color drag and reads hex with or without #", async () => {
    const { fixture, host, input } = await mount((h) => (h.value = "00ff00"));
    expect(input!.style.backgroundColor).toBe("rgb(0, 255, 0)");
    await open(fixture, input!);
    part("color-selector").dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: 150, clientY: 0 })
    );
    await settle(fixture);
    expect(host.value).toBe("#00ff00");
    expect(host.changes.at(-1)?.value).toBe("#00ff00");
    expect(host.changes.at(-1)?.originalEvent).toBeInstanceOf(MouseEvent);
    fixture.destroy();

    const prefixed = await mount((h) => (h.value = "#0000ff"));
    expect(prefixed.input!.style.backgroundColor).toBe("rgb(0, 0, 255)");
  });

  it("dragging the hue strip follows the pointer until mouseup", async () => {
    const { fixture, host, root, input } = await mount((h) => (h.value = "#ff0000"));
    await open(fixture, input!);
    part("hue").dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientY: 75 })
    );
    await settle(fixture);
    expect(host.value).toBe("#00ffff");
    expect(root.classList).toContain("u-color-picker-dragging");
    document.dispatchEvent(new MouseEvent("mousemove", { clientY: 100 }));
    await settle(fixture);
    expect(host.value).toBe("#00ff00");
    document.dispatchEvent(new MouseEvent("mouseup"));
    document.dispatchEvent(new MouseEvent("mousemove", { clientY: 150 }));
    await settle(fixture);
    expect(host.value).toBe("#00ff00");
    expect(root.classList).not.toContain("u-color-picker-dragging");
  });

  it("a touch drag follows only its own touch and ends on touchcancel", async () => {
    const { fixture, host, input } = await mount((h) => (h.value = "#ff0000"));
    await open(fixture, input!);
    touch("touchstart", part("hue"), 7, 5, 75);
    await settle(fixture);
    expect(host.value).toBe("#00ffff");
    touch("touchmove", document, 8, 5, 100);
    await settle(fixture);
    expect(host.value).toBe("#00ffff");
    touch("touchmove", document, 7, 5, 100);
    await settle(fixture);
    expect(host.value).toBe("#00ff00");
    touch("touchcancel", document, 7, 5, 100);
    touch("touchmove", document, 7, 5, 150);
    await settle(fixture);
    expect(host.value).toBe("#00ff00");
  });

  it("respects the rgb and hsb formats", async () => {
    const rgb = await mount((h) => (h.format = "rgb"));
    await open(rgb.fixture, rgb.input!);
    part("color-selector").dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: 150, clientY: 0 })
    );
    await settle(rgb.fixture);
    expect(rgb.host.value).toEqual({ r: 255, g: 0, b: 0 });
    rgb.fixture.destroy();
    document.querySelectorAll(".u-color-picker-panel").forEach((el) => el.remove());

    const hsb = await mount((h) => (h.format = "hsb"));
    await open(hsb.fixture, hsb.input!);
    part("color-selector").dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientX: 150, clientY: 0 })
    );
    await settle(hsb.fixture);
    expect(hsb.host.value).toEqual({ h: 0, s: 100, b: 100 });
  });

  it("renders the panel in place without an input when inline", async () => {
    const { root, input } = await mount((h) => (h.inline = true));
    expect(input).toBeNull();
    const panel = root.querySelector(".u-color-picker-panel") as HTMLElement;
    expect(panel.classList).toContain("u-color-picker-panel-inline");
    expect(root.classList).not.toContain("u-color-picker-overlay");
  });

  it("a disabled picker does not open", async () => {
    @Component({
      standalone: true,
      imports: [UColorPicker, ReactiveFormsModule],
      template: `<u-color-picker [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl<string | null>({ value: null, disabled: true });
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-color-picker-preview");
    expect(input.classList).toContain("p-disabled");
    input.click();
    await settle(fixture);
    expect(document.querySelector(".u-color-picker-panel")).toBeNull();
  });

  it("removes the drag and overlay listeners when destroyed mid-drag", async () => {
    const { fixture, input } = await mount();
    await open(fixture, input!);
    part("hue").dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true, clientY: 75 })
    );
    const removeDocument = vi.spyOn(document, "removeEventListener");
    const removeWindow = vi.spyOn(window, "removeEventListener");
    fixture.destroy();
    const removed = removeDocument.mock.calls.map(([type]) => type);
    expect(removed).toEqual(expect.arrayContaining(["mousemove", "mouseup", "click"]));
    expect(removeWindow.mock.calls.map(([type]) => type)).toContain("resize");
  });

  it("applies pt sections to the root, preview and panel parts", async () => {
    const { fixture, root, input } = await mount((h) => {
      h.pt = {
        root: { "data-part": "root" },
        preview: { "data-part": "preview" },
        panel: { "data-part": "panel" },
        content: { "data-part": "content" },
        colorSelector: { "data-part": "colorSelector" },
        colorBackground: { "data-part": "colorBackground" },
        colorHandle: { "data-part": "colorHandle" },
        hue: { "data-part": "hue" },
        hueHandle: { "data-part": "hueHandle" },
      };
    });
    expect(root.getAttribute("data-part")).toBe("root");
    expect(input!.getAttribute("data-part")).toBe("preview");
    await open(fixture, input!);
    for (const name of [
      "panel",
      "content",
      "colorSelector",
      "colorBackground",
      "colorHandle",
      "hue",
      "hueHandle",
    ]) {
      expect(document.querySelector(`[data-part="${name}"]`), name).not.toBeNull();
    }
  });

  it("drops the component classes when unstyled", async () => {
    const { root, input } = await mount((h) => (h.unstyled = true));
    expect(root.className).not.toContain("u-color-picker");
    expect(input!.className).toBe("");
  });

  describe("SSR safety (GAP-065)", () => {
    @Component({ standalone: true, imports: [UColorPicker], template: `<u-color-picker />` })
    class SsrHostComponent {}

    it("reaches no browser globals on the server platform through mount, change detection and destroy", async () => {
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
      const spies = {
        winAdd: vi.spyOn(window, "addEventListener"),
        winRemove: vi.spyOn(window, "removeEventListener"),
        docAdd: vi.spyOn(document, "addEventListener"),
        docRemove: vi.spyOn(document, "removeEventListener"),
      };
      const fixture = TestBed.createComponent(SsrHostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      fixture.destroy();

      for (const [spyName, spy] of Object.entries(spies)) {
        expect(spy, spyName).not.toHaveBeenCalled();
      }
    });
  });
});
