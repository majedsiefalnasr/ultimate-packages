import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
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

  describe("id generation (useId migration regression coverage)", () => {
    function TwoTriggers() {
      const refA = React.useRef<HTMLButtonElement>(null);
      const refB = React.useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={refA}>Hover A</button>
          <UTooltip target={refA} content="Tip A" showDelay={0} hideDelay={0} />
          <button ref={refB}>Hover B</button>
          <UTooltip target={refB} content="Tip B" showDelay={0} hideDelay={0} />
        </>
      );
    }

    it("generates different ids for two instances rendered in the same tree", async () => {
      render(<TwoTriggers />);
      fireEvent.mouseEnter(screen.getByText("Hover A"));
      fireEvent.mouseEnter(screen.getByText("Hover B"));
      await waitFor(() => {
        const panelA = screen.getByText("Tip A").closest('[role="tooltip"]') as HTMLElement;
        const panelB = screen.getByText("Tip B").closest('[role="tooltip"]') as HTMLElement;
        expect(panelA.id).toBeTruthy();
        expect(panelB.id).toBeTruthy();
        expect(panelA.id).not.toBe(panelB.id);
      });
    });

    it("keeps aria-describedby on the trigger in agreement with the panel's actual id", async () => {
      render(<Trigger tooltipContent="Save changes" />);
      const target = screen.getByText("Hover me");
      fireEvent.mouseEnter(target);
      await waitFor(() => {
        const describedBy = target.getAttribute("aria-describedby");
        expect(describedBy).toBeTruthy();
        const panel = screen.getByText("Save changes").closest('[role="tooltip"]') as HTMLElement;
        expect(describedBy).toBe(panel.id);
      });
    });

    // jsdom-level check only: this proves a single test run's two separate render() calls
    // don't retain and reuse a prior render's id (the actual defect module-scope counters
    // had). It is NOT proof of cross-request SSR determinism — that is Track E's own Task 8.
    it("does not reuse the same generated id across separate renders", async () => {
      const first = render(<Trigger tooltipContent="Save changes" />);
      fireEvent.mouseEnter(screen.getByText("Hover me"));
      let firstId = "";
      await waitFor(() => {
        firstId = (screen.getByText("Save changes").closest('[role="tooltip"]') as HTMLElement).id;
        expect(firstId).toBeTruthy();
      });
      cleanup();

      render(<Trigger tooltipContent="Save changes" />);
      fireEvent.mouseEnter(screen.getByText("Hover me"));
      await waitFor(() => {
        const secondId = (
          screen.getByText("Save changes").closest('[role="tooltip"]') as HTMLElement
        ).id;
        expect(secondId).not.toBe(firstId);
      });
      first.unmount();
    });

    it("uses an explicit id prop verbatim instead of a generated one", async () => {
      function TriggerWithId() {
        const ref = React.useRef<HTMLButtonElement>(null);
        return (
          <>
            <button ref={ref}>Hover me</button>
            <UTooltip
              target={ref}
              content="Save changes"
              showDelay={0}
              hideDelay={0}
              id="custom-tooltip-id"
            />
          </>
        );
      }
      render(<TriggerWithId />);
      fireEvent.mouseEnter(screen.getByText("Hover me"));
      await waitFor(() => {
        const panel = screen.getByText("Save changes").closest('[role="tooltip"]') as HTMLElement;
        expect(panel.id).toBe("custom-tooltip-id");
      });
    });
  });
});
