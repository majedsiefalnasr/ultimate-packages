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

  describe("keyboard navigation (GAP-054)", () => {
    it("moves focus to the next root item on ArrowRight", async () => {
      const wrapper = mount(UMegaMenu, { props: { model }, attachTo: document.body });
      const links = wrapper.findAll('[role="menubar"] > li > .u-megamenu-item-content > a');
      (links[0].element as HTMLElement).focus();
      await links[0].trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[1].element);
      wrapper.unmount();
    });

    it("moves focus to the previous root item on ArrowLeft, wrapping around", async () => {
      const wrapper = mount(UMegaMenu, { props: { model }, attachTo: document.body });
      const links = wrapper.findAll('[role="menubar"] > li > .u-megamenu-item-content > a');
      (links[0].element as HTMLElement).focus();
      await links[0].trigger("keydown", { code: "ArrowLeft" });
      expect(document.activeElement).toBe(links[1].element);
      wrapper.unmount();
    });

    it("skips a disabled root item when moving focus with ArrowRight", async () => {
      const withDisabled = [
        { label: "One", url: "/one" },
        { label: "Two", url: "/two", disabled: true },
        { label: "Three", url: "/three" },
      ];
      const wrapper = mount(UMegaMenu, { props: { model: withDisabled }, attachTo: document.body });
      const links = wrapper.findAll('[role="menubar"] > li > .u-megamenu-item-content > a');
      (links[0].element as HTMLElement).focus();
      await links[0].trigger("keydown", { code: "ArrowRight" });
      expect(document.activeElement).toBe(links[2].element);
      wrapper.unmount();
    });

    it("opens the overlay and focuses the first leaf item on Enter", async () => {
      const wrapper = mount(UMegaMenu, { props: { model }, attachTo: document.body });
      const productsItem = wrapper.findAll('[role="menubar"] > li')[0];
      const link = productsItem.find("a");
      (link.element as HTMLElement).focus();
      await link.trigger("keydown", { code: "Enter" });
      await wrapper.vm.$nextTick();
      expect(productsItem.attributes("data-u-open")).toBe("true");
      const firstLeafLink = productsItem.find(".u-megamenu-submenu a");
      expect(document.activeElement).toBe(firstLeafLink.element);
      wrapper.unmount();
    });

    it("skips a disabled leaf item when moving focus with ArrowDown inside a column group", async () => {
      const withDisabledLeaf = [
        {
          label: "Products",
          items: [[{ label: "Category A", items: [{ label: "A1" }, { label: "A2", disabled: true }, { label: "A3" }] }]],
        },
      ];
      const wrapper = mount(UMegaMenu, { props: { model: withDisabledLeaf }, attachTo: document.body });
      const productsItem = wrapper.findAll('[role="menubar"] > li')[0];
      await productsItem.find("a").trigger("click");
      const leafLinks = productsItem.findAll(".u-megamenu-submenu a");
      (leafLinks[0].element as HTMLElement).focus();
      await leafLinks[0].trigger("keydown", { code: "ArrowDown" });
      expect(document.activeElement).toBe(leafLinks[2].element);
      wrapper.unmount();
    });

    it("moves focus to the previous leaf item on ArrowUp within a column group", async () => {
      const wrapper = mount(UMegaMenu, { props: { model }, attachTo: document.body });
      const productsItem = wrapper.findAll('[role="menubar"] > li')[0];
      await productsItem.find("a").trigger("click");
      const leafLinks = productsItem.findAll(".u-megamenu-submenu a");
      (leafLinks[1].element as HTMLElement).focus();
      await leafLinks[1].trigger("keydown", { code: "ArrowUp" });
      expect(document.activeElement).toBe(leafLinks[0].element);
      wrapper.unmount();
    });

    it("closes the overlay on Escape from a leaf item focused deep inside it, and refocuses the root trigger", async () => {
      const wrapper = mount(UMegaMenu, { props: { model }, attachTo: document.body });
      const productsItem = wrapper.findAll('[role="menubar"] > li')[0];
      const trigger = productsItem.find("a");
      await trigger.trigger("click");
      const leafLink = productsItem.find(".u-megamenu-submenu a");
      (leafLink.element as HTMLElement).focus();
      await leafLink.trigger("keydown", { code: "Escape" });
      expect(productsItem.attributes("data-u-open")).toBe("false");
      expect(document.activeElement).toBe(trigger.element);
      wrapper.unmount();
    });

    describe("index mapping with a hidden root item before the target (GAP-054 fix-loop)", () => {
      const modelWithHidden = [
        { label: "A" },
        { label: "Hidden", visible: false },
        { label: "B", items: [[{ label: "Group", items: [{ label: "Leaf" }] }]] },
        { label: "C" },
      ];

      it("opens the overlay on Enter for a root item positioned after a hidden item", async () => {
        const wrapper = mount(UMegaMenu, { props: { model: modelWithHidden }, attachTo: document.body });
        // "B" is rendered link index 1 (Hidden renders no <li>/<a>), but model index 2.
        const bLink = wrapper.findAll('[role="menubar"] > li > .u-megamenu-item-content > a')[1];
        (bLink.element as HTMLElement).focus();
        await bLink.trigger("keydown", { code: "Enter" });

        const bLi = bLink.element.closest("li") as HTMLElement;
        expect(bLi.getAttribute("data-u-open")).toBe("true");

        wrapper.unmount();
      });

      it("Escape from a leaf item refocuses the correct owning root trigger, not a sibling shifted by a hidden item", async () => {
        const wrapper = mount(UMegaMenu, { props: { model: modelWithHidden }, attachTo: document.body });
        const bLink = wrapper.findAll('[role="menubar"] > li > .u-megamenu-item-content > a')[1];
        (bLink.element as HTMLElement).focus();
        await bLink.trigger("keydown", { code: "Enter" });

        const bLi = wrapper.findAll('[role="menubar"] > li').find((li) => li.element === bLink.element.closest("li"))!;
        const leafLink = bLi.find(".u-megamenu-submenu a");
        expect(document.activeElement).toBe(leafLink.element);

        await leafLink.trigger("keydown", { code: "Escape" });

        expect(document.activeElement).toBe(bLink.element);

        wrapper.unmount();
      });

      it("ArrowLeft from a root item after a hidden item does not get stuck", async () => {
        const wrapper = mount(UMegaMenu, { props: { model: modelWithHidden }, attachTo: document.body });
        const links = wrapper.findAll('[role="menubar"] > li > .u-megamenu-item-content > a');
        const [a, b] = links;
        (b.element as HTMLElement).focus();
        await b.trigger("keydown", { code: "ArrowLeft" });
        expect(document.activeElement).toBe(a.element);

        wrapper.unmount();
      });
    });

    describe("index mapping with a hidden leaf item before the target in a column group (GAP-054 fix-loop)", () => {
      it("ArrowDown from a leaf item after a hidden leaf item does not get stuck", async () => {
        const withHiddenLeaf = [
          {
            label: "Products",
            items: [[{ label: "Category A", items: [{ label: "A1" }, { label: "Hidden", visible: false }, { label: "A2" }] }]],
          },
        ];
        const wrapper = mount(UMegaMenu, { props: { model: withHiddenLeaf }, attachTo: document.body });
        const productsItem = wrapper.findAll('[role="menubar"] > li')[0];
        await productsItem.find("a").trigger("click");

        const leafLinks = productsItem.findAll(".u-megamenu-submenu a");
        // Rendered leaf links are [A1, A2] (Hidden renders no <li>/<a>).
        expect(leafLinks.length).toBe(2);
        (leafLinks[0].element as HTMLElement).focus();
        await leafLinks[0].trigger("keydown", { code: "ArrowDown" });
        expect(document.activeElement).toBe(leafLinks[1].element);

        wrapper.unmount();
      });
    });
  });
});
