import { describe, it, expect, vi, afterEach } from "vitest";

const projectDir = "/fake/project/dir";

vi.mock("../src/commands/init.js", () => ({
  runInit: vi.fn(async () => ({ exitCode: 0, message: "init: ok" })),
}));
vi.mock("../src/commands/add.js", () => ({
  runAdd: vi.fn(async () => ({ exitCode: 0, message: "add: ok" })),
}));
vi.mock("../src/commands/theme.js", () => ({
  runTheme: vi.fn(async () => ({ exitCode: 0, message: "theme: ok" })),
}));
vi.mock("../src/commands/doctor.js", () => ({
  runDoctor: vi.fn(() => ({
    exitCode: 0,
    framework: "react",
    components: [],
    summaryLine: "8 of 8 known components reported",
    message: "doctor: ok",
  })),
  formatDoctorReport: vi.fn(() => "formatted doctor report"),
}));
vi.mock("../src/commands/generate.js", () => ({
  runGenerate: vi.fn(() => ({ exitCode: 0 })),
}));
vi.mock("../src/commands/ai.js", () => ({
  runAi: vi.fn(() => ({ exitCode: 1 })),
}));

const { runInit } = await import("../src/commands/init.js");
const { runAdd } = await import("../src/commands/add.js");
const { runTheme } = await import("../src/commands/theme.js");
const { runDoctor, formatDoctorReport } = await import("../src/commands/doctor.js");
const { runGenerate } = await import("../src/commands/generate.js");
const { runAi } = await import("../src/commands/ai.js");
const { runCli } = await import("../src/cli.js");

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("runCli", () => {
  it("returns non-zero with a usage message when no command is given", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const code = await runCli([], projectDir);

    expect(code).not.toBe(0);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/usage/i));
  });

  it("returns non-zero and names all real v1 commands for an unrecognized command", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const code = await runCli(["nonsense"], projectDir);

    expect(code).not.toBe(0);
    const [message] = errorSpy.mock.calls[0] as [string];
    for (const name of ["init", "add", "theme", "doctor", "generate", "ai"]) {
      expect(message).toContain(name);
    }
  });

  it("dispatches `init` to runInit with projectDir", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const code = await runCli(["init"], projectDir);

    expect(runInit).toHaveBeenCalledWith(projectDir);
    expect(code).toBe(0);
  });

  it("dispatches `add <package>` to runAdd with projectDir and the package name", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const code = await runCli(["add", "@ultimate/react-table"], projectDir);

    expect(runAdd).toHaveBeenCalledWith(projectDir, "@ultimate/react-table");
    expect(code).toBe(0);
  });

  it("dispatches `theme <preset>` to runTheme with projectDir and the preset name", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});

    const code = await runCli(["theme", "aura"], projectDir);

    expect(runTheme).toHaveBeenCalledWith(projectDir, "aura");
    expect(code).toBe(0);
  });

  it("dispatches `doctor` to runDoctor, prints the formatted report, and returns its exit code", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const code = await runCli(["doctor"], projectDir);

    expect(runDoctor).toHaveBeenCalledWith(projectDir);
    expect(formatDoctorReport).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("formatted doctor report");
    expect(code).toBe(0);
  });

  it("dispatches `generate <component>` to runGenerate (sync) with projectDir and the component name", async () => {
    const code = await runCli(["generate", "Button"], projectDir);

    expect(runGenerate).toHaveBeenCalledWith(projectDir, "Button");
    expect(code).toBe(0);
  });

  it("dispatches `ai` to runAi (sync, no arguments) and returns its exit code", async () => {
    const code = await runCli(["ai"], projectDir);

    expect(runAi).toHaveBeenCalledWith();
    expect(code).toBe(1);
  });

  it("defaults projectDir to process.cwd() when no override is passed", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue("/cwd/fallback");

    await runCli(["init"]);

    expect(runInit).toHaveBeenCalledWith("/cwd/fallback");
    cwdSpy.mockRestore();
  });
});
