import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { reactCoreStyleSheet } from "@ultimate/react-core";
import { UButton } from "./button";

describe("GAP-124 React scope (D-124-5)", () => {
  beforeEach(() => {
    reactCoreStyleSheet.clear();
    document.head.querySelectorAll("style").forEach((el) => el.remove());
  });

  it("a loading UButton registers no u-icon-spin rule in React", () => {
    const { container } = render(<UButton loading label="Save" />);
    expect(container.querySelector("svg.u-icon-spin")).not.toBeNull();
    expect(reactCoreStyleSheet.has("u-icon-spin")).toBe(false);
    expect(
      Array.from(document.head.querySelectorAll("style")).some((s) =>
        (s.textContent ?? "").includes("@keyframes u-icon-spin")
      )
    ).toBe(false);
  });
});
