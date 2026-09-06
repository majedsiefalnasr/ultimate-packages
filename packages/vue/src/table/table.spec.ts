import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import UTable from "./Table.vue";
import UPaginatorReal from "../paginator/Paginator.vue";
import UScrollerReal from "../scroller/Scroller.vue";

let resizeObserverCallback: ResizeObserverCallback | undefined;

beforeEach(() => {
  resizeObserverCallback = undefined;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(cb: ResizeObserverCallback) {
        resizeObserverCallback = cb;
      }
      observe(target: Element) {
        resizeObserverCallback?.([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
      }
      disconnect() {}
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockViewportHeight(element: HTMLElement, height: number): void {
  Object.defineProperty(element, "offsetHeight", { value: height, configurable: true });
}

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

describe("keyboard navigation", () => {
  it("ArrowDown on a row moves focus to the next row", async () => {
    const wrapper = mount(UTable, {
      attachTo: document.body,
      props: {
        value: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
        columns: [{ field: "name", header: "Name" }],
      },
    });
    const rows = wrapper.findAll('tbody [role="row"]');
    (rows[0].element as HTMLElement).focus();
    await rows[0].trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(rows[1].element);
    wrapper.unmount();
  });
});

describe("Paginator composition (real UPaginator, not a mock)", () => {
  it("renders a real UPaginator child and slices rows to the current page", () => {
    const rowsData = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const wrapper = mount(UTable, {
      props: {
        value: rowsData,
        columns: [{ field: "name", header: "Name" }],
        paginator: true,
        first: 0,
        rows: 10,
        totalRecords: 25,
      },
    });
    expect(wrapper.find("nav").exists()).toBe(true);
    expect(wrapper.findAll("tbody td").length).toBe(10);
  });
});

describe("Scroller composition (real UScroller content-template mechanism, not a mock)", () => {
  it("renders a real UScroller child with real table/tbody/tr/td markup via its #content slot when virtualScrollerOptions is provided", async () => {
    const rowsData = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const wrapper = mount(UTable, {
      props: {
        value: rowsData,
        columns: [{ field: "name", header: "Name" }],
        virtualScrollerOptions: { itemSize: 30 },
      },
    });
    // Real windowing requires a measured viewport: UScroller's mounted()
    // constructs a ResizeObserver unconditionally, and jsdom's default
    // offsetHeight is 0, which computes numItemsInViewport=0 and renders
    // zero rows. Mock the viewport and re-invoke the component's own
    // captured ResizeObserver callback (never construct a second observer,
    // which would silently overwrite the module-scope callback slot),
    // matching the established convention from scroller.spec.ts.
    const scrollerRoot = wrapper.find("[class*=u-scroller]").element as HTMLElement;
    mockViewportHeight(scrollerRoot, 200);
    resizeObserverCallback?.([{ target: scrollerRoot } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    await wrapper.vm.$nextTick();

    const table = wrapper.find("table[data-u-table-virtual-body]");
    expect(table.exists()).toBe(true);
    const tbody = table.find("tbody");
    expect(tbody.element.parentElement).toBe(table.element);
    const trs = tbody.element.querySelectorAll(":scope > tr");
    expect(trs.length).toBeGreaterThan(0);
    expect(trs.length).toBeLessThan(200);
    trs.forEach((tr) => expect(tr.querySelector(":scope > td")).not.toBeNull());
    expect(wrapper.findAll("[data-u-scroller-item]").length).toBe(0);
  });

  it("positions each virtualized row with an absolute top offset computed from its real absolute index", async () => {
    const rowsData = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const wrapper = mount(UTable, {
      props: {
        value: rowsData,
        columns: [{ field: "name", header: "Name" }],
        virtualScrollerOptions: { itemSize: 30 },
      },
    });
    const scrollerRoot = wrapper.find("[class*=u-scroller]").element as HTMLElement;
    mockViewportHeight(scrollerRoot, 300);
    resizeObserverCallback?.([{ target: scrollerRoot } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll("table[data-u-table-virtual-body] tbody tr");
    expect(rows.length).toBeGreaterThan(1);
    // First rendered row is absolute index 0 -> top 0px.
    expect((rows[0].element as HTMLElement).style.top).toBe("0px");
    // Second rendered row is absolute index 1 -> top 30px (index * itemSize).
    expect((rows[1].element as HTMLElement).style.top).toBe("30px");
  });

  it("clicking a virtualized row emits update:selection with the clicked row (single mode)", async () => {
    const rowsData = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const wrapper = mount(UTable, {
      props: {
        value: rowsData,
        dataKey: "id",
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "single",
        virtualScrollerOptions: { itemSize: 30 },
      },
    });
    const scrollerRoot = wrapper.find("[class*=u-scroller]").element as HTMLElement;
    mockViewportHeight(scrollerRoot, 200);
    resizeObserverCallback?.([{ target: scrollerRoot } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    await wrapper.vm.$nextTick();

    const firstRow = wrapper.find('table[data-u-table-virtual-body] tbody [role="row"]');
    await firstRow.trigger("click");
    expect(wrapper.emitted("update:selection")?.[0]).toEqual([rowsData[0]]);
  });

  it("ArrowDown on a virtualized row moves focus to the next row within the rendered window", async () => {
    const rowsData = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const wrapper = mount(UTable, {
      attachTo: document.body,
      props: {
        value: rowsData,
        columns: [{ field: "name", header: "Name" }],
        virtualScrollerOptions: { itemSize: 30 },
      },
    });
    const scrollerRoot = wrapper.find("[class*=u-scroller]").element as HTMLElement;
    mockViewportHeight(scrollerRoot, 200);
    resizeObserverCallback?.([{ target: scrollerRoot } as unknown as ResizeObserverEntry], {} as unknown as ResizeObserver);
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('table[data-u-table-virtual-body] tbody [role="row"]');
    expect(rows.length).toBeGreaterThan(1);
    (rows[0].element as HTMLElement).focus();
    await rows[0].trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(rows[1].element);
    wrapper.unmount();
  });
});

describe("row editing (v-model:editingRows array, spec §11.3)", () => {
  it("emits update:editingRows with the row appended when row edit is initiated", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Alice" }],
        dataKey: "id",
        columns: [{ field: "name", header: "Name" }],
        editMode: "row",
        editingRows: [],
      },
    });
    await wrapper.find("[data-u-table-row-edit-init]").trigger("click");
    expect(wrapper.emitted("update:editingRows")?.[0]).toEqual([[{ id: 1, name: "Alice" }]]);
  });
});

describe("row grouping (SortMeta-reuse convention, spec §13)", () => {
  it("groups adjacent rows sharing the same groupRowsBy value under subheader mode", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { group: "a", name: "Alice" },
          { group: "a", name: "Amy" },
          { group: "b", name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        rowGroupMode: "subheader",
        groupRowsBy: "group",
      },
    });
    expect(wrapper.findAll("[data-u-table-group-header]").length).toBe(2);
  });
});

describe("package export", () => {
  it("is exported from the package root", async () => {
    const { UTable: RootExport } = await import("../index");
    expect(RootExport).toBe(UTable);
  });
});

describe("real child-component composition (regression guard, Task 24)", () => {
  it("mounts the real Paginator.vue component, not a locally re-declared one", () => {
    const wrapper = mount(UTable, {
      props: { value: [{ id: 1, name: "Alice" }], paginator: true, rows: 10, totalRecords: 1 },
    });
    const paginatorComponent = wrapper.findComponent(UPaginatorReal);
    expect(paginatorComponent.exists()).toBe(true);
  });

  it("mounts the real Scroller.vue component (via its content slot), not a locally re-declared one", () => {
    const rowsData = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const wrapper = mount(UTable, {
      props: {
        value: rowsData,
        columns: [{ field: "name", header: "Name" }],
        virtualScrollerOptions: { itemSize: 30 },
      },
    });
    const scrollerComponent = wrapper.findComponent(UScrollerReal);
    expect(scrollerComponent.exists()).toBe(true);
  });
});
