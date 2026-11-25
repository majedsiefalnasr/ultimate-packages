import { describe, it, expect } from "vitest";
import { h } from "vue";
import { mount } from "@vue/test-utils";
import { URating } from "./index";

function radios(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll<HTMLInputElement>("input[type=radio]");
}

async function selectNatively(input: {
  element: HTMLInputElement;
  trigger: (e: string) => Promise<void>;
}) {
  input.element.checked = true;
  await input.trigger("change");
}

describe("URating", () => {
  describe("rendering", () => {
    it("wraps each star's radio input in the shared u-hidden-accessible class (GAP-074)", () => {
      const wrapper = mount(URating, { props: { modelValue: null, stars: 5 } });
      expect(wrapper.findAll(".u-hidden-accessible input[type=radio]").length).toBe(5);
      expect(wrapper.find(".p-hidden-accessible").exists()).toBe(false);
    });

    it("renders one option per star and names each star in English", () => {
      const wrapper = mount(URating, { props: { modelValue: null, stars: 2 } });
      expect(radios(wrapper).map((radio) => radio.attributes("aria-label"))).toEqual([
        "1 star",
        "2 stars",
      ]);
    });

    it("marks the filled stars active and draws the Prime star icons", () => {
      const wrapper = mount(URating, { props: { modelValue: 2, stars: 4 } });
      expect(
        wrapper
          .findAll(".u-rating-option")
          .map((option) => option.classes("u-rating-option-active"))
      ).toEqual([true, true, false, false]);
      expect(wrapper.findAll("svg.u-rating-on-icon").length).toBe(2);
      expect(wrapper.findAll("svg.u-rating-off-icon").length).toBe(2);
      expect(wrapper.find("svg").attributes("viewBox")).toBe("0 0 14 14");
    });
  });

  describe("selection", () => {
    it("a native radio change emits update:modelValue with that star's value", async () => {
      const wrapper = mount(URating, { props: { modelValue: null, stars: 5 } });
      await selectNatively(radios(wrapper)[2]);
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([3]);
    });

    it("a native change on the selected star never clears it", async () => {
      const wrapper = mount(URating, { props: { modelValue: 3, stars: 5 } });
      await selectNatively(radios(wrapper)[2]);
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([3]);
    });

    it("clicking a star selects it", async () => {
      const wrapper = mount(URating, { props: { modelValue: null, stars: 5 } });
      await wrapper.findAll(".u-rating-option")[1].trigger("click");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([2]);
    });

    it("clicking the already-selected star clears it", async () => {
      const wrapper = mount(URating, { props: { modelValue: 3, stars: 5 } });
      await wrapper.findAll(".u-rating-option")[2].trigger("click");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([null]);
    });

    it("a click that lands on the radio itself is handled once, by the change", async () => {
      const wrapper = mount(URating, {
        props: { modelValue: null, stars: 3 },
        attachTo: document.body,
      });
      radios(wrapper)[1].element.click();
      await wrapper.vm.$nextTick();
      expect(wrapper.emitted("update:modelValue")).toEqual([[2]]);
      wrapper.unmount();
    });

    it("leaves the arrow keys to the native radio group", async () => {
      const wrapper = mount(URating, { props: { modelValue: 3, stars: 5 } });
      const event = new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      });
      radios(wrapper)[2].element.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("emits rate with the original event and the new value", async () => {
      const wrapper = mount(URating, { props: { modelValue: null, stars: 5 } });
      await wrapper.findAll(".u-rating-option")[3].trigger("click");
      const [payload] = wrapper.emitted("rate")![0] as [{ originalEvent: Event; value: number }];
      expect(payload.value).toBe(4);
      expect(payload.originalEvent.type).toBe("click");
    });

    it("works uncontrolled from defaultValue", async () => {
      const wrapper = mount(URating, { props: { defaultValue: 1, stars: 3 } });
      expect(radios(wrapper)[0].element.checked).toBe(true);
    });
  });

  describe("focus", () => {
    it("a click moves focus to the star's radio without a focus ring", async () => {
      const wrapper = mount(URating, {
        props: { modelValue: null, stars: 3 },
        attachTo: document.body,
      });
      await wrapper.findAll(".u-rating-option")[2].trigger("click");
      expect(document.activeElement).toBe(radios(wrapper)[2].element);
      expect(wrapper.findAll(".u-rating-option")[2].classes("p-focus-visible")).toBe(false);
      wrapper.unmount();
    });

    it("keyboard focus shows the focus ring on the focused star", async () => {
      const wrapper = mount(URating, { props: { modelValue: null, stars: 3 } });
      await radios(wrapper)[1].trigger("focus");
      expect(wrapper.findAll(".u-rating-option")[1].classes("p-focus-visible")).toBe(true);
      await radios(wrapper)[1].trigger("blur");
      expect(wrapper.findAll(".u-rating-option")[1].classes("p-focus-visible")).toBe(false);
    });

    it("emits the native focus and blur events", async () => {
      const wrapper = mount(URating, { props: { modelValue: null, stars: 3 } });
      await radios(wrapper)[0].trigger("focus");
      await radios(wrapper)[0].trigger("blur");
      expect((wrapper.emitted("focus")![0][0] as Event).type).toBe("focus");
      expect((wrapper.emitted("blur")![0][0] as Event).type).toBe("blur");
    });
  });

  describe("native radio group", () => {
    it("gives every radio one generated group name, unique per instance", () => {
      const first = mount(URating, { props: { modelValue: null } });
      const second = mount(URating, { props: { modelValue: null } });
      const names = new Set(radios(first).map((radio) => radio.element.name));
      expect(names.size).toBe(1);
      expect([...names][0]).toMatch(/_name$/);
      expect(radios(second)[0].element.name).not.toBe(radios(first)[0].element.name);
    });

    it("uses the supplied name", () => {
      const wrapper = mount(URating, { props: { modelValue: null, name: "score" } });
      expect(radios(wrapper).every((radio) => radio.element.name === "score")).toBe(true);
    });
  });

  describe("states", () => {
    it("readonly blocks clicks and puts a native change back", async () => {
      const wrapper = mount(URating, { props: { modelValue: 2, stars: 5, readonly: true } });
      await wrapper.findAll(".u-rating-option")[4].trigger("click");
      await selectNatively(radios(wrapper)[4]);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(radios(wrapper).map((radio) => radio.element.checked)).toEqual([
        false,
        true,
        false,
        false,
        false,
      ]);
      expect(wrapper.classes("p-readonly")).toBe(true);
      expect(wrapper.attributes("data-p")).toBe("readonly");
    });

    it("disabled disables every radio and adds p-disabled", () => {
      const wrapper = mount(URating, { props: { modelValue: null, stars: 3, disabled: true } });
      expect(radios(wrapper).every((radio) => radio.element.disabled)).toBe(true);
      expect(wrapper.classes("p-disabled")).toBe(true);
    });

    it("invalid marks the icons and the radios", () => {
      const wrapper = mount(URating, { props: { modelValue: 1, stars: 2, invalid: true } });
      expect(wrapper.findAll(".u-rating-icon.p-invalid").length).toBe(2);
      expect(radios(wrapper).every((radio) => radio.attributes("aria-invalid") === "true")).toBe(
        true
      );
    });
  });

  describe("custom icons", () => {
    it("renders the onicon and officon slots with the star value", () => {
      const wrapper = mount(URating, {
        props: { modelValue: 1, stars: 3 },
        slots: {
          onicon: (scope: { value: number }) => h("b", { class: "on" }, String(scope.value)),
          officon: (scope: { value: number }) => h("i", { class: "off" }, String(scope.value)),
        },
      });
      expect(wrapper.findAll(".on").map((el) => el.text())).toEqual(["1"]);
      expect(wrapper.findAll(".off").map((el) => el.text())).toEqual(["2", "3"]);
      expect(wrapper.find("svg").exists()).toBe(false);
    });

    it("renders a span with the onIcon and offIcon classes", () => {
      const wrapper = mount(URating, {
        props: { modelValue: 1, stars: 2, onIcon: "pi pi-heart-fill", offIcon: "pi pi-heart" },
      });
      expect(wrapper.find("span.u-rating-on-icon.pi-heart-fill").exists()).toBe(true);
      expect(wrapper.find("span.u-rating-off-icon.pi-heart").exists()).toBe(true);
    });
  });

  describe("pass-through and unstyled", () => {
    it("applies pt sections to the root, options, radios and icons", () => {
      const wrapper = mount(URating, {
        props: {
          modelValue: 1,
          stars: 2,
          pt: {
            root: { "data-pt": "root" },
            option: { "data-pt": "option" },
            hiddenOptionInputContainer: { "data-pt": "container" },
            hiddenOptionInput: { "data-pt": "input" },
            onIcon: { "data-pt": "on" },
            offIcon: { "data-pt": "off" },
          },
        },
      });
      expect(wrapper.attributes("data-pt")).toBe("root");
      expect(wrapper.find(".u-rating-option").attributes("data-pt")).toBe("option");
      expect(wrapper.find(".u-hidden-accessible").attributes("data-pt")).toBe("container");
      expect(wrapper.find("input").attributes("data-pt")).toBe("input");
      expect(wrapper.find(".u-rating-on-icon").attributes("data-pt")).toBe("on");
      expect(wrapper.find(".u-rating-off-icon").attributes("data-pt")).toBe("off");
    });

    it("passes attributes to the root", () => {
      const wrapper = mount(URating, { props: { modelValue: null }, attrs: { id: "score" } });
      expect(wrapper.attributes("id")).toBe("score");
    });

    it("renders no Ultimate classes when unstyled", () => {
      const wrapper = mount(URating, { props: { modelValue: 1, unstyled: true } });
      expect(wrapper.find("[class*='u-rating']").exists()).toBe(false);
      expect(wrapper.classes()).not.toContain("u-rating");
    });
  });
});
