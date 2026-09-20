import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UToolbar } from "./toolbar";

describe("UToolbar", () => {
  it("has role=toolbar", () => {
    render(<UToolbar />);
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  it("renders default children", () => {
    render(<UToolbar>Plain content</UToolbar>);
    expect(screen.getByText("Plain content")).toBeInTheDocument();
  });

  it("renders start/center/end content", () => {
    const { container } = render(<UToolbar start="Start" center="Center" end="End" />);
    expect(container.querySelector(".u-toolbar-start")?.textContent).toBe("Start");
    expect(container.querySelector(".u-toolbar-center")?.textContent).toBe("Center");
    expect(container.querySelector(".u-toolbar-end")?.textContent).toBe("End");
  });

  it("does not render an end wrapper when end is not provided", () => {
    const { container } = render(<UToolbar start="Start" />);
    expect(container.querySelector(".u-toolbar-end")).toBeFalsy();
  });

  it("sets aria-labelledby when provided", () => {
    render(<UToolbar ariaLabelledBy="actions-heading" />);
    expect(screen.getByRole("toolbar").getAttribute("aria-labelledby")).toBe("actions-heading");
  });
});
