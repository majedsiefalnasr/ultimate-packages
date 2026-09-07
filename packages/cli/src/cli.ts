import { runAdd } from "./commands/add.js";
import { runAi } from "./commands/ai.js";
import { formatDoctorReport, runDoctor } from "./commands/doctor.js";
import { runGenerate } from "./commands/generate.js";
import { runInit } from "./commands/init.js";
import { runTheme } from "./commands/theme.js";

/** The five real v1 commands (spec §7.1/§7.2) plus `ai`'s stub (spec §7.3). */
const KNOWN_COMMANDS = ["init", "add", "theme", "doctor", "generate", "ai"] as const;

const USAGE_MESSAGE = `Usage: ultimate <command> [args]\n\nCommands:\n  ${KNOWN_COMMANDS.join(", ")}`;

/**
 * Prints a handler's `{ exitCode, message }` result: `message` to stdout on
 * success (`exitCode === 0`), stderr otherwise. `generate`/`ai` are excluded
 * from this shape — they print their own output (spec §7.2/§7.3) and return
 * only `{ exitCode }`.
 */
function printResult(result: { exitCode: number; message: string }): number {
  if (result.exitCode === 0) {
    console.log(result.message);
  } else {
    console.error(result.message);
  }
  return result.exitCode;
}

/**
 * Top-level command dispatch for the `ultimate` CLI (this task's brief).
 * `argv[0]` is the command name; everything after is passed through as raw
 * string arguments to the specific command handler (Tasks 5-8) — no
 * flag-parsing library, since v1's entire command surface (spec §7) uses
 * only positional arguments and zero-arg commands.
 *
 * Never calls `process.exit` itself (that stays isolated to `bin.ts`), so
 * this function is directly testable without a subprocess.
 */
export async function runCli(argv: string[], projectDir: string = process.cwd()): Promise<number> {
  const [command, ...args] = argv;

  if (command === undefined) {
    console.error(USAGE_MESSAGE);
    return 1;
  }

  switch (command) {
    case "init": {
      const result = await runInit(projectDir);
      return printResult(result);
    }
    case "add": {
      const result = await runAdd(projectDir, args[0]);
      return printResult(result);
    }
    case "theme": {
      const result = await runTheme(projectDir, args[0]);
      return printResult(result);
    }
    case "doctor": {
      const result = runDoctor(projectDir);
      console.log(formatDoctorReport(result));
      return result.exitCode;
    }
    case "generate": {
      const result = runGenerate(projectDir, args[0]);
      return result.exitCode;
    }
    case "ai": {
      const result = runAi();
      return result.exitCode;
    }
    default: {
      console.error(
        `Unrecognized command "${command}". Known commands: ${KNOWN_COMMANDS.join(", ")}.\n\n${USAGE_MESSAGE}`,
      );
      return 1;
    }
  }
}
