import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import UPaginator from "./Paginator.vue";

describe("UPaginator", () => {
  it("computes pageCount via uix-data's getPageCount, exposed as a data-page-count attribute", () => {
    const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
    expect(wrapper.attributes("data-page-count")).toBe("10");
  });

  it("initializes internal d_first/d_rows from props", () => {
    const wrapper = mount(UPaginator, { props: { first: 20, rows: 10, totalRecords: 95 } });
    expect((wrapper.vm as unknown as { d_first: number }).d_first).toBe(20);
    expect((wrapper.vm as unknown as { d_rows: number }).d_rows).toBe(10);
  });

  it("watcher-syncs d_first when the parent updates the first prop", async () => {
    const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
    await wrapper.setProps({ first: 30 });
    expect((wrapper.vm as unknown as { d_first: number }).d_first).toBe(30);
  });
});
