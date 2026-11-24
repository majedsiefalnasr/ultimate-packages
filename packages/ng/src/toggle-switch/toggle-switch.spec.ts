import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { describe, expect, it, vi } from "vitest";
import { UToggleSwitch } from "./toggle-switch";

describe("UToggleSwitch", () => {
  it("renders a native input[type=checkbox][role=switch]", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="checkbox"][role="switch"]');
    expect(input).not.toBeNull();
  });

  it("toggles checked state on click, reflecting modelValue === trueValue", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
    expect(fixture.componentInstance.modelValue()).toBe(true);
    expect(input.checked).toBe(true);
  });

  it("toggles back to falseValue on a second click", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(false);
    expect(fixture.componentInstance.modelValue()).toBe(false);
  });

  it("respects custom trueValue/falseValue", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.componentRef.setInput("trueValue", "on");
    fixture.componentRef.setInput("falseValue", "off");
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.modelValue()).toBe("on");
  });

  it("respects the disabled input by disabling the native input and ignoring clicks", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input.disabled).toBe(true);
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(false);
  });

  it("respects CVA setDisabledState independent of the disabled input", () => {
    const fixture = TestBed.createComponent(UToggleSwitch);
    fixture.detectChanges();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    expect(input.disabled).toBe(true);
  });

  it("integrates with FormControl — writeValue reflects into the switch, user interaction propagates back", () => {
    @Component({
      standalone: true,
      imports: [UToggleSwitch, ReactiveFormsModule],
      template: `<u-toggle-switch [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input");
    input.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe(true);
  });

  it("writeControlValue is invoked exactly once per real CVA write — no double-write or feedback loop", () => {
    @Component({
      standalone: true,
      imports: [UToggleSwitch, ReactiveFormsModule],
      template: `<u-toggle-switch [formControl]="control" />`,
    })
    class HostComponent {
      control = new FormControl(false);
    }
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const toggle = fixture.debugElement.query((de) => de.name === "u-toggle-switch")
      .componentInstance as UToggleSwitch;
    const spy = vi.spyOn(toggle, "writeControlValue");

    fixture.componentInstance.control.setValue(true);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  describe("native input attributes", () => {
    it("forwards inputId, name, required, tabindex, aria-label and aria-labelledby", () => {
      const fixture = TestBed.createComponent(UToggleSwitch);
      fixture.componentRef.setInput("inputId", "sw-1");
      fixture.componentRef.setInput("name", "notify");
      fixture.componentRef.setInput("required", true);
      fixture.componentRef.setInput("tabindex", 3);
      fixture.componentRef.setInput("ariaLabel", "Notifications");
      fixture.componentRef.setInput("ariaLabelledBy", "label-1");
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
      expect(input.id).toBe("sw-1");
      expect(input.name).toBe("notify");
      expect(input.required).toBe(true);
      expect(input.getAttribute("tabindex")).toBe("3");
      expect(input.getAttribute("aria-label")).toBe("Notifications");
      expect(input.getAttribute("aria-labelledby")).toBe("label-1");
    });

    it("omits the optional attributes when they are not set", () => {
      const fixture = TestBed.createComponent(UToggleSwitch);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
      for (const name of ["id", "name", "required", "tabindex", "aria-label", "aria-labelledby"]) {
        expect(input.hasAttribute(name)).toBe(false);
      }
    });

    it("associates an external label through inputId", () => {
      @Component({
        standalone: true,
        imports: [UToggleSwitch],
        template: `<label for="sw-2">Mail</label><u-toggle-switch inputId="sw-2" />`,
      })
      class HostComponent {}
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
      expect(input.labels?.[0]?.textContent).toBe("Mail");
    });
  });

  describe("readonly", () => {
    it("blocks a user change and restores the native checked state", () => {
      const fixture = TestBed.createComponent(UToggleSwitch);
      fixture.componentRef.setInput("readonly", true);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
      input.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.checked()).toBe(false);
      expect(input.checked).toBe(false);
    });
  });

  describe("change and touched", () => {
    it("emits onChange with the native event and the new value", () => {
      const fixture = TestBed.createComponent(UToggleSwitch);
      const events: unknown[] = [];
      fixture.componentInstance.onChange.subscribe((event) => events.push(event));
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
      input.click();
      expect(events).toHaveLength(1);
      const [event] = events as Array<{ originalEvent: Event; checked: unknown }>;
      expect(event.checked).toBe(true);
      expect(event.originalEvent.type).toBe("change");
    });

    it("marks the control touched on blur, not on change", () => {
      @Component({
        standalone: true,
        imports: [UToggleSwitch, ReactiveFormsModule],
        template: `<u-toggle-switch [formControl]="control" />`,
      })
      class HostComponent {
        control = new FormControl(false);
      }
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
      input.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.control.touched).toBe(false);
      input.dispatchEvent(new Event("blur"));
      expect(fixture.componentInstance.control.touched).toBe(true);
    });
  });

  describe("invalid", () => {
    it("adds p-invalid and aria-invalid", () => {
      const fixture = TestBed.createComponent(UToggleSwitch);
      fixture.componentRef.setInput("invalid", true);
      fixture.detectChanges();
      expect(fixture.nativeElement.classList.contains("p-invalid")).toBe(true);
      expect(fixture.nativeElement.querySelector("input").getAttribute("aria-invalid")).toBe(
        "true"
      );
    });
  });

  describe("handle template", () => {
    it("renders custom handle content with the checked state in its context", () => {
      @Component({
        standalone: true,
        imports: [UToggleSwitch],
        template: `
          <u-toggle-switch>
            <ng-template #handle let-checked="checked">
              <span class="custom-handle">{{ checked ? "on" : "off" }}</span>
            </ng-template>
          </u-toggle-switch>
        `,
      })
      class HostComponent {}
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const handle = () =>
        fixture.nativeElement.querySelector(".u-toggle-switch-handle .custom-handle");
      expect(handle().textContent).toBe("off");
      fixture.nativeElement.querySelector("input").click();
      fixture.detectChanges();
      expect(handle().textContent).toBe("on");
    });
  });

  describe("data hooks", () => {
    it("sets data-p-checked, data-p-disabled and data-p", () => {
      const fixture = TestBed.createComponent(UToggleSwitch);
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute("data-p-checked")).toBe("false");
      expect(host.getAttribute("data-p-disabled")).toBe("true");
      expect(host.getAttribute("data-p")).toBe("disabled");
    });
  });

  describe("pass-through and unstyled", () => {
    it("applies pt sections to the root, input, slider and handle", () => {
      const fixture = TestBed.createComponent(UToggleSwitch);
      fixture.componentRef.setInput("pt", {
        root: { "data-pt": "root" },
        input: { "data-pt": "input" },
        slider: { "data-pt": "slider" },
        handle: { "data-pt": "handle" },
      });
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.getAttribute("data-pt")).toBe("root");
      expect(host.querySelector("input")?.getAttribute("data-pt")).toBe("input");
      expect(host.querySelector(".u-toggle-switch-slider")?.getAttribute("data-pt")).toBe("slider");
      expect(host.querySelector(".u-toggle-switch-handle")?.getAttribute("data-pt")).toBe("handle");
    });

    it("renders no Ultimate classes when unstyled", () => {
      const fixture = TestBed.createComponent(UToggleSwitch);
      fixture.componentRef.setInput("unstyled", true);
      fixture.detectChanges();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.classList.contains("u-toggle-switch")).toBe(false);
      expect(host.querySelector(".u-toggle-switch-slider")).toBeNull();
    });
  });
});
