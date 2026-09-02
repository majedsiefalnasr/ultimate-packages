/// <reference types="@testing-library/jest-dom" />
import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { UPaginator } from "./paginator";

describe("UPaginator", () => {
  it("computes pageCount via uix-data's getPageCount (10 pages for 95 records / 10 rows)", () => {
    const { container } = render(
      <UPaginator first={0} rows={10} totalRecords={95} onPageChange={vi.fn()} />
    );
    expect(container.querySelector("nav")?.getAttribute("data-page-count")).toBe("10");
  });

  it("computes pageCount as 0 when rows is 0 (getPageCount's zero-guard)", () => {
    const { container } = render(
      <UPaginator first={0} rows={0} totalRecords={95} onPageChange={vi.fn()} />
    );
    expect(container.querySelector("nav")?.getAttribute("data-page-count")).toBe("0");
  });

  it("renders one button per page-link, matching the shared display algorithm", () => {
    const { container } = render(
      <UPaginator first={0} rows={10} totalRecords={30} pageLinkSize={5} onPageChange={vi.fn()} />
    );
    expect(container.querySelectorAll("[data-u-paginator-page]").length).toBe(3);
  });

  it("calls onPageChange with {page, first, rows, pageCount} when a page-link is clicked", () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <UPaginator first={0} rows={10} totalRecords={95} onPageChange={onPageChange} />
    );
    const pageButtons = container.querySelectorAll("[data-u-paginator-page]");
    (pageButtons[2] as HTMLButtonElement).click();
    expect(onPageChange).toHaveBeenCalledWith({ page: 2, first: 20, rows: 10, pageCount: 10 });
  });

  it("does NOT advance the UI when onPageChange doesn't update props (confirms no uncontrolled fallback)", () => {
    const { container, rerender } = render(
      <UPaginator first={0} rows={10} totalRecords={95} onPageChange={() => {}} />
    );
    const nextButton = container.querySelector("[data-u-paginator-next]") as HTMLButtonElement;
    nextButton.click();
    rerender(<UPaginator first={0} rows={10} totalRecords={95} onPageChange={() => {}} />);
    const pageButtons = container.querySelectorAll("[data-u-paginator-page]");
    expect(pageButtons[0].getAttribute("aria-current")).toBe("page");
  });

  it("disables first/prev on the first page and next/last on the last page", () => {
    const { container } = render(
      <UPaginator first={0} rows={10} totalRecords={95} onPageChange={vi.fn()} />
    );
    expect((container.querySelector("[data-u-paginator-first]") as HTMLButtonElement).disabled).toBe(true);
    expect((container.querySelector("[data-u-paginator-prev]") as HTMLButtonElement).disabled).toBe(true);
    expect((container.querySelector("[data-u-paginator-next]") as HTMLButtonElement).disabled).toBe(false);
  });
});
