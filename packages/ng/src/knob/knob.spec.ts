import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { describe, expect, it } from "vitest";
import { UKnob } from "./knob";

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
    @Component({ standalone: true, imports: [UKnob, FormsModule], template: `<u-knob [(ngModel)]="value" />` })
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
});
