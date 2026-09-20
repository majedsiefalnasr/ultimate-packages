import { describe, expect, it } from "vitest";
import { UTerminalService } from "./terminal-service";

describe("UTerminalService", () => {
  it("emits the command on commandHandler when sendCommand() is called", () => {
    const service = new UTerminalService();
    let received: string | undefined;
    service.commandHandler.subscribe((value) => (received = value));

    service.sendCommand("help");

    expect(received).toBe("help");
  });

  it("does not emit an empty command", () => {
    const service = new UTerminalService();
    let received: string | undefined;
    service.commandHandler.subscribe((value) => (received = value));

    service.sendCommand("");

    expect(received).toBeUndefined();
  });

  it("emits the response on responseHandler when sendResponse() is called", () => {
    const service = new UTerminalService();
    let received: string | undefined;
    service.responseHandler.subscribe((value) => (received = value));

    service.sendResponse("done");

    expect(received).toBe("done");
  });

  it("supports multiple independent subscribers", () => {
    const service = new UTerminalService();
    const receivedA: string[] = [];
    const receivedB: string[] = [];
    service.commandHandler.subscribe((v) => receivedA.push(v));
    service.commandHandler.subscribe((v) => receivedB.push(v));

    service.sendCommand("ls");

    expect(receivedA).toEqual(["ls"]);
    expect(receivedB).toEqual(["ls"]);
  });
});
