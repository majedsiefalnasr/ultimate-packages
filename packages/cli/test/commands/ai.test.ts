import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runAi", () => {
  it("unconditionally prints the Phase 9 stub phrasing to stderr and returns a non-zero exit code, regardless of input", async () => {
    const { runAi, AI_UNAVAILABLE_MESSAGE } = await import("../../src/commands/ai.js");

    expect(AI_UNAVAILABLE_MESSAGE).toMatch(/not yet available/);
    expect(AI_UNAVAILABLE_MESSAGE).toMatch(/Phase 9/);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const result = runAi();

    expect(result.exitCode).not.toBe(0);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(AI_UNAVAILABLE_MESSAGE);
    expect(logSpy).not.toHaveBeenCalled();
  });
});
