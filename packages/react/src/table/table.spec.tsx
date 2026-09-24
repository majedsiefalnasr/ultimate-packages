/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { UTable } from "./table";
import { UTable as SubpathExport } from "./index";
import * as PaginatorModule from "../paginator/paginator";
import * as ScrollerModule from "../scroller/scroller";

interface Row {
  id: number;
  name: string;
}

describe("UTable", () => {
  it("renders one row per value entry with role=row and a columnheader per column", () => {
    const { container } = render(
      <UTable<Row>
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
      />
    );
    expect(container.querySelectorAll('[role="row"]').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('[role="columnheader"]')?.textContent).toBe("Name");
  });

  it("root has role=table", () => {
    const { container } = render(<UTable<Row> value={[]} columns={[]} />);
    expect(container.querySelector('[role="table"]')).not.toBeNull();
  });
});

describe("sorting", () => {
  it("renders rows pre-sorted by sortField/sortOrder without mutating the value prop", () => {
    const original = [
      { id: 2, name: "Bob" },
      { id: 1, name: "Alice" },
    ];
    const { container } = render(
      <UTable<Row>
        value={original}
        columns={[{ field: "name", header: "Name" }]}
        sortField="name"
        sortOrder={1}
        onSort={vi.fn()}
      />
    );
    const cells = container.querySelectorAll("td");
    expect(cells[0].textContent).toBe("Alice");
    expect(original[0].name).toBe("Bob");
  });

  it("sets aria-sort on the active sortField's columnheader and calls onSort when clicked", () => {
    const onSort = vi.fn();
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }]}
        columns={[{ field: "name", header: "Name" }]}
        sortField="name"
        sortOrder={-1}
        onSort={onSort}
      />
    );
    const header = container.querySelector('[role="columnheader"]') as HTMLElement;
    expect(header.getAttribute("aria-sort")).toBe("descending");
    header.click();
    expect(onSort).toHaveBeenCalled();
  });
});

describe("filtering (React object+constraints operator shape, spec §9)", () => {
  it("applies a simple FilterMetadata filter", () => {
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "ali", matchMode: "contains" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);
  });

  it("applies an operator+constraints filter with 'and' semantics", () => {
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }, { id: 2, name: "Alison" }]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{
          name: {
            operator: "and",
            constraints: [
              { value: "ali", matchMode: "contains" },
              { value: "son", matchMode: "contains" },
            ],
          },
        }}
      />
    );
    const cells = container.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent).toBe("Alison");
  });

  it("accepts onFilter as a prop without error (interface-contract completeness; not yet invoked — see prop doc comment)", () => {
    const onFilter = vi.fn();
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "ali", matchMode: "contains" } }}
        onFilter={onFilter}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);
    expect(onFilter).not.toHaveBeenCalled();
  });
});

describe("selection", () => {
  it("calls onSelectionChange with the clicked row in single mode", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }]}
        dataKey="id"
        columns={[{ field: "name", header: "Name" }]}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
      />
    );
    (container.querySelector('tbody [role="row"]') as HTMLElement).click();
    expect(onSelectionChange).toHaveBeenCalledWith({ id: 1, name: "Alice" });
  });
});

describe("keyboard navigation", () => {
  it("ArrowDown on a row moves focus to the next row", () => {
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]}
        columns={[{ field: "name", header: "Name" }]}
      />
    );
    const rows = container.querySelectorAll('tbody [role="row"]');
    (rows[0] as HTMLElement).focus();
    (rows[0] as HTMLElement).dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
    );
    expect(document.activeElement).toBe(rows[1]);
  });
});

describe("Paginator composition (real UPaginator, not a mock)", () => {
  it("renders a real UPaginator child and slices rows to the current page", () => {
    const rowsData = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const { container } = render(
      <UTable<Row>
        value={rowsData}
        columns={[{ field: "name", header: "Name" }]}
        paginator
        first={0}
        rows={10}
        totalRecords={25}
        onPage={vi.fn()}
      />
    );
    expect(container.querySelector("nav")).not.toBeNull();
    expect(container.querySelectorAll("tbody td").length).toBe(10);
  });
});

describe("Scroller composition (real UScroller content-template mechanism, not a mock)", () => {
  // UScroller's mount effect constructs a ResizeObserver unconditionally and
  // jsdom does not implement one; this mirrors the established
  // ResizeObserver-callback-capture / mockViewportHeight convention from
  // packages/react/src/scroller/scroller.spec.tsx exactly, needed here
  // because the real windowed (non-disabled) path renders zero rows at the
  // default zero-height jsdom viewport (offsetHeight=0 -> numItemsInViewport
  // = 0 -> last = 0 -> empty visibleItems), matching the same fix Angular's
  // Task 9 test round required (packages/ng/src/table/table.spec.ts:264).
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
    cleanup();
  });

  function mockViewportHeight(element: HTMLElement, height: number): void {
    Object.defineProperty(element, "offsetHeight", { value: height, configurable: true });
  }

  it("renders a real UScroller child with real table/tbody/tr/td markup via contentTemplate when virtualScrollerOptions is provided", () => {
    const rowsData = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const { container } = render(
      <UTable<Row>
        value={rowsData}
        columns={[{ field: "name", header: "Name" }]}
        virtualScrollerOptions={{ itemSize: 30 }}
      />
    );
    // Real windowing requires a measured viewport: mock ResizeObserver's
    // captured callback (never construct a second observer) and
    // offsetHeight, matching the established convention.
    const scrollerRoot = container.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(scrollerRoot, 200);
    act(() => {
      resizeObserverCallback?.(
        [{ target: scrollerRoot } as unknown as ResizeObserverEntry],
        {} as unknown as ResizeObserver
      );
    });
    const table = container.querySelector("table[data-u-table-virtual-body]");
    expect(table).not.toBeNull();
    const tbody = table!.querySelector("tbody");
    expect(tbody?.parentElement).toBe(table);
    const trs = tbody!.querySelectorAll(":scope > tr");
    expect(trs.length).toBeGreaterThan(0);
    expect(trs.length).toBeLessThan(200);
    trs.forEach((tr) => expect(tr.querySelector(":scope > td")).not.toBeNull());
    expect(container.querySelectorAll("[data-u-scroller-item]").length).toBe(0);
  });

  it("applies a top offset to each row using the real absolute index (positioning is not free from UScroller's content wrapper)", () => {
    const rowsData = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const { container } = render(
      <UTable<Row>
        value={rowsData}
        columns={[{ field: "name", header: "Name" }]}
        virtualScrollerOptions={{ itemSize: 30 }}
      />
    );
    const scrollerRoot = container.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(scrollerRoot, 200);
    act(() => {
      resizeObserverCallback?.(
        [{ target: scrollerRoot } as unknown as ResizeObserverEntry],
        {} as unknown as ResizeObserver
      );
    });
    // Scroll so the window starts partway through the list, then confirm
    // rendered rows are positioned at their real absolute index * itemSize,
    // not stacked at 0 regardless of scroll offset.
    Object.defineProperty(scrollerRoot, "scrollTop", { value: 3000, writable: true, configurable: true });
    act(() => {
      scrollerRoot.dispatchEvent(new Event("scroll"));
    });
    const table = container.querySelector("table[data-u-table-virtual-body]");
    const firstRow = table!.querySelector("tbody > tr") as HTMLElement;
    expect(firstRow.style.position).toBe("absolute");
    // first = floor(3000/30) = 100 -> top = 100 * 30 = 3000px
    expect(firstRow.style.top).toBe("3000px");
  });

  it("clicking a virtualized row calls onSelectionChange with the clicked row (single mode)", () => {
    const rowsData = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const onSelectionChange = vi.fn();
    const { container } = render(
      <UTable<Row>
        value={rowsData}
        dataKey="id"
        columns={[{ field: "name", header: "Name" }]}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
        virtualScrollerOptions={{ itemSize: 30 }}
      />
    );
    const scrollerRoot = container.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(scrollerRoot, 200);
    act(() => {
      resizeObserverCallback?.(
        [{ target: scrollerRoot } as unknown as ResizeObserverEntry],
        {} as unknown as ResizeObserver
      );
    });
    const firstRow = container.querySelector(
      'table[data-u-table-virtual-body] tbody [role="row"]'
    ) as HTMLElement;
    firstRow.click();
    expect(onSelectionChange).toHaveBeenCalledWith(rowsData[0]);
  });

  it("ArrowDown on a virtualized row moves focus to the next row within the rendered window", () => {
    const rowsData = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Row ${i}` }));
    const { container } = render(
      <UTable<Row>
        value={rowsData}
        columns={[{ field: "name", header: "Name" }]}
        virtualScrollerOptions={{ itemSize: 30 }}
      />
    );
    const scrollerRoot = container.querySelector("[class*=u-scroller]") as HTMLElement;
    mockViewportHeight(scrollerRoot, 200);
    act(() => {
      resizeObserverCallback?.(
        [{ target: scrollerRoot } as unknown as ResizeObserverEntry],
        {} as unknown as ResizeObserver
      );
    });
    const renderedRows = container.querySelectorAll(
      'table[data-u-table-virtual-body] tbody [role="row"]'
    );
    expect(renderedRows.length).toBeGreaterThan(1);
    (renderedRows[0] as HTMLElement).focus();
    (renderedRows[0] as HTMLElement).dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
    );
    expect(document.activeElement).toBe(renderedRows[1]);
  });
});

describe("row editing (controlled editingRows, spec §11.2)", () => {
  it("calls onRowEditChange with the computed next editingRows when row edit is initiated", () => {
    const onRowEditChange = vi.fn();
    const { container } = render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }]}
        dataKey="id"
        columns={[{ field: "name", header: "Name" }]}
        editMode="row"
        editingRows={{}}
        onRowEditChange={onRowEditChange}
      />
    );
    (container.querySelector("[data-u-table-row-edit-init]") as HTMLElement).click();
    expect(onRowEditChange).toHaveBeenCalledWith({ "1": true });
  });
});

describe("row grouping (SortMeta-reuse convention, spec §13)", () => {
  it("groups adjacent rows sharing the same groupRowsBy value under subheader mode", () => {
    const { container } = render(
      <UTable<{ group: string; name: string }>
        value={[
          { group: "a", name: "Alice" },
          { group: "a", name: "Amy" },
          { group: "b", name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        rowGroupMode="subheader"
        groupRowsBy="group"
      />
    );
    expect(container.querySelectorAll("[data-u-table-group-header]").length).toBe(2);
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

  afterEach(cleanup);

  it("applies matchMode: notContains, case-insensitively", () => {
    const { container } = render(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "ALI", matchMode: "notContains" } }}
      />
    );
    const cells = container.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Bob");
  });

  it("applies matchMode: endsWith, case-insensitively", () => {
    const { container } = render(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "CE", matchMode: "endsWith" } }}
      />
    );
    const cells = container.querySelectorAll("td");
    expect(cells.length).toBe(1);
    expect(cells[0].textContent?.trim()).toBe("Alice");
  });

  it("applies matchMode: notEquals, and an absent OR empty-string filter value matches (React's verified real default — the opposite of Angular/Vue)", () => {
    const { container, rerender } = render(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "Alice", matchMode: "notEquals" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    // Real PrimeReact FilterService.js's own notEquals: filter === undefined
    // || filter === null || (typeof filter === 'string' && filter.trim() ===
    // '') => true (matches everything). Both undefined and '' hit this branch.
    rerender(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: undefined, matchMode: "notEquals" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);

    rerender(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "", matchMode: "notEquals" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);
  });

  it("applies matchMode: lt/lte/gt/gte", () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const { container, rerender } = render(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: 20, matchMode: "lt" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: 20, matchMode: "lte" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: 20, matchMode: "gt" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: 20, matchMode: "gte" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);
  });

  it("lt passes through (matches everything) when the filter value itself is absent", () => {
    const { container } = render(
      <UTable
        value={[
          { id: 1, score: 10 },
          { id: 2, score: 20 },
          { id: 3, score: 30 },
        ]}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: undefined, matchMode: "lt" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(3);
  });

  it("applies matchMode: between, inclusive bounds, inverted range matches nothing, null bound passes through", () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const { container, rerender } = render(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [10, 20], matchMode: "between" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [30, 10], matchMode: "between" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(0);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [null, null], matchMode: "between" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(3);
  });

  it("applies matchMode: in/notIn using equals-based membership, including a null filter-array entry; empty array passes through", () => {
    const rows: NumRow[] = [
      { id: 1, score: 10 },
      { id: 2, score: 20 },
      { id: 3, score: 30 },
    ];
    const { container, rerender } = render(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [10, 30, null], matchMode: "in" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [10, 30, null], matchMode: "notIn" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: [], matchMode: "in" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(3);
  });

  it("applies date matchModes: dateIs/dateIsNot (day-level) and dateBefore/dateAfter (time-precise), no string coercion", () => {
    const rows: DateRow[] = [
      { id: 1, when: new Date(2026, 0, 1, 9, 0) },
      { id: 2, when: new Date(2026, 0, 1, 15, 0) },
      { id: 3, when: new Date(2026, 0, 2, 9, 0) },
    ];
    const { container, rerender } = render(
      <UTable
        value={rows}
        columns={[{ field: "when", header: "When" }]}
        filters={{ when: { value: new Date(2026, 0, 1), matchMode: "dateIs" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "when", header: "When" }]}
        filters={{ when: { value: new Date(2026, 0, 1), matchMode: "dateIsNot" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "when", header: "When" }]}
        filters={{ when: { value: new Date(2026, 0, 1, 12, 0), matchMode: "dateBefore" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);

    rerender(
      <UTable
        value={rows}
        columns={[{ field: "when", header: "When" }]}
        filters={{ when: { value: new Date(2026, 0, 1, 12, 0), matchMode: "dateAfter" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);
  });

  it("a row with an undefined field value fails gt once a real filter value is present", () => {
    const { container } = render(
      <UTable
        value={[{ id: 1 }, { id: 2, score: 20 }] as (Partial<NumRow> & { id: number })[]}
        columns={[{ field: "score", header: "Score" }]}
        filters={{ score: { value: 10, matchMode: "gt" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(1);
  });

  it("a whitespace-only string filter value on notEquals matches everything (React's verified real default)", () => {
    const { container } = render(
      <UTable
        value={[
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ]}
        columns={[{ field: "name", header: "Name" }]}
        filters={{ name: { value: "   ", matchMode: "notEquals" } }}
      />
    );
    expect(container.querySelectorAll("td").length).toBe(2);
  });
});

describe("package export", () => {
  it("is exported from its own subpath index", () => {
    expect(SubpathExport).toBe(UTable);
  });
});

describe("real child-component composition (regression guard, Task 24)", () => {
  it("actually invokes the real UPaginator function during render (spy-based runtime proof)", () => {
    const paginatorSpy = vi.spyOn(PaginatorModule, "UPaginator");
    render(
      <UTable<Row>
        value={[{ id: 1, name: "Alice" }]}
        columns={[{ field: "name", header: "Name" }]}
        paginator
        rows={10}
        totalRecords={1}
        onPage={vi.fn()}
      />
    );
    expect(paginatorSpy).toHaveBeenCalled();
  });

  it("actually invokes the real UScroller function during render when virtualScroll is used (spy-based runtime proof)", () => {
    // UScroller's mount effect constructs a ResizeObserver unconditionally and
    // jsdom does not implement one; stub it exactly like the established
    // Scroller-composition describe block above in this same file, since
    // this test also mounts the real (non-mocked) UScroller.
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      }
    );
    try {
      // UScroller is React.forwardRef(...), an object of shape { $$typeof, render },
      // not a plain function — vi.spyOn can't wrap the export itself ("cannot spy
      // on a non-function value"). React actually calls its inner .render during
      // render, so spy on that instead; this still proves the real component ran.
      // @types/react's ForwardRefExoticComponent type doesn't declare `render`
      // (it's a runtime-only field), so cast through a minimal shape to spy on it.
      const scrollerAsRenderable = ScrollerModule.UScroller as unknown as {
        render: (...args: unknown[]) => unknown;
      };
      const scrollerSpy = vi.spyOn(scrollerAsRenderable, "render");
      const rowsData = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `Row ${i}` }));
      render(
        <UTable<Row>
          value={rowsData}
          columns={[{ field: "name", header: "Name" }]}
          virtualScrollerOptions={{ itemSize: 30 }}
        />
      );
      expect(scrollerSpy).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
