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

describe("filtering — remaining comparator modes (Spec: 2026-09-23-table-filter-vocabulary-design.md)", () => {
  // Explicit mode-coverage checklist for this framework — each of the 14
  // comparator modes must appear as a literal matchMode string in at least
  // one assertion below: notContains, endsWith, notEquals, lt, lte, gt,
  // gte, between, in, notIn, dateIs, dateIsNot, dateBefore, dateAfter.
  interface NumRow {
    id: number;
    score: number;
  }
  interface DateRow {
    id: number;
    when: Date;
  }

  it("applies matchMode: notContains, case-insensitively", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "ALI", matchMode: "notContains" } },
      },
    });
    const cells = wrapper.findAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].text()).toBe("Bob");
  });

  it("matchMode: notContains passes through (matches everything) when the filter value is absent or empty", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: undefined, matchMode: "notContains" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(2);

    await wrapper.setProps({ filters: { name: { value: "", matchMode: "notContains" } } });
    expect(wrapper.findAll("td").length).toBe(2);
  });

  it("applies matchMode: startsWith, case-insensitively", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Alison" },
          { id: 3, name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "ALI", matchMode: "startsWith" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(2);
  });

  it("applies matchMode: equals, case-insensitively", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Alison" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "alice", matchMode: "equals" } },
      },
    });
    const cells = wrapper.findAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].text()).toBe("Alice");
  });

  it("applies matchMode: endsWith, case-insensitively", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "CE", matchMode: "endsWith" } },
      },
    });
    const cells = wrapper.findAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].text()).toBe("Alice");
  });

  it("applies matchMode: notEquals, and an absent OR empty-string filter value does not match (Vue's verified real default, same as Angular — not React)", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "Alice", matchMode: "notEquals" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(1);

    // Real PrimeVue FilterService.js's own notEquals: filter === undefined ||
    // filter === null || filter === '' => false (does not match). Vue checks
    // the literal empty string (no .trim()), unlike Angular's/React's
    // whitespace-aware check, but the outcome for a plain '' is identical.
    await wrapper.setProps({ filters: { name: { value: undefined, matchMode: "notEquals" } } });
    expect(wrapper.findAll("td").length).toBe(0);

    await wrapper.setProps({ filters: { name: { value: "", matchMode: "notEquals" } } });
    expect(wrapper.findAll("td").length).toBe(0);
  });

  it("applies matchMode: lt/lte/gt/gte", async () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "score", header: "Score" }],
        filters: { score: { value: 20, matchMode: "lt" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(1);

    await wrapper.setProps({ filters: { score: { value: 20, matchMode: "lte" } } });
    expect(wrapper.findAll("td").length).toBe(2);

    await wrapper.setProps({ filters: { score: { value: 20, matchMode: "gt" } } });
    expect(wrapper.findAll("td").length).toBe(1);

    await wrapper.setProps({ filters: { score: { value: 20, matchMode: "gte" } } });
    expect(wrapper.findAll("td").length).toBe(2);
  });

  it("lt passes through (matches everything) when the filter value itself is absent", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, score: 10 },
          { id: 2, score: 20 },
          { id: 3, score: 30 },
        ],
        columns: [{ field: "score", header: "Score" }],
        filters: { score: { value: undefined, matchMode: "lt" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(3);
  });

  it("applies matchMode: between, inclusive bounds, inverted range matches nothing, null bound passes through", async () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "score", header: "Score" }],
        filters: { score: { value: [10, 20], matchMode: "between" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(2);

    await wrapper.setProps({ filters: { score: { value: [30, 10], matchMode: "between" } } });
    expect(wrapper.findAll("td").length).toBe(0);

    await wrapper.setProps({ filters: { score: { value: [null, null], matchMode: "between" } } });
    expect(wrapper.findAll("td").length).toBe(3);
  });

  it("applies matchMode: in/notIn using equals-based membership, including a null filter-array entry; empty array passes through", async () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "score", header: "Score" }],
        filters: { score: { value: [10, 30, null], matchMode: "in" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(2);

    await wrapper.setProps({ filters: { score: { value: [10, 30, null], matchMode: "notIn" } } });
    expect(wrapper.findAll("td").length).toBe(1);

    await wrapper.setProps({ filters: { score: { value: [], matchMode: "in" } } });
    expect(wrapper.findAll("td").length).toBe(3);
  });

  it("applies date matchModes: dateIs/dateIsNot (day-level) and dateBefore/dateAfter (time-precise)", async () => {
    const rows: DateRow[] = [
      { id: 1, when: new Date(2026, 0, 1, 9, 0) },
      { id: 2, when: new Date(2026, 0, 1, 15, 0) },
      { id: 3, when: new Date(2026, 0, 2, 9, 0) },
    ];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "when", header: "When" }],
        filters: { when: { value: new Date(2026, 0, 1), matchMode: "dateIs" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(2);

    await wrapper.setProps({ filters: { when: { value: new Date(2026, 0, 1), matchMode: "dateIsNot" } } });
    expect(wrapper.findAll("td").length).toBe(1);

    await wrapper.setProps({
      filters: { when: { value: new Date(2026, 0, 1, 12, 0), matchMode: "dateBefore" } },
    });
    expect(wrapper.findAll("td").length).toBe(1);

    await wrapper.setProps({
      filters: { when: { value: new Date(2026, 0, 1, 12, 0), matchMode: "dateAfter" } },
    });
    expect(wrapper.findAll("td").length).toBe(2);
  });

  it("applies date matchModes with real string-date coercion, distinct from Angular/React", () => {
    const rows: DateRow[] = [
      { id: 1, when: new Date(2026, 0, 1, 9, 0) },
      { id: 2, when: new Date(2026, 0, 2, 9, 0) },
    ];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "when", header: "When" }],
        // A string-typed filter value — Vue's real FilterService coerces this
        // via new Date(...) before comparing; Angular/React do not support this.
        filters: { when: { value: "2026-01-01T00:00:00", matchMode: "dateIs" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(1);
  });

  it("a row with an undefined field value fails gt once a real filter value is present", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1 }, { id: 2, score: 20 }],
        columns: [{ field: "score", header: "Score" }],
        filters: { score: { value: 10, matchMode: "gt" } },
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

describe("selection-column UI (Spec §5.2, GAP-042)", () => {
  it("renders a checkbox per row and a header select-all checkbox when selectionMode is multiple and selectionColumn is true", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "A" }, { id: 2, name: "B" }],
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "multiple",
        selectionColumn: true,
      },
    });
    const headerCheckbox = wrapper.find("thead input[type=checkbox]");
    const rowCheckboxes = wrapper.findAll("tbody input[type=checkbox]");
    expect(headerCheckbox.exists()).toBe(true);
    expect(rowCheckboxes.length).toBe(2);
  });

  it("renders a radio button per row and no header control when selectionMode is single and selectionColumn is true", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "A" }],
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "single",
        selectionColumn: true,
      },
    });
    expect(wrapper.find("tbody input[type=radio]").exists()).toBe(true);
    expect(wrapper.find("thead input").exists()).toBe(false);
  });

  it("does not render a selection column when selectionColumn is false (default)", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "A" }],
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "multiple",
      },
    });
    expect(wrapper.find("input[type=checkbox]").exists()).toBe(false);
  });

  it("header checkbox is unchecked and enabled when value is empty", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [],
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "multiple",
        selectionColumn: true,
      },
    });
    const headerCheckbox = wrapper.find("thead input[type=checkbox]");
    expect((headerCheckbox.element as HTMLInputElement).checked).toBe(false);
    expect((headerCheckbox.element as HTMLInputElement).disabled).toBe(false);
  });

  it("clicking a row checkbox toggles that row into the selection and emits selection-change", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "A" }],
        dataKey: "id",
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "multiple",
        selection: [],
        selectionColumn: true,
      },
    });
    await wrapper.find("tbody input[type=checkbox]").trigger("click");
    expect(wrapper.emitted("selection-change")?.[0]).toEqual([[{ id: 1, name: "A" }]]);
  });

  it("clicking the header checkbox selects all rows; clicking again deselects all", async () => {
    const rows = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        dataKey: "id",
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "multiple",
        selection: [],
        selectionColumn: true,
      },
    });
    await wrapper.find("thead input[type=checkbox]").trigger("click");
    expect(wrapper.emitted("selection-change")?.[0]).toEqual([rows]);
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

describe("keyboard selection (Spec §5.7, GAP-047)", () => {
  it("Space toggles the focused row's selection when selectionMode is set", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "A" }],
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "multiple",
        selection: [],
      },
    });
    await wrapper.find("tbody [role=row]").trigger("keydown", { code: "Space" });
    expect(wrapper.emitted("selection-change")?.[0]).toEqual([[{ id: 1, name: "A" }]]);
  });

  it("Enter toggles the focused row's selection when selectionMode is set", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "A" }],
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "single",
      },
    });
    await wrapper.find("tbody [role=row]").trigger("keydown", { code: "Enter" });
    expect(wrapper.emitted("selection-change")?.[0]).toEqual([{ id: 1, name: "A" }]);
  });

  it("Ctrl+A selects all rows when selectionMode is multiple", async () => {
    const rows = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
    const wrapper = mount(UTable, {
      props: {
        value: rows,
        columns: [{ field: "name", header: "Name" }],
        selectionMode: "multiple",
      },
    });
    await wrapper.find("tbody [role=row]").trigger("keydown", { code: "KeyA", ctrlKey: true });
    expect(wrapper.emitted("selection-change")?.[0]).toEqual([rows]);
  });

  it("Ctrl+A does nothing when selectionMode is unset", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "A" }],
        columns: [{ field: "name", header: "Name" }],
      },
    });
    await wrapper.find("tbody [role=row]").trigger("keydown", { code: "KeyA", ctrlKey: true });
    expect(wrapper.emitted("selection-change")).toBeUndefined();
  });

  it("existing Arrow/Home/End keyboard navigation is unaffected by the new Space/Enter/Ctrl+A handling", async () => {
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

describe("filtering — custom mode, Vue (Spec §3.4.2: no executable registration path)", () => {
  it("a custom matchMode matches no rows, with no public prop able to change that outcome", () => {
    const wrapper = mount(UTable, {
      props: {
        value: [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ],
        columns: [{ field: "name", header: "Name" }],
        filters: { name: { value: "anything", matchMode: "custom" } },
      },
    });
    expect(wrapper.findAll("td").length).toBe(0);
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

describe("column body renderer (Spec: 2026-09-26-prime-parity-table-design.md §5.1)", () => {
  interface Row {
    id: number;
    name: string;
    price: number;
  }

  it("renders a column's body function output instead of the raw field value", async () => {
    const wrapper = mount(UTable, {
      props: {
        value: [{ id: 1, name: "Widget", price: 9.5 }],
        columns: [
          { field: "name", header: "Name" },
          { field: "price", header: "Price", body: (row: Row) => `$${row.price.toFixed(2)}` },
        ],
      },
    });
    const cells = wrapper.findAll("td");
    expect(cells[0].text()).toBe("Widget");
    expect(cells[1].text()).toBe("$9.50");
  });

  it("passes { field, rowIndex } as the body function's second argument", () => {
    const seen: { field: string; rowIndex: number }[] = [];
    mount(UTable, {
      props: {
        value: [
          { id: 1, name: "A", price: 1 },
          { id: 2, name: "B", price: 2 },
        ],
        columns: [
          {
            field: "name",
            header: "Name",
            body: (row: Row, options: { field: string; rowIndex: number }) => {
              seen.push(options);
              return row.name;
            },
          },
        ],
      },
    });
    expect(seen).toEqual([
      { field: "name", rowIndex: 0 },
      { field: "name", rowIndex: 1 },
    ]);
  });

  it("falls back to the raw field value when no body function is supplied", () => {
    const wrapper = mount(UTable, { props: { value: [{ id: 1, name: "Widget", price: 9.5 }], columns: [{ field: "price", header: "Price" }] } });
    expect(wrapper.find("td").text()).toBe("9.5");
  });
});
