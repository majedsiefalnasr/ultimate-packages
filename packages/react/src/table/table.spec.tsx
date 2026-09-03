/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { UTable } from "./table";

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
});
