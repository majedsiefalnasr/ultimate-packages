import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { URating, type URatingRateEvent } from "./rating";

function create(inputs: Record<string, unknown> = {}) {
  const fixture = TestBed.createComponent(URating);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  const host = fixture.nativeElement as HTMLElement;
  const radios = () => Array.from(host.querySelectorAll<HTMLInputElement>("input[type=radio]"));
  const options = () => Array.from(host.querySelectorAll<HTMLElement>(".u-rating-option"));
  return { fixture, host, radios, options };
}

function selectNatively(radio: HTMLInputElement) {
  radio.checked = true;
  radio.dispatchEvent(new Event("change", { bubbles: true }));
}

describe("URating", () => {
  describe("rendering", () => {
    it("wraps each star's radio input in the shared u-hidden-accessible class (GAP-074)", () => {
      const { host } = create();
      expect(host.querySelectorAll(".u-hidden-accessible input[type=radio]").length).toBe(5);
      expect(host.querySelector(".p-hidden-accessible")).toBeNull();
    });

    it("renders one option per star and follows the stars input", () => {
      const { fixture, radios } = create({ stars: 3 });
      expect(radios().length).toBe(3);
      fixture.componentRef.setInput("stars", 7);
      fixture.detectChanges();
      expect(radios().length).toBe(7);
    });

    it("names each star in English", () => {
      const { radios } = create({ stars: 2 });
      expect(radios().map((radio) => radio.getAttribute("aria-label"))).toEqual([
        "1 star",
        "2 stars",
      ]);
    });

    it("marks the filled stars active and draws on and off icons", () => {
      const { fixture, host, options } = create();
      fixture.componentInstance.writeValue(2);
      fixture.detectChanges();
      expect(
        options().map((option) => option.classList.contains("u-rating-option-active"))
      ).toEqual([true, true, false, false, false]);
      expect(host.querySelectorAll("svg.u-rating-on-icon").length).toBe(2);
      expect(host.querySelectorAll("svg.u-rating-off-icon").length).toBe(3);
      expect(host.querySelector("svg.u-rating-icon")?.getAttribute("viewBox")).toBe("0 0 14 14");
    });
  });

  describe("selection", () => {
    it("clicking a star selects it and reflects via ngModel", () => {
      @Component({
        standalone: true,
        imports: [URating, FormsModule],
        template: `<u-rating [stars]="5" [(ngModel)]="value" />`,
      })
      class HostComponent {
        value: number | null = null;
      }
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const options: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-rating-option");
      options[2].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toBe(3);
    });

    it("clicking the already-selected star clears the value", async () => {
      @Component({
        standalone: true,
        imports: [URating, FormsModule],
        template: `<u-rating [stars]="5" [(ngModel)]="value" />`,
      })
      class HostComponent {
        value: number | null = 3;
      }
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const options: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-rating-option");
      options[2].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toBe(null);
    });

    it("a native radio change selects the star", () => {
      const { fixture, radios } = create();
      selectNatively(radios()[3]);
      fixture.detectChanges();
      expect(fixture.componentInstance.modelValue()).toBe(4);
    });

    it("a native change on the selected star never clears it", () => {
      const { fixture, radios } = create();
      fixture.componentInstance.writeValue(2);
      fixture.detectChanges();
      selectNatively(radios()[1]);
      fixture.detectChanges();
      expect(fixture.componentInstance.modelValue()).toBe(2);
    });

    it("a click that lands on the radio itself is handled once, by the change", () => {
      const { fixture, radios } = create();
      const events: URatingRateEvent[] = [];
      fixture.componentInstance.onRate.subscribe((event) => events.push(event));
      radios()[1].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.modelValue()).toBe(2);
      expect(events.map((event) => event.value)).toEqual([2]);
    });

    it("leaves the arrow keys to the native radio group", () => {
      const { fixture, radios } = create();
      fixture.componentInstance.writeValue(3);
      fixture.detectChanges();
      const event = new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      });
      radios()[2].dispatchEvent(event);
      fixture.detectChanges();
      expect(event.defaultPrevented).toBe(false);
      expect(fixture.componentInstance.modelValue()).toBe(3);
    });

    it("emits onRate with the original event and the new value", () => {
      const { fixture, options } = create();
      const events: URatingRateEvent[] = [];
      fixture.componentInstance.onRate.subscribe((event) => events.push(event));
      options()[1].click();
      options()[1].click();
      expect(events.map((event) => event.value)).toEqual([2, null]);
      expect(events[0].originalEvent).toBeInstanceOf(MouseEvent);
    });
  });

  describe("focus", () => {
    it("a click moves focus to the star's radio without a focus ring", () => {
      const { fixture, options, radios } = create();
      options()[2].click();
      fixture.detectChanges();
      expect(document.activeElement).toBe(radios()[2]);
      expect(options()[2].classList.contains("p-focus-visible")).toBe(false);
      expect(options()[2].getAttribute("data-p-focused")).toBe("true");
    });

    it("keyboard focus shows the focus ring on the focused star", () => {
      const { fixture, options, radios } = create();
      radios()[1].focus();
      fixture.detectChanges();
      expect(options()[1].classList.contains("p-focus-visible")).toBe(true);
      radios()[1].blur();
      fixture.detectChanges();
      expect(options()[1].classList.contains("p-focus-visible")).toBe(false);
    });

    it("emits the native focus and blur events", () => {
      const { fixture, radios } = create();
      const received: FocusEvent[] = [];
      fixture.componentInstance.onFocus.subscribe((event) => received.push(event));
      fixture.componentInstance.onBlur.subscribe((event) => received.push(event));
      radios()[0].focus();
      radios()[0].blur();
      expect(received.map((event) => event.type)).toEqual(["focus", "blur"]);
      expect(received[0].target).toBe(radios()[0]);
    });

    it("autofocus focuses the selected star", async () => {
      @Component({
        standalone: true,
        imports: [URating, FormsModule],
        template: `<u-rating autofocus [ngModel]="3" />`,
      })
      class HostComponent {}
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const radios = fixture.nativeElement.querySelectorAll("input[type=radio]");
      expect(document.activeElement).toBe(radios[2]);
    });
  });

  describe("native radio group", () => {
    it("gives every radio one generated group name, unique per instance", () => {
      const first = create();
      const second = create();
      const names = new Set(first.radios().map((radio) => radio.name));
      expect(names.size).toBe(1);
      expect([...names][0]).toMatch(/_name$/);
      expect(second.radios()[0].name).not.toBe(first.radios()[0].name);
    });

    it("uses the supplied name", () => {
      const { radios } = create({ name: "score" });
      expect(radios().every((radio) => radio.name === "score")).toBe(true);
    });

    it("marks the radios required", () => {
      const { radios } = create({ required: true });
      expect(radios().every((radio) => radio.required)).toBe(true);
    });
  });

  describe("states", () => {
    it("readonly blocks clicks and puts a native change back", () => {
      const { fixture, host, options, radios } = create({ readonly: true });
      fixture.componentInstance.writeValue(2);
      fixture.detectChanges();
      options()[4].click();
      selectNatively(radios()[4]);
      fixture.detectChanges();
      expect(fixture.componentInstance.modelValue()).toBe(2);
      expect(radios().map((radio) => radio.checked)).toEqual([false, true, false, false, false]);
      expect(host.classList.contains("p-readonly")).toBe(true);
      expect(host.getAttribute("data-p")).toBe("readonly");
    });

    it("disabled state disables every radio input", () => {
      @Component({
        standalone: true,
        imports: [URating, ReactiveFormsModule],
        template: `<u-rating [stars]="3" [formControl]="control" />`,
      })
      class HostComponent {
        control = new FormControl<number | null>({ value: null, disabled: true });
      }
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const host: HTMLElement = fixture.nativeElement.querySelector("u-rating");
      const inputs: HTMLInputElement[] = Array.from(host.querySelectorAll('input[type="radio"]'));
      inputs.forEach((input) => expect(input.disabled).toBe(true));
      expect(host.classList.contains("p-disabled")).toBe(true);
    });

    it("invalid marks the icons and the radios", () => {
      const { host, radios } = create({ invalid: true });
      expect(host.querySelectorAll(".u-rating-icon.p-invalid").length).toBe(5);
      expect(radios().every((radio) => radio.getAttribute("aria-invalid") === "true")).toBe(true);
    });

    it("integrates with reactive forms and marks the control touched on change", () => {
      @Component({
        standalone: true,
        imports: [URating, ReactiveFormsModule],
        template: `<u-rating [stars]="5" [formControl]="control" />`,
      })
      class HostComponent {
        control = new FormControl<number | null>(2);
      }
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const rating = fixture.debugElement.query((de) => de.name === "u-rating")
        .componentInstance as URating;
      expect(rating.modelValue()).toBe(2);

      const options: HTMLElement[] = fixture.nativeElement.querySelectorAll(".u-rating-option");
      options[3].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.control.value).toBe(4);
      expect(fixture.componentInstance.control.touched).toBe(true);
    });
  });

  describe("custom icons", () => {
    it("renders the onicon and officon templates with the star value", async () => {
      @Component({
        standalone: true,
        imports: [URating, FormsModule],
        template: `
          <u-rating [ngModel]="1" [stars]="3">
            <ng-template #onicon let-star
              ><b class="on">{{ star }}</b></ng-template
            >
            <ng-template #officon let-star
              ><i class="off">{{ star }}</i></ng-template
            >
          </u-rating>
        `,
      })
      class FormsHost {}
      const fixture = TestBed.createComponent(FormsHost);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(Array.from(host.querySelectorAll(".on")).map((el) => el.textContent)).toEqual(["1"]);
      expect(Array.from(host.querySelectorAll(".off")).map((el) => el.textContent)).toEqual([
        "2",
        "3",
      ]);
      expect(host.querySelector("svg")).toBeNull();
    });

    it("renders a span with iconOnClass and iconOffClass and their styles", () => {
      const { fixture, host } = create({
        stars: 2,
        iconOnClass: "pi pi-heart-fill",
        iconOnStyle: { color: "red" },
        iconOffClass: "pi pi-heart",
      });
      fixture.componentInstance.writeValue(1);
      fixture.detectChanges();
      const on = host.querySelector<HTMLElement>("span.u-rating-on-icon");
      expect(on?.classList.contains("pi-heart-fill")).toBe(true);
      expect(on?.style.color).toBe("red");
      expect(host.querySelector("span.u-rating-off-icon.pi-heart")).not.toBeNull();
    });
  });

  describe("pass-through and unstyled", () => {
    it("applies pt sections to the root, options, radios and icons", () => {
      const { fixture, host } = create({
        stars: 2,
        pt: {
          root: { "data-pt": "root" },
          option: { "data-pt": "option" },
          hiddenOptionInputContainer: { "data-pt": "container" },
          hiddenOptionInput: { "data-pt": "input" },
          onIcon: { "data-pt": "on" },
          offIcon: { "data-pt": "off" },
        },
      });
      fixture.componentInstance.writeValue(1);
      fixture.detectChanges();
      expect(host.getAttribute("data-pt")).toBe("root");
      expect(host.querySelector(".u-rating-option")?.getAttribute("data-pt")).toBe("option");
      expect(host.querySelector(".u-hidden-accessible")?.getAttribute("data-pt")).toBe("container");
      expect(host.querySelector("input")?.getAttribute("data-pt")).toBe("input");
      expect(host.querySelector(".u-rating-on-icon")?.getAttribute("data-pt")).toBe("on");
      expect(host.querySelector(".u-rating-off-icon")?.getAttribute("data-pt")).toBe("off");
    });

    it("renders no Ultimate classes when unstyled", () => {
      const { host } = create({ unstyled: true });
      expect(host.classList.contains("u-rating")).toBe(false);
      expect(host.querySelector(".u-rating-option")).toBeNull();
      expect(host.querySelector(".u-rating-icon")).toBeNull();
    });
  });
});
