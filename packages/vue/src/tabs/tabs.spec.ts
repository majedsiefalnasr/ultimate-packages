import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UTabs, UTabList, UTab, UTabPanels, UTabPanel } from "./index";

function mountTabs(value = 0) {
  return mount(
    {
      components: { UTabs, UTabList, UTab, UTabPanels, UTabPanel },
      data() {
        return { value };
      },
      template: `
        <UTabs :value="value">
          <UTabList>
            <UTab :value="0">Header 1</UTab>
            <UTab :value="1">Header 2</UTab>
            <UTab :value="2" :disabled="true">Header 3</UTab>
          </UTabList>
          <UTabPanels>
            <UTabPanel :value="0">Content 1</UTabPanel>
            <UTabPanel :value="1">Content 2</UTabPanel>
            <UTabPanel :value="2">Content 3</UTabPanel>
          </UTabPanels>
        </UTabs>
      `,
    },
    { attachTo: document.body }
  );
}

describe("Tabs family (UTabs/UTabList/UTab/UTabPanels/UTabPanel)", () => {
  it("renders all tabs and panels, only the active panel visible", () => {
    const wrapper = mountTabs();
    expect(wrapper.findAll('[role="tab"]').length).toBe(3);
    const panels = wrapper.findAll('[role="tabpanel"]');
    expect(panels[0].isVisible()).toBe(true);
    expect(panels[1].isVisible()).toBe(false);
    expect(panels[2].isVisible()).toBe(false);
  });

  it("marks the active tab with aria-selected and data-u-active", () => {
    const wrapper = mountTabs();
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs[0].attributes("aria-selected")).toBe("true");
    expect(tabs[0].attributes("data-u-active")).toBe("true");
    expect(tabs[1].attributes("aria-selected")).toBe("false");
  });

  it("clicking a tab activates it and its matching panel", async () => {
    const wrapper = mountTabs();
    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[1].trigger("click");
    const panels = wrapper.findAll('[role="tabpanel"]');
    expect(tabs[1].attributes("aria-selected")).toBe("true");
    expect(panels[1].isVisible()).toBe(true);
    expect(panels[0].isVisible()).toBe(false);
  });

  it("ArrowRight moves focus to the next tab", async () => {
    const wrapper = mountTabs();
    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[0].element as HTMLElement).focus();
    await tabs[0].trigger("keydown", { code: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[1].element);
  });

  it("ArrowLeft moves focus to the previous tab", async () => {
    const wrapper = mountTabs();
    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[1].element as HTMLElement).focus();
    await tabs[1].trigger("keydown", { code: "ArrowLeft" });
    expect(document.activeElement).toBe(tabs[0].element);
  });

  it("Home focuses the first tab, End focuses the last non-disabled tab", async () => {
    const wrapper = mountTabs();
    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[0].element as HTMLElement).focus();
    await tabs[0].trigger("keydown", { code: "End" });
    // tabs[2] ("Header 3") is disabled, so End skips it and lands on tabs[1].
    expect(document.activeElement).toBe(tabs[1].element);
    await tabs[1].trigger("keydown", { code: "Home" });
    expect(document.activeElement).toBe(tabs[0].element);
  });

  it("disabled tabs cannot be activated by click", async () => {
    const wrapper = mountTabs();
    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[2].trigger("click");
    expect(tabs[2].attributes("aria-selected")).toBe("false");
  });

  it("v-model-style value prop can be set to a non-zero starting tab", () => {
    const wrapper = mountTabs(1);
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs[1].attributes("aria-selected")).toBe("true");
  });
});
