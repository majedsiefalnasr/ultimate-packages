import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { UMegaMenu } from "./index";

const model = [
  {
    label: "Products",
    items: [
      [{ label: "Category A", items: [{ label: "Item A1" }, { label: "Item A2" }] }],
      [{ label: "Category B", items: [{ label: "Item B1" }] }],
    ],
  },
  { label: "About", url: "/about" },
];

describe("UMegaMenu", () => {
  it("renders a menubar of root items", () => {
    const wrapper = mount(UMegaMenu, { props: { model } });
    expect(wrapper.find('[role="menubar"]').exists()).toBe(true);
    expect(wrapper.findAll('[role="menubar"] > li').length).toBe(2);
  });

  it("marks a column-grid item as aria-haspopup=menu", () => {
    const wrapper = mount(UMegaMenu, { props: { model } });
    const productsLink = wrapper.findAll('[role="menubar"] > li')[0].find("a");
    expect(productsLink.attributes("aria-haspopup")).toBe("menu");
  });

  it("opens the multi-column overlay on click", async () => {
    const wrapper = mount(UMegaMenu, { props: { model } });
    const productsItem = wrapper.findAll('[role="menubar"] > li')[0];
    await productsItem.find("a").trigger("click");
    expect(productsItem.attributes("data-u-open")).toBe("true");
    expect(productsItem.findAll(".u-megamenu-column").length).toBe(2);
  });

  it("renders each column's grouped items with a submenu label", async () => {
    const wrapper = mount(UMegaMenu, { props: { model } });
    const productsItem = wrapper.findAll('[role="menubar"] > li')[0];
    await productsItem.find("a").trigger("click");
    const labels = productsItem.findAll(".u-megamenu-submenu-label").map((el) => el.text());
    expect(labels).toEqual(["Category A", "Category B"]);
  });

  it("opens the overlay on hover (mouseenter)", async () => {
    const wrapper = mount(UMegaMenu, { props: { model } });
    const productsItem = wrapper.findAll('[role="menubar"] > li')[0];
    await productsItem.trigger("mouseenter");
    expect(productsItem.attributes("data-u-open")).toBe("true");
  });

  it("closes the overlay on a second click", async () => {
    const wrapper = mount(UMegaMenu, { props: { model } });
    const productsItem = wrapper.findAll('[role="menubar"] > li')[0];
    const link = productsItem.find("a");
    await link.trigger("click");
    await link.trigger("click");
    expect(productsItem.attributes("data-u-open")).toBe("false");
  });

  it("emits item-select and closes the overlay when a leaf column item is clicked", async () => {
    const wrapper = mount(UMegaMenu, { props: { model } });
    const productsItem = wrapper.findAll('[role="menubar"] > li')[0];
    await productsItem.find("a").trigger("click");
    const leafLink = productsItem.find(".u-megamenu-submenu a");
    await leafLink.trigger("click");
    expect(wrapper.emitted("item-select")).toBeTruthy();
    expect(productsItem.attributes("data-u-open")).toBe("false");
  });

  it("does not open or navigate for a disabled root item", async () => {
    const disabledModel = [{ label: "Disabled", disabled: true, items: [[{ label: "X", items: [{ label: "Y" }] }]] }];
    const wrapper = mount(UMegaMenu, { props: { model: disabledModel } });
    const item = wrapper.findAll('[role="menubar"] > li')[0];
    const link = item.find("a");
    expect(link.attributes("aria-disabled")).toBe("true");
    await link.trigger("click");
    expect(item.attributes("data-u-open")).toBe("false");
  });

  it("hides an item whose visible is false", () => {
    const wrapper = mount(UMegaMenu, { props: { model: [...model, { label: "Hidden", visible: false, url: "/h" }] } });
    expect(wrapper.text()).not.toContain("Hidden");
  });
});
