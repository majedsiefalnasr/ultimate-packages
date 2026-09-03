import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UTable from "./Table.vue";

describe("UTable", () => {
  it("renders one row per value entry with role=row and a columnheader per column", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
        columns: [{ field: "name", header: "Name" }],
      },
    });
    expect(wrapper.findAll('[role="row"]').length).toBeGreaterThanOrEqual(2);
    expect(wrapper.find('[role="columnheader"]').text()).toBe("Name");
  });

  it("root has role=table", () => {
    const wrapper = mount(UTable, { props: { value: [], columns: [] } });
    expect(wrapper.find('[role="table"]').exists()).toBe(true);
  });
});

describe("sorting", () => {
  it("renders rows pre-sorted by sortField/sortOrder without mutating the value prop", () => {
    const original = [
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice" },
    ];
    const wrapper = mount(UTable, {
      props: { value: original, columns: [{ field: "name", header: "Name" }], sortField: "name", sortOrder: 1 },
    });
    const cells = wrapper.findAll("td");
    expect(cells[0].text()).toBe("Alice");
    expect(original[0].name).toBe("Bob");
  });

  it("sets aria-sort on the active sortField's columnheader and emits sort on click", async () => {
    const wrapper = mount(UTable, {
      props: { value: [{ id: 1, name: "Alice" }], columns: [{ field: "name", header: "Name" }], sortField: "name", sortOrder: -1 },
    });
    const header = wrapper.find('[role="columnheader"]');
    expect(header.attributes("aria-sort")).toBe("descending");
    await header.trigger("click");
    expect(wrapper.emitted("sort")).toBeTruthy();
  });
});

describe("filtering (Vue object+constraints operator shape, spec §9)", () => {
  it("applies a simple FilterMetadata filter", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "ali", matchMode: "contains" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(1);
  });
});

describe("selection", () => {
  it("emits update:selection with the clicked row in single mode", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Alice" }],
        dataKey: "id",
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "single",
      },
    });
    await wrapper.find('tbody [role="row"]').trigger("click");
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([{ id: 1, name: "Alice" }]);
  });
});
