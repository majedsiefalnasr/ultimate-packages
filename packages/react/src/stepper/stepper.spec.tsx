import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { UStepper } from "./stepper";
import { UStepperPanel } from "./stepper-panel";

describe("UStepper / UStepperPanel", () => {
  function renderStepper(linear = false) {
    return render(
      <UStepper linear={linear}>
        <UStepperPanel header="One">
          {({ nextCallback }: { nextCallback: (e: React.SyntheticEvent) => void }) => (
            <>
              Panel One
              <button type="button" onClick={nextCallback}>
                Next
              </button>
            </>
          )}
        </UStepperPanel>
        <UStepperPanel header="Two">Panel Two</UStepperPanel>
        <UStepperPanel header="Three">Panel Three</UStepperPanel>
      </UStepper>
    );
  }

  it("renders all headers and panels, only the active panel visible", () => {
    const { container } = renderStepper();
    expect(container.querySelectorAll('[role="tabpanel"]').length).toBe(3);
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect((panels[0] as HTMLElement).hidden).toBe(false);
    expect((panels[1] as HTMLElement).hidden).toBe(true);
  });

  it("marks the active header with aria-current and data-u-active", () => {
    const { container } = renderStepper();
    const headers = container.querySelectorAll("li");
    expect(headers[0].getAttribute("aria-current")).toBe("step");
    expect(headers[0].getAttribute("data-u-active")).toBe("true");
    expect(headers[1].getAttribute("aria-current")).toBeNull();
  });

  it("clicking a header activates it and its matching panel (non-linear)", () => {
    const { container } = renderStepper(false);
    const headerButtons = container.querySelectorAll(".u-stepper-header-action");
    fireEvent.click(headerButtons[2]);
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect((panels[2] as HTMLElement).hidden).toBe(false);
  });

  it("in linear mode, non-active step headers are disabled — clicking ahead does not activate", () => {
    const { container } = renderStepper(true);
    const headerButtons = container.querySelectorAll(".u-stepper-header-action") as NodeListOf<HTMLButtonElement>;
    expect(headerButtons[2].disabled).toBe(true);
    fireEvent.click(headerButtons[2]);
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect((panels[0] as HTMLElement).hidden).toBe(false);
    expect((panels[2] as HTMLElement).hidden).toBe(true);
  });

  it("a panel's own Next button (nextCallback) progresses the active step — validation-gating via the render-prop children", () => {
    const { container } = renderStepper(true);
    const nextButton = container.querySelector("button:not(.u-stepper-header-action)") as HTMLButtonElement;
    fireEvent.click(nextButton);
    const panels = container.querySelectorAll('[role="tabpanel"]');
    expect((panels[0] as HTMLElement).hidden).toBe(true);
    expect((panels[1] as HTMLElement).hidden).toBe(false);
  });

  it("in linear mode, once advanced, the newly-active step's header becomes enabled and the previous one disabled", () => {
    const { container } = renderStepper(true);
    const nextButton = container.querySelector("button:not(.u-stepper-header-action)") as HTMLButtonElement;
    fireEvent.click(nextButton);
    const headerButtons = container.querySelectorAll(".u-stepper-header-action") as NodeListOf<HTMLButtonElement>;
    expect(headerButtons[1].disabled).toBe(false);
    expect(headerButtons[0].disabled).toBe(true);
  });
});
