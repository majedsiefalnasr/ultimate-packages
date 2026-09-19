import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UStep } from "./step";
import { UStepList } from "./step-list";
import { UStepPanel } from "./step-panel";
import { UStepPanels } from "./step-panels";
import { UStepper } from "./stepper";

@Component({
  standalone: true,
  imports: [UStepper, UStepList, UStep, UStepPanels, UStepPanel],
  template: `
    <u-stepper [value]="value" [linear]="linear">
      <u-step-list>
        <u-step [value]="1">One</u-step>
        <u-step [value]="2">Two</u-step>
        <u-step [value]="3">Three</u-step>
      </u-step-list>
      <u-step-panels>
        <u-step-panel [value]="1" #panel1="uStepPanel">
          Panel One
          <button type="button" (click)="panel1.activate(2)">Next</button>
        </u-step-panel>
        <u-step-panel [value]="2">Panel Two</u-step-panel>
        <u-step-panel [value]="3">Panel Three</u-step-panel>
      </u-step-panels>
    </u-stepper>
  `,
})
class TestHostComponent {
  value: number | undefined = 1;
  linear = false;
}

describe("Stepper family (UStepper/UStepList/UStep/UStepPanels/UStepPanel)", () => {
  function setup(linear = false) {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.linear = linear;
    fixture.detectChanges();
    return fixture;
  }

  it("renders all steps and panels, only the active panel visible", () => {
    const fixture = setup();
    expect(fixture.nativeElement.querySelectorAll("u-step").length).toBe(3);
    const panels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]'));
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
    expect(panels[2].hidden).toBe(true);
  });

  it("marks the active step with aria-current and data-u-active", () => {
    const fixture = setup();
    const steps: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll("u-step"));
    expect(steps[0].getAttribute("aria-current")).toBe("step");
    expect(steps[0].getAttribute("data-u-active")).toBe("true");
    expect(steps[1].getAttribute("aria-current")).toBeNull();
  });

  it("clicking a step header activates it and its matching panel (non-linear)", () => {
    const fixture = setup(false);
    const headers: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll(".u-step-header"));
    headers[2].click();
    fixture.detectChanges();
    const panels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]'));
    expect(panels[2].hidden).toBe(false);
  });

  it("in linear mode, non-active step headers are disabled — clicking ahead does not activate", () => {
    const fixture = setup(true);
    const headers: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll(".u-step-header"));
    expect(headers[2].disabled).toBe(true);
    headers[2].click();
    fixture.detectChanges();
    const panels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]'));
    expect(panels[0].hidden).toBe(false);
    expect(panels[2].hidden).toBe(true);
  });

  it("a panel's own Next button (activate()) progresses the active step — validation-gating via the host template", () => {
    const fixture = setup(true);
    const nextButton: HTMLButtonElement = fixture.nativeElement.querySelector("button:not(.u-step-header)");
    nextButton.click();
    fixture.detectChanges();
    const panels: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]'));
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
  });

  it("in linear mode, once advanced, the previously-active step becomes clickable again by being the active one", () => {
    const fixture = setup(true);
    const nextButton: HTMLButtonElement = fixture.nativeElement.querySelector("button:not(.u-step-header)");
    nextButton.click();
    fixture.detectChanges();
    const headers: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll(".u-step-header"));
    expect(headers[1].disabled).toBe(false);
    expect(headers[0].disabled).toBe(true);
  });
});
