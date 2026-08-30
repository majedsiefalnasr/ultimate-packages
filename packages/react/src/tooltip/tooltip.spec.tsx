import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UTooltip } from "./tooltip";

function Trigger({ tooltipContent }: { tooltipContent: string }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={ref}>Hover me</button>
      <UTooltip target={ref} content={tooltipContent} showDelay={0} hideDelay={0} />
    </>
  );
}

describe("UTooltip", () => {
  it("shows the tooltip on mouseenter of the target and hides it on mouseleave", async () => {
    render(<Trigger tooltipContent="Save changes" />);
    const target = screen.getByText("Hover me");
    expect(screen.queryByText("Save changes")).toBeNull();
    fireEvent.mouseEnter(target);
    await waitFor(() => expect(screen.getByText("Save changes")).toBeVisible());
    fireEvent.mouseLeave(target);
    await waitFor(() => expect(screen.queryByText("Save changes")).toBeNull());
  });

  it("renders role='tooltip' on the panel", async () => {
    render(<Trigger tooltipContent="Save changes" />);
    fireEvent.mouseEnter(screen.getByText("Hover me"));
    await waitFor(() => {
      const panel = screen.getByText("Save changes").closest('[role="tooltip"]');
      expect(panel).not.toBeNull();
    });
  });

  it("sets aria-describedby on the target while visible, pointing at the tooltip panel's id", async () => {
    render(<Trigger tooltipContent="Save changes" />);
    const target = screen.getByText("Hover me");
    fireEvent.mouseEnter(target);
    await waitFor(() => {
      const describedBy = target.getAttribute("aria-describedby");
      expect(describedBy).not.toBeNull();
      const panel = document.getElementById(describedBy!);
      expect(panel?.textContent).toContain("Save changes");
    });
  });

  it("removes only its own owned aria-describedby id on hide, preserving a pre-existing unrelated value", async () => {
    function TriggerWithExistingDescribedBy() {
      const ref = React.useRef<HTMLButtonElement>(null);
      React.useEffect(() => {
        ref.current?.setAttribute("aria-describedby", "unrelated-id");
      }, []);
      return (
        <>
          <button ref={ref}>Hover me</button>
          <div id="unrelated-id">Unrelated description</div>
          <UTooltip target={ref} content="Save changes" showDelay={0} hideDelay={0} />
        </>
      );
    }
    render(<TriggerWithExistingDescribedBy />);
    const target = screen.getByText("Hover me");
    fireEvent.mouseEnter(target);
    await waitFor(() => {
      expect(target.getAttribute("aria-describedby")).toContain("unrelated-id");
    });
    fireEvent.mouseLeave(target);
    await waitFor(() => {
      expect(target.getAttribute("aria-describedby")).toBe("unrelated-id");
    });
  });

  it("does not show when disabled", async () => {
    function DisabledTrigger() {
      const ref = React.useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={ref}>Hover me</button>
          <UTooltip target={ref} content="Save changes" disabled showDelay={0} />
        </>
      );
    }
    render(<DisabledTrigger />);
    fireEvent.mouseEnter(screen.getByText("Hover me"));
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.queryByText("Save changes")).toBeNull();
  });
});
