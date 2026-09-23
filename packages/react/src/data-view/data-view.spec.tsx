import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import { UDataView, type UDataViewProps } from "./data-view";

const items = [
  { name: "Apple", score: 3 },
  { name: "Banana", score: 1 },
  { name: "Cherry", score: 2 },
];
const itemTemplate = (item: (typeof items)[number], layout: "list" | "grid") => (
  <span>
    {layout}:{item.name}
  </span>
);

describe("UDataView", () => {
  it("switches real list/grid branches", () => {
    const { container, rerender } = render(<UDataView value={items} itemTemplate={itemTemplate} />);
    expect(container.querySelector(".u-data-view-list")).not.toBeNull();
    rerender(<UDataView value={items} itemTemplate={itemTemplate} layout="grid" />);
    expect(container.querySelector(".u-data-view-list")).toBeNull();
    expect(screen.getByText("grid:Apple")).toBeInTheDocument();
  });

  it("updates the rendered page when its parent accepts the page-change event", () => {
    const ControlledPagingHarness = () => {
      const [first, setFirst] = React.useState(0);

      return (
        <UDataView
          value={items}
          itemTemplate={itemTemplate}
          paginator
          rows={2}
          first={first}
          onPageChange={(event) => setFirst(event.first)}
        />
      );
    };

    render(<ControlledPagingHarness />);
    expect(screen.queryByText("list:Cherry")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
    expect(screen.queryByText("list:Apple")).toBeNull();
    expect(screen.getByText("list:Cherry")).toBeInTheDocument();
  });

  it("does not change the rendered page when its parent ignores the page-change event", () => {
    const onPageChange = vi.fn();
    render(
      <UDataView
        value={items}
        itemTemplate={itemTemplate}
        paginator
        rows={2}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Next Page" }));

    expect(onPageChange).toHaveBeenCalledOnce();
    expect(screen.getByText("list:Apple")).toBeInTheDocument();
    expect(screen.queryByText("list:Cherry")).toBeNull();
  });

  it("responds to sorting state changes before paging without mutating input", () => {
    const { container, rerender } = render(
      <UDataView value={items} itemTemplate={itemTemplate} paginator rows={2} />
    );
    expect(
      Array.from(container.querySelectorAll(".u-data-view-list > li"), (node) => node.textContent)
    ).toEqual(["list:Apple", "list:Banana"]);
    rerender(
      <UDataView
        value={items}
        itemTemplate={itemTemplate}
        sortField="score"
        sortOrder={-1}
        paginator
        rows={2}
      />
    );
    expect(
      Array.from(container.querySelectorAll(".u-data-view-list > li"), (node) => node.textContent)
    ).toEqual(["list:Apple", "list:Cherry"]);
    expect(items.map((item) => item.score)).toEqual([3, 1, 2]);
  });

  it("has no filtering API or behavior when filter-shaped values are supplied through an untyped spread", () => {
    expectTypeOf<
      Extract<keyof UDataViewProps, "filter" | "filterBy" | "filterMatchMode" | "filterLocale">
    >().toEqualTypeOf<never>();
    const untypedFilterProps: Record<string, unknown> = {
      filter: "Apple",
      filterBy: "name",
      filterMatchMode: "contains",
    };
    render(<UDataView {...untypedFilterProps} value={items} itemTemplate={itemTemplate} />);
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("keeps server pages intact in lazy mode and emits requests", () => {
    const onLazyLoad = vi.fn();
    render(
      <UDataView
        value={items}
        itemTemplate={itemTemplate}
        lazy
        paginator
        first={20}
        rows={2}
        totalRecords={100}
        onLazyLoad={onLazyLoad}
      />
    );
    expect(screen.getByText("list:Apple")).toBeInTheDocument();
    expect(onLazyLoad).toHaveBeenCalledWith({
      first: 20,
      rows: 2,
      sortField: undefined,
      sortOrder: 1,
    });
  });

  it("shows loading, empty state, and rows-per-page controls", () => {
    const ControlledRowsHarness = () => {
      const [rows, setRows] = React.useState(2);

      return (
        <UDataView
          value={[]}
          itemTemplate={itemTemplate}
          loading
          paginator
          rows={rows}
          rowsPerPageOptions={[2, 5]}
          onPageChange={(event) => setRows(event.rows)}
        />
      );
    };

    render(<ControlledRowsHarness />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("No results found")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "5" } });
    expect(screen.getByLabelText("Rows per page")).toHaveValue("5");
  });

  it("hides all paginator UI for a one-page view when alwaysShowPaginator is false", () => {
    const { rerender } = render(
      <UDataView
        value={items}
        itemTemplate={itemTemplate}
        paginator
        rows={3}
        rowsPerPageOptions={[3, 5]}
        alwaysShowPaginator={false}
      />
    );

    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.queryByLabelText("Rows per page")).toBeNull();
    expect(screen.queryByText("1 to 3 of 3")).toBeNull();

    rerender(
      <UDataView
        value={items}
        itemTemplate={itemTemplate}
        paginator
        rows={3}
        rowsPerPageOptions={[3, 5]}
        alwaysShowPaginator
      />
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByLabelText("Rows per page")).toBeInTheDocument();
    expect(screen.getByText("1 to 3 of 3")).toBeInTheDocument();
  });

  it("renders paginator placements and the current-page report", () => {
    const { rerender } = render(
      <UDataView
        value={items}
        itemTemplate={itemTemplate}
        paginator
        rows={2}
        paginatorPosition="top"
      />
    );
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
    expect(screen.getByText("1 to 2 of 3")).toBeInTheDocument();

    rerender(
      <UDataView
        value={items}
        itemTemplate={itemTemplate}
        paginator
        rows={2}
        paginatorPosition="both"
      />
    );
    expect(screen.getAllByRole("navigation")).toHaveLength(2);
  });

  it("gives the grid empty message listitem semantics", () => {
    render(<UDataView value={[]} itemTemplate={itemTemplate} layout="grid" />);
    expect(screen.getByRole("list")).toHaveTextContent("No results found");
    expect(screen.getByRole("listitem")).toHaveTextContent("No results found");
  });
});
