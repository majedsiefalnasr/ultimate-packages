import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UAvatar } from "../avatar/avatar";
import { UAvatarGroup } from "./avatar-group";

describe("UAvatarGroup", () => {
  it("renders a group wrapper with its avatars", () => {
    render(
      <UAvatarGroup>
        <UAvatar label="A" />
        <UAvatar label="B" />
      </UAvatarGroup>
    );
    const group = screen.getByRole("group");
    expect(group).toHaveClass("u-avatar-group");
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("merges className and rest attributes onto the root", () => {
    render(
      <UAvatarGroup className="custom" data-testid="g">
        <UAvatar label="A" />
      </UAvatarGroup>
    );
    expect(screen.getByTestId("g")).toHaveClass("u-avatar-group", "custom");
  });

  it("applies pt attributes to the root", () => {
    render(
      <UAvatarGroup pt={{ root: { "data-pt": "1" } }}>
        <UAvatar label="A" />
      </UAvatarGroup>
    );
    expect(screen.getByRole("group")).toHaveAttribute("data-pt", "1");
  });

  it("renders without Ultimate classes when unstyled", () => {
    render(
      <UAvatarGroup unstyled>
        <UAvatar label="A" />
      </UAvatarGroup>
    );
    expect(screen.getByRole("group")).not.toHaveClass("u-avatar-group");
  });
});
