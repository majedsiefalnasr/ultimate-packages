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

  it("renders one button per page-link, matching the shared display algorithm", () => {
    const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 30, pageLinkSize: 5 } });
    expect(wrapper.findAll("[data-u-paginator-page]").length).toBe(3);
  });

  it("emits page + update:first + update:rows when a page-link is clicked", async () => {
    const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
    const pageButtons = wrapper.findAll("[data-u-paginator-page]");
    await pageButtons[2].trigger("click");
    expect(wrapper.emitted("page")?.[0]).toEqual([{ page: 2, first: 20, rows: 10, pageCount: 10 }]);
    expect(wrapper.emitted("update:first")?.[0]).toEqual([20]);
  });

  it("advances d_first internally even without a v-model consumer (Vue's own internal-state model)", async () => {
    const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
    const nextButton = wrapper.find("[data-u-paginator-next]");
    await nextButton.trigger("click");
    expect((wrapper.vm as unknown as { d_first: number }).d_first).toBe(10);
  });

  it("v-model:first round-trips: emitted update:first reflected back as a new first prop advances d_first correctly", async () => {
    const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
    await wrapper.find("[data-u-paginator-next]").trigger("click");
    const emittedFirst = wrapper.emitted("update:first")?.[0]?.[0];
    await wrapper.setProps({ first: emittedFirst as number });
    expect((wrapper.vm as unknown as { d_first: number }).d_first).toBe(10);
  });

  it("renders a current-page report region with aria-live=polite", () => {
    const wrapper = mount(UPaginator, { props: { first: 0, rows: 10, totalRecords: 95 } });
    const report = wrapper.find("[data-u-paginator-current-report]");
    expect(report.exists()).toBe(true);
    expect(report.attributes("aria-live")).toBe("polite");
  });

  it("root export from index.ts matches the direct component export", async () => {
    const DirectImport = (await import("./Paginator.vue")).default;
    const { UPaginator: IndexImport } = await import("./index");
    expect(IndexImport).toBe(DirectImport);
  });
});
