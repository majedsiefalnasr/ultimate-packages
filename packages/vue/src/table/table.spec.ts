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
