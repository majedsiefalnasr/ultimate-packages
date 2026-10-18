import { describe, it, expect, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { COMMAND_USAGE, EXIT_CODES, KNOWN_COMMANDS, renderHelp } from "../src/help.js";
import { runCli } from "../src/cli.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const README = readFileSync(join(__dirname, "..", "README.md"), "utf-8");

/** Every `| a | b | c |` table row in the README, as trimmed cells. */
const README_TABLE_ROWS: string[][] = README.split("\n")
  .filter((line) => line.startsWith("|"))
  .map((line) =>
    line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim())
  );

const HELP_FLAGS = ["--help", "-h"];

afterEach(() => {
  vi.restoreAllMocks();
});

describe("EXIT_CODES", () => {
  it("has a row set for the top level and for every known command", () => {
    expect(Object.keys(EXIT_CODES).sort()).toEqual(["ultimate", ...KNOWN_COMMANDS].sort());
  });

  it("documents the install-failure pass-through for init, add and theme only", () => {
    const passThrough = Object.entries(EXIT_CODES)
      .filter(([, rows]) => rows.some((row) => row.code === "package-manager exit code"))
      .map(([command]) => command)
      .sort();
    expect(passThrough).toEqual(["add", "init", "theme"]);
  });
});

describe("renderHelp", () => {
  it("lists every known command with its usage and every top-level exit code", () => {
    const help = renderHelp();

    for (const command of KNOWN_COMMANDS) {
      expect(help).toContain(COMMAND_USAGE[command].usage);
    }
    for (const row of EXIT_CODES.ultimate) {
      expect(help).toContain(`${row.code}  ${row.meaning}`);
    }
  });

  it("shows EX-1 (create) and EX-2 (ai stub) as documented exceptions", () => {
    const help = renderHelp();

    expect(help).toMatch(/Documented exceptions/);
    expect(help).toMatch(/create\s+EX-1/);
    expect(help).toMatch(/ai\s+EX-2/);
  });

  it.each(KNOWN_COMMANDS)("renders `%s` help with its arguments and every exit code", (command) => {
    const help = renderHelp(command);

    expect(help).toContain(`Usage: ${COMMAND_USAGE[command].usage}`);
    for (const argument of COMMAND_USAGE[command].arguments) {
      expect(help).toContain(argument.name);
    }
    for (const row of EXIT_CODES[command]) {
      expect(help).toContain(`${row.code}  ${row.meaning}`);
    }
  });
});

describe("README", () => {
  it("lists every command's usage", () => {
    for (const command of KNOWN_COMMANDS) {
      expect(README).toContain(`\`${COMMAND_USAGE[command].usage}\``);
    }
  });

  it("has a table row for every EXIT_CODES row", () => {
    for (const [command, rows] of Object.entries(EXIT_CODES)) {
      for (const row of rows) {
        expect(README_TABLE_ROWS).toContainEqual([`\`${command}\``, `${row.code}`, row.meaning]);
      }
    }
  });

  it("has no exit-code table row that EXIT_CODES does not define", () => {
    const commands = new Set(Object.keys(EXIT_CODES));
    const documented = README_TABLE_ROWS.filter(([first]) =>
      commands.has((first ?? "").replaceAll("`", ""))
    );
    const expected = Object.values(EXIT_CODES).reduce((sum, rows) => sum + rows.length, 0);
    expect(documented).toHaveLength(expected);
  });
});

describe("runCli --help", () => {
  it.each(HELP_FLAGS)(
    "`ultimate %s` prints the global help to stdout and exits 0",
    async (flag) => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const code = await runCli([flag], "/fake/project/dir");

      expect(code).toBe(0);
      expect(logSpy).toHaveBeenCalledWith(renderHelp());
    }
  );

  for (const command of KNOWN_COMMANDS) {
    it.each(HELP_FLAGS)(
      `\`ultimate ${command} %s\` prints that command's help and exits 0`,
      async (flag) => {
        const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        const code = await runCli([command, flag], "/fake/project/dir");

        expect(code).toBe(0);
        expect(logSpy).toHaveBeenCalledWith(renderHelp(command));
        expect(errorSpy).not.toHaveBeenCalled();
      }
    );
  }

  it("keeps exit 1 and the usage text for a missing command", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const code = await runCli([], "/fake/project/dir");

    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/^Usage: ultimate <command>/));
  });

  it("keeps exit 1 and the usage text for an unknown command", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const code = await runCli(["create"], "/fake/project/dir");

    expect(code).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/Unrecognized command "create"/));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/Usage: ultimate <command>/));
  });
});
