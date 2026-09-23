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

  it("updates the rendered page through UPaginator and synchronizes an external first change", () => {
    const { rerender } = render(
      <UDataView value={items} itemTemplate={itemTemplate} paginator rows={2} first={0} />
    );
    expect(screen.queryByText("list:Cherry")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Next Page" }));
    expect(screen.queryByText("list:Apple")).toBeNull();
    expect(screen.getByText("list:Cherry")).toBeInTheDocument();
    rerender(<UDataView value={items} itemTemplate={itemTemplate} paginator rows={2} first={1} />);
    expect(screen.getByText("list:Banana")).toBeInTheDocument();
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

  it("has no filtering API and renders no filter controls", () => {
    expectTypeOf<
      Extract<keyof UDataViewProps, "filter" | "filterBy" | "filterMatchMode" | "filterLocale">
    >().toEqualTypeOf<never>();
    render(<UDataView value={items} itemTemplate={itemTemplate} />);
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
    render(
      <UDataView
        value={[]}
        itemTemplate={itemTemplate}
        loading
        paginator
        rows={2}
        rowsPerPageOptions={[2, 5]}
      />
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("No results found")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "5" } });
    expect(screen.getByLabelText("Rows per page")).toHaveValue("5");
  });
});
