import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

// jsdom has no ResizeObserver; UTabList now binds one when showNavigators is on.
let observers: { cb: ResizeObserverCallback; observed: Element[]; disconnected: boolean }[];

beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      private readonly rec: {
        cb: ResizeObserverCallback;
        observed: Element[];
        disconnected: boolean;
      };
      constructor(cb: ResizeObserverCallback) {
        this.rec = { cb, observed: [], disconnected: false };
        observers.push(this.rec);
      }
      observe(target: Element) {
        this.rec.observed.push(target);
      }
      disconnect() {
        this.rec.disconnected = true;
      }
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

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

  describe("PageUp/PageDown scroll-into-view (GAP-062)", () => {
    const original = Element.prototype.scrollIntoView;
    let scrollSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      scrollSpy = vi.fn();
      Element.prototype.scrollIntoView =
        scrollSpy as unknown as typeof Element.prototype.scrollIntoView;
    });
    afterEach(() => {
      Element.prototype.scrollIntoView = original;
    });

    it("PageDown scrolls the last non-disabled tab into view without moving focus or selection", async () => {
      const wrapper = mountTabs();
      const tabs = wrapper.findAll('[role="tab"]');
      (tabs[0].element as HTMLElement).focus();
      await tabs[0].trigger("keydown", { code: "PageDown" });
      // tabs[2] is disabled, so the last eligible tab is tabs[1].
      expect(scrollSpy).toHaveBeenCalledTimes(1);
      expect(scrollSpy.mock.instances[0]).toBe(tabs[1].element);
      expect(scrollSpy).toHaveBeenCalledWith({ block: "nearest" });
      expect(document.activeElement).toBe(tabs[0].element);
      expect(tabs[0].attributes("aria-selected")).toBe("true");
      expect(tabs[1].attributes("aria-selected")).toBe("false");
    });

    it("PageUp scrolls the first tab into view without moving focus or selection", async () => {
      const wrapper = mountTabs(1);
      const tabs = wrapper.findAll('[role="tab"]');
      (tabs[1].element as HTMLElement).focus();
      await tabs[1].trigger("keydown", { code: "PageUp" });
      expect(scrollSpy).toHaveBeenCalledTimes(1);
      expect(scrollSpy.mock.instances[0]).toBe(tabs[0].element);
      expect(scrollSpy).toHaveBeenCalledWith({ block: "nearest" });
      expect(document.activeElement).toBe(tabs[1].element);
      expect(tabs[1].attributes("aria-selected")).toBe("true");
      expect(tabs[0].attributes("aria-selected")).toBe("false");
    });

    it("prevents the default action for PageUp and PageDown", () => {
      const wrapper = mountTabs();
      const tab = wrapper.findAll('[role="tab"]')[0];
      for (const code of ["PageDown", "PageUp"]) {
        const event = new KeyboardEvent("keydown", { code, bubbles: true, cancelable: true });
        tab.element.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
      }
    });

    it("does not throw with a single tab", async () => {
      const wrapper = mount(
        {
          components: { UTabs, UTabList, UTab },
          template: `<UTabs :value="0"><UTabList><UTab :value="0">Only</UTab></UTabList></UTabs>`,
        },
        { attachTo: document.body }
      );
      const tab = wrapper.find('[role="tab"]');
      await tab.trigger("keydown", { code: "PageDown" });
      await tab.trigger("keydown", { code: "PageUp" });
      expect(scrollSpy).toHaveBeenCalledTimes(2);
      expect(scrollSpy.mock.instances[0]).toBe(tab.element);
    });
  });
});

describe("UTabList overflow re-evaluation (GAP-072)", () => {
  function mockWidths(scrollWidth: number, clientWidth: number) {
    vi.restoreAllMocks();
    vi.spyOn(Element.prototype, "scrollWidth", "get").mockReturnValue(scrollWidth);
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(clientWidth);
  }

  function mountDynamic(showNavigators = true) {
    return mount(
      {
        components: { UTabs, UTabList, UTab },
        data() {
          return { count: 2, showNavigators };
        },
        template: `
          <UTabs :value="0" :showNavigators="showNavigators">
            <UTabList>
              <UTab v-for="n in count" :key="n" :value="n - 1">Header {{ n }}</UTab>
            </UTabList>
          </UTabs>
        `,
      },
      { attachTo: document.body }
    );
  }

  const live = () => observers.filter((o) => !o.disconnected).length;

  it("re-shows the next navigator when tabs are added after mount", async () => {
    mockWidths(100, 100);
    const wrapper = mountDynamic();
    expect(wrapper.find('button[aria-label="Next"]').exists()).toBe(false);

    mockWidths(500, 100);
    await wrapper.setData({ count: 8 });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button[aria-label="Next"]').exists()).toBe(true);
  });

  it("re-computes navigator visibility when the tab list resizes", async () => {
    mockWidths(100, 100);
    const wrapper = mountDynamic();
    expect(observers).toHaveLength(1);
    expect(observers[0].observed[0]).toBe(wrapper.find('[role="tablist"]').element);

    mockWidths(500, 100);
    observers[0].cb([], {} as ResizeObserver);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button[aria-label="Next"]').exists()).toBe(true);
  });

  it("keeps at most one live observer when showNavigators toggles", async () => {
    const wrapper = mountDynamic(true);
    expect(live()).toBe(1);
    await wrapper.setData({ showNavigators: false });
    expect(live()).toBe(0);
    await wrapper.setData({ showNavigators: true });
    expect(live()).toBe(1);
    await wrapper.setData({ showNavigators: true });
    expect(live()).toBe(1);
  });

  it("binds no observer when showNavigators starts false", () => {
    mountDynamic(false);
    expect(observers).toHaveLength(0);
  });

  it("disconnects the observer before unmount", () => {
    const wrapper = mountDynamic();
    wrapper.unmount();
    expect(live()).toBe(0);
  });
});
