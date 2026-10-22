import { runAdd } from "./commands/add.js";
import { runAi } from "./commands/ai.js";
import { formatDoctorReport, runDoctor } from "./commands/doctor.js";
import { runGenerate } from "./commands/generate.js";
import { runInit } from "./commands/init.js";
import { runTheme } from "./commands/theme.js";
import { KNOWN_COMMANDS, renderHelp } from "./help.js";

const USAGE_MESSAGE =
  `Usage: ultimate <command> [args]\n\nCommands:\n  ${KNOWN_COMMANDS.join(", ")}\n\n` +
  'Run "ultimate --help" for arguments and exit codes.';

const HELP_FLAGS: readonly string[] = ["--help", "-h"];

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

  // `--help`/`-h` globally, or as the first argument after a known command.
  if (HELP_FLAGS.includes(command)) {
    console.log(renderHelp());
    return 0;
  }
  if (
    (KNOWN_COMMANDS as readonly string[]).includes(command) &&
    HELP_FLAGS.includes(args[0] ?? "")
  ) {
    console.log(renderHelp(command));
    return 0;
  }

  switch (command) {
    case "init": {
      const result = await runInit(projectDir);
      return printResult(result);
    }
    case "add": {
      if (args[0] === undefined) {
        console.error("add requires a package name: ultimate add <package>");
        return 1;
      }
      const result = await runAdd(projectDir, args[0]);
      return printResult(result);
    }
    case "theme": {
      if (args[0] === undefined) {
        console.error("theme requires a preset name: ultimate theme <preset>");
        return 1;
      }
      const result = await runTheme(projectDir, args[0]);
      return printResult(result);
    }
    case "doctor": {
      const result = runDoctor(projectDir);
      console.log(formatDoctorReport(result));
      return result.exitCode;
    }
    case "generate": {
      if (args[0] === undefined) {
        console.error("generate requires a component name: ultimate generate <component>");
        return 1;
      }
      const result = runGenerate(projectDir, args[0]);
      return result.exitCode;
    }
    case "ai": {
      const result = runAi();
      return result.exitCode;
    }
    default: {
      console.error(
        `Unrecognized command "${command}". Known commands: ${KNOWN_COMMANDS.join(", ")}.\n\n${USAGE_MESSAGE}`
      );
      return 1;
    }
  }
}
