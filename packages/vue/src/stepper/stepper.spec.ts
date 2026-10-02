import { describe, it, expect } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import { stepperStyleModule } from "./stepper-style";
import { UStepper, UStepList, UStep, UStepPanels, UStepPanel, UStepItem } from "./index";

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

describe("UStepPanel vertical separator (GAP-063)", () => {
  function mountVertical(count = 3) {
    return mount({
      components: { UStepper, UStepItem, UStep, UStepPanel },
      data() {
        return { count };
      },
      template: `
        <UStepper :value="1">
          <UStepItem v-for="n in count" :key="n" :value="n">
            <UStep :value="n">Step {{ n }}</UStep>
            <UStepPanel :value="n">Content {{ n }}</UStepPanel>
          </UStepItem>
        </UStepper>
      `,
    });
  }

  const sepCounts = (w: ReturnType<typeof mountVertical>) =>
    w.findAll('[role="tabpanel"]').map((p) => p.findAll(".u-stepper-separator").length);

  it("renders separators in all but the last vertical panel, inside the content wrapper before the content", async () => {
    const wrapper = mountVertical(3);
    await nextTick();
    expect(sepCounts(wrapper)).toEqual([1, 1, 0]);
    const wrapperEl = wrapper.find('[role="tabpanel"] .u-step-panel-content-wrapper');
    expect(wrapperEl.exists()).toBe(true);
    const kids = Array.from(wrapperEl.element.children);
    expect(kids[0].classList.contains("u-stepper-separator")).toBe(true);
    expect(kids[1].classList.contains("u-step-panel-content")).toBe(true);
    expect(kids[1].textContent).toContain("Content 1");
  });

  it("updates separator visibility when items are added or removed", async () => {
    const wrapper = mountVertical(3);
    await nextTick();
    (wrapper.vm as unknown as { count: number }).count = 4;
    await nextTick();
    await nextTick();
    expect(sepCounts(wrapper)).toEqual([1, 1, 1, 0]);
    (wrapper.vm as unknown as { count: number }).count = 2;
    await nextTick();
    await nextTick();
    expect(sepCounts(wrapper)).toEqual([1, 0]);
  });

  it("keeps v-show on the panel root in vertical mode", () => {
    const wrapper = mountVertical(3);
    const panels = wrapper.findAll('[role="tabpanel"]');
    expect(panels[0].isVisible()).toBe(true);
    expect(panels[1].isVisible()).toBe(false);
  });

  it("horizontal mode renders no panel separators and no content wrapper", async () => {
    const wrapper = mountStepper();
    await nextTick();
    expect(wrapper.findAll('[role="tabpanel"] .u-stepper-separator').length).toBe(0);
    expect(wrapper.find(".u-step-panel-content-wrapper").exists()).toBe(false);
    expect(wrapper.find('[role="tabpanel"]').html()).toContain("Panel One");
  });
});

describe("Stepper vertical StepItem layout CSS (GAP-063)", () => {
  const css = stepperStyleModule.css as string;
  const rule = (selector: string) => {
    const m = css.match(
      new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{([^}]*)\\}`, "m")
    );
    return m ? m[1].trim() : null;
  };

  it("lays the step item out as a column, active item growing", () => {
    expect(rule(".u-step-item")).toBe("display: flex; flex-direction: column; flex: initial;");
    expect(rule(".u-step-item.u-step-item-active")).toBe("flex: 1 1 auto;");
  });

  it("keeps the vertical step header left-aligned without touching the global .u-step rule", () => {
    expect(rule(".u-step-item .u-step")).toBe("flex: initial; align-items: flex-start;");
    expect(rule(".u-step")).toContain("align-items: center");
  });

  it("makes the panel a grid, offsets content, handles RTL and last-item padding", () => {
    expect(rule(".u-step-item .u-step-panel")).toBe("display: grid; grid-template-rows: 1fr;");
    expect(rule(".u-step-item .u-step-panel-content")).toBe(
      "width: 100%; margin-inline-start: 1rem;"
    );
    expect(rule(".u-step-item .u-stepper-separator:dir(rtl)")).toBe("left: -18px;");
    expect(rule(".u-step-item:last-of-type .u-step-panel")).toBe("padding-inline-start: 2rem;");
  });

  it("declares the hidden-panel rule after the grid rule so inactive panels stay hidden", () => {
    expect(css.indexOf('.u-step-panel[data-u-hidden="true"]')).toBeGreaterThan(
      css.indexOf(".u-step-item .u-step-panel {")
    );
  });
});

describe("UStep horizontal separators (GAP-077)", () => {
  function mountHorizontal(count = 3) {
    return mount({
      components: { UStepper, UStepList, UStep },
      data() {
        return { count };
      },
      template: `
        <UStepper :value="1">
          <UStepList>
            <UStep v-for="n in count" :key="n" :value="n">Step {{ n }}</UStep>
          </UStepList>
        </UStepper>
      `,
    });
  }

  const stepSepCounts = (w: VueWrapper) =>
    w.findAll("[data-u-step]").map((s) => s.findAll(".u-stepper-separator").length);

  it("renders a separator after every step header except the last", async () => {
    const wrapper = mountHorizontal(3);
    await nextTick();
    expect(stepSepCounts(wrapper)).toEqual([1, 1, 0]);
    const firstStep = wrapper.find("[data-u-step]").element;
    const kids = Array.from(firstStep.children);
    expect(kids[0].classList.contains("u-step-header")).toBe(true);
    expect(kids[1].classList.contains("u-stepper-separator")).toBe(true);
  });

  it("renders no separator for a single step", async () => {
    const wrapper = mountHorizontal(1);
    await nextTick();
    expect(stepSepCounts(wrapper)).toEqual([0]);
  });

  it("moves the separator-less position when steps are added or removed", async () => {
    const wrapper = mountHorizontal(3);
    await nextTick();
    (wrapper.vm as unknown as { count: number }).count = 4;
    await nextTick();
    await nextTick();
    expect(stepSepCounts(wrapper)).toEqual([1, 1, 1, 0]);
    (wrapper.vm as unknown as { count: number }).count = 2;
    await nextTick();
    await nextTick();
    expect(stepSepCounts(wrapper)).toEqual([1, 0]);
  });

  it("renders no step-header separator for vertical steps (StepItem layout)", async () => {
    const wrapper = mount({
      components: { UStepper, UStepItem, UStep, UStepPanel },
      template: `
        <UStepper :value="1">
          <UStepItem v-for="n in 3" :key="n" :value="n">
            <UStep :value="n">Step {{ n }}</UStep>
            <UStepPanel :value="n">Content {{ n }}</UStepPanel>
          </UStepItem>
        </UStepper>
      `,
    });
    await nextTick();
    expect(stepSepCounts(wrapper)).toEqual([0, 0, 0]);
  });
});

describe("Stepper horizontal layout CSS (GAP-077)", () => {
  const css = stepperStyleModule.css as string;
  const rule = (selector: string) => {
    const m = css.match(
      new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{([^}]*)\\}`, "m")
    );
    return m ? m[1].trim() : null;
  };

  it("spaces steps across a centred list row", () => {
    expect(rule(".u-step-list")).toBe(
      "display: flex; position: relative; justify-content: space-between; align-items: center;"
    );
  });

  it("lays horizontal steps out as growing rows, last step not growing", () => {
    expect(rule(".u-step-list .u-step")).toBe("flex-direction: row; flex: 1 1 auto;");
    expect(rule(".u-step-list .u-step:last-of-type")).toBe("flex: initial;");
  });

  it("leaves the global .u-step rule and the vertical rules unchanged", () => {
    expect(rule(".u-step")).toBe(
      "display: flex; flex-direction: column; align-items: center; position: relative; flex: 0 0 auto;"
    );
    expect(rule(".u-step-item .u-step")).toBe("flex: initial; align-items: flex-start;");
  });
});
