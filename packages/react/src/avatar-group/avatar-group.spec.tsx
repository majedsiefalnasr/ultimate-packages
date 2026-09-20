import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UAvatar } from "../avatar";
import { UAvatarGroup } from "./avatar-group";

describe("UAvatarGroup", () => {
  it("renders its children", () => {
    render(
      <UAvatarGroup>
        <UAvatar label="A" />
        <UAvatar label="B" />
        <UAvatar label="C" />
      </UAvatarGroup>
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("renders as a group role element with the root class", () => {
    render(<UAvatarGroup />);
    expect(screen.getByRole("group")).toHaveClass("u-avatar-group");
  });
});
