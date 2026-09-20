import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UTag } from "./tag";

describe("UTag", () => {
  it("renders children", () => {
    render(<UTag>New</UTag>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("falls back to the value prop when no children are provided", () => {
    render(<UTag value="Hot" />);
    expect(screen.getByText("Hot")).toBeInTheDocument();
  });

  it("applies severity class", () => {
    const { container } = render(<UTag severity="danger">Alert</UTag>);
    expect(container.querySelector(".u-tag")?.className).toContain("u-tag-danger");
  });

  it("applies rounded class", () => {
    const { container } = render(<UTag rounded>Round</UTag>);
    expect(container.querySelector(".u-tag")?.className).toContain("u-tag-rounded");
  });

  it("renders an icon when provided", () => {
    render(<UTag icon={<i className="pi pi-check" />}>Done</UTag>);
    expect(document.querySelector(".pi-check")).toBeTruthy();
  });
});
