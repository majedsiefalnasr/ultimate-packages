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
});
