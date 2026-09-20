import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UStepper, UStepList, UStep, UStepPanels, UStepPanel } from "./index";

function mountStepper(linear = false) {
  return mount({
    components: { UStepper, UStepList, UStep, UStepPanels, UStepPanel },
    data() {
      return { linear };
    },
    template: `
      <UStepper :value="1" :linear="linear">
        <UStepList>
          <UStep :value="1">One</UStep>
          <UStep :value="2">Two</UStep>
          <UStep :value="3">Three</UStep>
        </UStepList>
        <UStepPanels>
          <UStepPanel :value="1" v-slot="{ activateCallback }">
            Panel One
            <button type="button" @click="activateCallback(2)">Next</button>
          </UStepPanel>
          <UStepPanel :value="2">Panel Two</UStepPanel>
          <UStepPanel :value="3">Panel Three</UStepPanel>
        </UStepPanels>
      </UStepper>
    `,
  });
}

describe("Stepper family (UStepper/UStepList/UStep/UStepPanels/UStepPanel)", () => {
  it("renders all steps and panels, only the active panel visible", () => {
    const wrapper = mountStepper();
    expect(wrapper.findAll('[role="tab"]').length).toBe(3);
    const panels = wrapper.findAll('[role="tabpanel"]');
    expect(panels[0].isVisible()).toBe(true);
    expect(panels[1].isVisible()).toBe(false);
    expect(panels[2].isVisible()).toBe(false);
  });

  it("marks the active step with aria-current and data-u-active", () => {
    const wrapper = mountStepper();
    const steps = wrapper.findAll('[role="presentation"]');
    expect(steps[0].attributes("aria-current")).toBe("step");
    expect(steps[0].attributes("data-u-active")).toBe("true");
    expect(steps[1].attributes("aria-current")).toBeUndefined();
  });

  it("clicking a step header activates it and its matching panel (non-linear)", async () => {
    const wrapper = mountStepper(false);
    const headers = wrapper.findAll(".u-step-header");
    await headers[2].trigger("click");
    const panels = wrapper.findAll('[role="tabpanel"]');
    expect(panels[2].isVisible()).toBe(true);
  });

  it("in linear mode, non-active step headers are disabled — clicking ahead does not activate", async () => {
    const wrapper = mountStepper(true);
    const headers = wrapper.findAll(".u-step-header");
    expect((headers[2].element as HTMLButtonElement).disabled).toBe(true);
    await headers[2].trigger("click");
    const panels = wrapper.findAll('[role="tabpanel"]');
    expect(panels[0].isVisible()).toBe(true);
    expect(panels[2].isVisible()).toBe(false);
  });

  it("a panel's own Next button (activateCallback scoped-slot prop) progresses the active step", async () => {
    const wrapper = mountStepper(true);
    const nextButton = wrapper.findAll("button").find((b) => b.text() === "Next");
    await nextButton?.trigger("click");
    const panels = wrapper.findAll('[role="tabpanel"]');
    expect(panels[0].isVisible()).toBe(false);
    expect(panels[1].isVisible()).toBe(true);
  });

  it("in linear mode, once advanced, the newly-active step's header becomes enabled", async () => {
    const wrapper = mountStepper(true);
    const nextButton = wrapper.findAll("button").find((b) => b.text() === "Next");
    await nextButton?.trigger("click");
    const headers = wrapper.findAll(".u-step-header");
    expect((headers[1].element as HTMLButtonElement).disabled).toBe(false);
    expect((headers[0].element as HTMLButtonElement).disabled).toBe(true);
  });
});
