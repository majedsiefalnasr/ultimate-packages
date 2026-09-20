import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UBreadcrumb } from "./index";

const model = [
  { label: "Category", url: "/category" },
  { label: "Details", url: "/category/details" },
];

describe("UBreadcrumb", () => {
  it("renders a nav > ol trail of links for the model items", () => {
    const wrapper = mount(UBreadcrumb, { props: { model } });
    expect(wrapper.find("nav").exists()).toBe(true);
    const links = wrapper.findAll("a");
    expect(links.length).toBe(2);
    expect(links[0].text()).toBe("Category");
    expect(links[1].text()).toBe("Details");
  });

  it("renders a home item before the model trail, separated by a separator", () => {
    const wrapper = mount(UBreadcrumb, { props: { model, home: { icon: "pi pi-home", url: "/" } } });
    const links = wrapper.findAll("a");
    expect(links.length).toBe(3);
    expect(wrapper.findAll('[role="separator"]').length).toBe(2);
  });

  it("omits the home item entirely when not provided", () => {
    const wrapper = mount(UBreadcrumb, { props: { model } });
    expect(wrapper.findAll('[role="separator"]').length).toBe(1);
  });

  it("hides an item whose visible is false", () => {
    const wrapper = mount(UBreadcrumb, {
      props: { model: [...model, { label: "Hidden", visible: false, url: "/hidden" }] },
    });
    expect(wrapper.text()).not.toContain("Hidden");
  });

  it("marks a disabled item with aria-disabled and prevents its click from firing item-select", async () => {
    const wrapper = mount(UBreadcrumb, {
      props: { model: [...model, { label: "Disabled", disabled: true, url: "/disabled" }] },
    });
    const disabledLink = wrapper.findAll("a")[2];
    expect(disabledLink.attributes("aria-disabled")).toBe("true");
    await disabledLink.trigger("click");
    expect(wrapper.emitted("item-select")).toBeFalsy();
  });

  it("emits item-select and calls the item's command on click of an enabled item", async () => {
    let called = false;
    const wrapper = mount(UBreadcrumb, {
      props: { model: [{ label: "Action", url: "/action", command: () => (called = true) }] },
    });
    await wrapper.find("a").trigger("click");
    expect(called).toBe(true);
    expect(wrapper.emitted("item-select")).toBeTruthy();
  });

  it("applies target to the rendered link when the item specifies one", () => {
    const wrapper = mount(UBreadcrumb, {
      props: { model: [{ label: "External", url: "https://example.com", target: "_blank" }] },
    });
    expect(wrapper.find("a").attributes("target")).toBe("_blank");
  });

  it('sets aria-current="page" on the last item when its url matches the current location', () => {
    const originalLocation = window.location.pathname;
    window.history.pushState({}, "", "/category/details");
    const wrapper = mount(UBreadcrumb, { props: { model } });
    const links = wrapper.findAll("a");
    expect(links[1].attributes("aria-current")).toBe("page");
    expect(links[0].attributes("aria-current")).toBeUndefined();
    window.history.pushState({}, "", originalLocation);
  });

  it("renders an item's icon when provided", () => {
    const wrapper = mount(UBreadcrumb, { props: { model: [{ label: "Icon Item", icon: "pi pi-star", url: "/x" }] } });
    expect(wrapper.find(".pi-star").exists()).toBe(true);
  });
});
