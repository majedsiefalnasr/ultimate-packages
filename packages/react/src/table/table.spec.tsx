/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
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
