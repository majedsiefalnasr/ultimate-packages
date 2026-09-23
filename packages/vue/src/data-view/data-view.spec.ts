import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h } from "vue";
import UDataView from "./DataView.vue";

const items = [
  { name: "Apple", score: 3 },
  { name: "Banana", score: 1 },
  { name: "Cherry", score: 2 },
];
const slots = {
  list: ({ items }: { items: { name: string }[] }) =>
    h("span", "list:" + items.map((item) => item.name).join(",")),
  grid: ({ items }: { items: { name: string }[] }) =>
    h("span", "grid:" + items.map((item) => item.name).join(",")),
};

describe("UDataView", () => {
  it("switches between independent list/grid slots", async () => {
    const wrapper = mount(UDataView, { props: { value: items }, slots });
    expect(wrapper.text()).toBe("list:Apple,Banana,Cherry");
    await wrapper.setProps({ layout: "grid" });
    expect(wrapper.text()).toBe("grid:Apple,Banana,Cherry");
    expect(wrapper.find(".u-data-view-list").exists()).toBe(false);
  });

  it("updates the rendered window from the real Paginator and external first changes", async () => {
    const wrapper = mount(UDataView, { props: { value: items, paginator: true, rows: 2 }, slots });
    expect(wrapper.findComponent({ name: "UPaginator" }).exists()).toBe(true);
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Apple,Banana");
    await wrapper.find("[data-u-paginator-next]").trigger("click");
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Cherry");
    await wrapper.setProps({ first: 1 });
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Banana,Cherry");
  });

  it("responds to sorting state changes before paging without mutating the source", async () => {
    const wrapper = mount(UDataView, {
      props: { value: items, paginator: true, rows: 2 },
      slots,
    });
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Apple,Banana");
    await wrapper.setProps({ sortField: "score", sortOrder: -1 });
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Apple,Cherry");
    expect(items.map((item) => item.score)).toEqual([3, 1, 2]);
  });

  it("has no filtering surface or control", () => {
    const wrapper = mount(UDataView, { props: { value: items }, slots });
    for (const prop of ["filter", "filterBy", "filterMatchMode", "filterLocale"])
      expect(wrapper.props()).not.toHaveProperty(prop);
    expect(wrapper.find('[role="searchbox"]').exists()).toBe(false);
    expect(wrapper.text()).toContain("Apple,Banana,Cherry");
  });

  it("keeps lazy pages intact and emits requests", () => {
    const wrapper = mount(UDataView, {
      props: { value: items, lazy: true, paginator: true, first: 20, rows: 2, totalRecords: 100 },
      slots,
    });
    expect(wrapper.find(".u-data-view-list").text()).toBe("list:Apple,Banana,Cherry");
    expect(wrapper.emitted("lazy-load")?.[0]?.[0]).toEqual({
      first: 20,
      rows: 2,
      sortField: null,
      sortOrder: 1,
    });
  });

  it("renders loading and empty state", () => {
    const wrapper = mount(UDataView, { props: { value: [], loading: true } });
    expect(wrapper.find('[role="status"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("No results found");
  });
});
