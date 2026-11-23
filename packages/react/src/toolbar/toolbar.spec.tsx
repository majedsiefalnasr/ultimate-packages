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

  it("applies a consumer style to the root", () => {
    render(<UToolbar style={{ background: "rgb(1, 2, 3)" }} />);
    expect(screen.getByRole("toolbar")).toHaveStyle({ background: "rgb(1, 2, 3)" });
  });

  it("passes id and other native attributes to the root", () => {
    render(<UToolbar id="main-toolbar" data-test="x" />);
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("id", "main-toolbar");
    expect(toolbar).toHaveAttribute("data-test", "x");
  });

  it("accepts a function for start, center and end and passes it the props", () => {
    const { container } = render(
      <UToolbar
        ariaLabelledBy="heading"
        start={(props) => `start:${props.ariaLabelledBy}`}
        center={() => "Center"}
        end={() => <b>End</b>}
      />
    );
    expect(container.querySelector(".u-toolbar-start")?.textContent).toBe("start:heading");
    expect(container.querySelector(".u-toolbar-center")?.textContent).toBe("Center");
    expect(container.querySelector(".u-toolbar-end b")?.textContent).toBe("End");
  });

  it("pt reaches the root and each region", () => {
    const { container } = render(
      <UToolbar
        start="S"
        center="C"
        end="E"
        pt={{
          root: { "data-test": "root", className: "custom" },
          start: { "data-test": "start" },
          center: { "data-test": "center" },
          end: { "data-test": "end" },
        }}
      />
    );
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("data-test", "root");
    expect(toolbar).toHaveClass("custom");
    expect(toolbar).toHaveClass("u-toolbar");
    for (const region of ["start", "center", "end"]) {
      expect(container.querySelector(`.u-toolbar-${region}`)).toHaveAttribute("data-test", region);
    }
  });

  it("unstyled drops the Ultimate classes", () => {
    const { container } = render(<UToolbar unstyled start="S" />);
    expect(screen.getByRole("toolbar")).not.toHaveClass("u-toolbar");
    expect(container.querySelector(".u-toolbar-start")).toBeNull();
  });
});
