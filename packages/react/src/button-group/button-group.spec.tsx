import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UButton } from "../button";
import { UButtonGroup } from "./button-group";

describe("UButtonGroup", () => {
  it("renders its projected buttons", () => {
    render(
      <UButtonGroup>
        <UButton label="One" />
        <UButton label="Two" />
        <UButton label="Three" />
      </UButtonGroup>
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("renders as a group role element with the root class", () => {
    render(<UButtonGroup />);
    expect(screen.getByRole("group")).toHaveClass("u-button-group");
  });
});
