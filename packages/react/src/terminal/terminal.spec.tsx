import * as React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { UTerminal } from "./terminal";
import { terminalEventBus } from "./terminal-event-bus";

describe("UTerminal", () => {
  afterEach(() => {
    terminalEventBus.emit("clear");
  });

  it("renders the welcome message when provided", () => {
    render(<UTerminal welcomeMessage="Welcome!" />);
    expect(screen.getByText("Welcome!")).toBeInTheDocument();
  });

  it("submits a command on Enter, echoes it, and clears the input", () => {
    const { container } = render(<UTerminal />);
    const input = container.querySelector(".u-terminal-command-text") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "help" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(container.querySelector(".u-terminal-command")?.textContent).toContain("help");
    expect(input.value).toBe("");
  });

  it("does not submit an empty command", () => {
    const { container } = render(<UTerminal />);
    const input = container.querySelector(".u-terminal-command-text") as HTMLInputElement;
    fireEvent.keyDown(input, { key: "Enter" });
    expect(container.querySelectorAll(".u-terminal-command").length).toBe(0);
  });

  it("emits a command event on the shared terminalEventBus", () => {
    const { container } = render(<UTerminal />);
    const input = container.querySelector(".u-terminal-command-text") as HTMLInputElement;
    const received: string[] = [];
    terminalEventBus.on("command", (cmd: unknown) => received.push(cmd as string));
    fireEvent.change(input, { target: { value: "ls" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(received).toEqual(["ls"]);
  });

  it("renders a response published via terminalEventBus against the most recent command", () => {
    const { container } = render(<UTerminal />);
    const input = container.querySelector(".u-terminal-command-text") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ls" } });
    fireEvent.keyDown(input, { key: "Enter" });
    act(() => {
      terminalEventBus.emit("response", "file1.txt file2.txt");
    });
    expect(container.querySelector(".u-terminal-response")?.textContent).toBe(
      "file1.txt file2.txt"
    );
  });

  it("recalls the previous command on ArrowUp", () => {
    const { container } = render(<UTerminal />);
    const input = container.querySelector(".u-terminal-command-text") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ls" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.value).toBe("ls");
  });
});
