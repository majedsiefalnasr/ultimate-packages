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

// F15 pilot: per-instance `unstyled` (PrimeReact 10.9.9 `isUnstyled`/`cx`).
// PrimeReact has no per-instance `dt`, so UTag has none.
describe("UTag — per-instance unstyled (F15 pilot)", () => {
  it("renders no Ultimate classes when unstyled", () => {
    const { container } = render(
      <UTag unstyled severity="danger" rounded icon={<i className="pi pi-check" />}>
        Plain
      </UTag>
    );
    expect(screen.getByText("Plain")).toBeInTheDocument();
    expect(container.querySelector("[class*='u-tag']")).toBeNull();
    expect(container.firstElementChild?.getAttribute("class") ?? "").toBe("");
  });

  it("still passes className through when unstyled", () => {
    const { container } = render(
      <UTag unstyled className="mine">
        Plain
      </UTag>
    );
    expect(container.firstElementChild?.className).toBe("mine");
  });

  it("keeps the classes when unstyled is false", () => {
    const { container } = render(<UTag unstyled={false}>Styled</UTag>);
    expect(container.querySelector(".u-tag")).not.toBeNull();
  });
});
