import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UAccordion } from "./index";
import { UAccordionPanel } from "../accordion-panel";
import { UAccordionHeader } from "../accordion-header";
import { UAccordionContent } from "../accordion-content";

function mountAccordion(props = {}) {
  return mount(
    {
      components: { UAccordion, UAccordionPanel, UAccordionHeader, UAccordionContent },
      props: Object.keys(props),
      template: `
        <UAccordion v-bind="$props">
          <UAccordionPanel value="a">
            <UAccordionHeader>Tab 1</UAccordionHeader>
            <UAccordionContent>Content 1</UAccordionContent>
          </UAccordionPanel>
          <UAccordionPanel value="b">
            <UAccordionHeader>Tab 2</UAccordionHeader>
            <UAccordionContent>Content 2</UAccordionContent>
          </UAccordionPanel>
          <UAccordionPanel value="c" disabled>
            <UAccordionHeader>Tab 3</UAccordionHeader>
            <UAccordionContent>Content 3</UAccordionContent>
          </UAccordionPanel>
        </UAccordion>
      `,
    },
    { props, attachTo: document.body }
  );
}

describe("Accordion family (UAccordion/UAccordionPanel/UAccordionHeader/UAccordionContent)", () => {
  it("renders all headers, content hidden until active", () => {
    const wrapper = mountAccordion();
    expect(wrapper.findAll('[role="button"]').length).toBe(3);
    const regions = wrapper.findAll('[role="region"]');
    expect(regions.every((r) => !r.isVisible())).toBe(true);
  });

  it("expands a panel on header click", async () => {
    const wrapper = mountAccordion();
    const headers = wrapper.findAll('[role="button"]');
    await headers[0].trigger("click");
    const regions = wrapper.findAll('[role="region"]');
    expect(regions[0].isVisible()).toBe(true);
    expect(headers[0].attributes("aria-expanded")).toBe("true");
  });

  it("collapses an expanded panel when clicked again (single mode)", async () => {
    const wrapper = mountAccordion();
    const headers = wrapper.findAll('[role="button"]');
    await headers[0].trigger("click");
    expect(wrapper.findAll('[role="region"]')[0].isVisible()).toBe(true);
    await headers[0].trigger("click");
    expect(wrapper.findAll('[role="region"]')[0].isVisible()).toBe(false);
  });

  it("single mode: expanding a second panel closes the first", async () => {
    const wrapper = mountAccordion();
    const headers = wrapper.findAll('[role="button"]');
    await headers[0].trigger("click");
    await headers[1].trigger("click");
    expect(headers[0].attributes("aria-expanded")).toBe("false");
    expect(headers[1].attributes("aria-expanded")).toBe("true");
  });

  it("multiple mode: allows more than one panel expanded simultaneously", async () => {
    const wrapper = mountAccordion({ multiple: true });
    const headers = wrapper.findAll('[role="button"]');
    await headers[0].trigger("click");
    await headers[1].trigger("click");
    expect(headers[0].attributes("aria-expanded")).toBe("true");
    expect(headers[1].attributes("aria-expanded")).toBe("true");
  });

  it("does not expand a disabled panel", async () => {
    const wrapper = mountAccordion();
    const headers = wrapper.findAll('[role="button"]');
    await headers[2].trigger("click");
    expect(headers[2].attributes("aria-expanded")).toBe("false");
  });

  it("emits tab-open and tab-close", async () => {
    const wrapper = mountAccordion();
    const headers = wrapper.findAll('[role="button"]');
    await headers[0].trigger("click");
    const accordion = wrapper.findComponent(UAccordion);
    expect(accordion.emitted("tab-open")?.[0]).toEqual([{ originalEvent: undefined, index: "a" }]);

    await headers[0].trigger("click");
    expect(accordion.emitted("tab-close")?.[0]).toEqual([{ originalEvent: undefined, index: "a" }]);
  });

  it("respects an externally-controlled value prop", () => {
    const wrapper = mountAccordion({ value: "b" });
    const headers = wrapper.findAll('[role="button"]');
    expect(headers[1].attributes("aria-expanded")).toBe("true");
  });

  it("toggles on Enter/Space keydown", async () => {
    const wrapper = mountAccordion();
    const headers = wrapper.findAll('[role="button"]');
    await headers[0].trigger("keydown", { code: "Enter" });
    expect(headers[0].attributes("aria-expanded")).toBe("true");
  });
});
