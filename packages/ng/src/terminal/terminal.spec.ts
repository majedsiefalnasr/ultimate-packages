import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";
import { UTerminalService } from "@ultimate/ng-core";
import { UTerminal } from "./terminal";

describe("UTerminal", () => {
  it("renders the welcome message when provided", () => {
    @Component({
      standalone: true,
      imports: [UTerminal],
      template: `<u-terminal welcomeMessage="Welcome!"></u-terminal>`,
    })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".u-terminal-welcome-message")?.textContent).toBe(
      "Welcome!"
    );
  });

  it("submits a command on Enter and echoes it in the command list", () => {
    @Component({ standalone: true, imports: [UTerminal], template: `<u-terminal></u-terminal>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-terminal-prompt-value");
    input.value = "help";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    fixture.detectChanges();

    const commandValue = fixture.nativeElement.querySelector(".u-terminal-command-value");
    expect(commandValue?.textContent).toBe("help");
    expect(input.value).toBe("");
  });

  it("does not submit an empty command", () => {
    @Component({ standalone: true, imports: [UTerminal], template: `<u-terminal></u-terminal>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-terminal-prompt-value");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll(".u-terminal-command").length).toBe(0);
  });

  it("renders a response published via UTerminalService against the most recent command", () => {
    @Component({ standalone: true, imports: [UTerminal], template: `<u-terminal></u-terminal>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-terminal-prompt-value");
    input.value = "ls";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    fixture.detectChanges();

    const service = TestBed.inject(UTerminalService);
    service.sendResponse("file1.txt file2.txt");
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".u-terminal-command-response")?.textContent).toBe(
      "file1.txt file2.txt"
    );
  });

  it("focuses the input when the terminal is clicked", () => {
    @Component({ standalone: true, imports: [UTerminal], template: `<u-terminal></u-terminal>` })
    class HostComponent {}
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    const root: HTMLElement = fixture.nativeElement.querySelector(".u-terminal");
    const input: HTMLInputElement = fixture.nativeElement.querySelector(".u-terminal-prompt-value");
    root.click();
    expect(document.activeElement).toBe(input);
    fixture.nativeElement.remove();
  });
});
