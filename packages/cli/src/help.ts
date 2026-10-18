/** The five real v1 commands (spec §7.1/§7.2) plus `ai`'s stub (spec §7.3). */
export const KNOWN_COMMANDS = ["init", "add", "theme", "doctor", "generate", "ai"] as const;

export type KnownCommand = (typeof KNOWN_COMMANDS)[number];

export interface ExitCodeRow {
  /** A fixed code, or the installing package manager's own non-zero code passed through. */
  code: number | "package-manager exit code";
  meaning: string;
}

export interface CommandUsage {
  usage: string;
  summary: string;
  arguments: ReadonlyArray<{ name: string; description: string }>;
}

const HELP_ROW: ExitCodeRow = { code: 0, meaning: "--help or -h: help printed" };

const NO_FRAMEWORK_ROW: ExitCodeRow = {
  code: 1,
  meaning: "refused: no Angular, React or Vue dependency in package.json",
};

const INCOMPATIBLE_ROW: ExitCodeRow = {
  code: 1,
  meaning: "refused: the framework version has no compatible Ultimate package",
};

const INSTALL_FAILED_ROW: ExitCodeRow = {
  code: "package-manager exit code",
  meaning: "the package-manager install failed; its exit code is passed through",
};

/**
 * Every exit path of the `ultimate` bin, read from `cli.ts`, `bin.ts` and
 * `commands/*.ts`. The single source for `renderHelp()` and the README
 * "Commands" section (`test/help.test.ts` asserts both agree with it).
 */
export const EXIT_CODES: Readonly<Record<"ultimate" | KnownCommand, readonly ExitCodeRow[]>> = {
  ultimate: [
    HELP_ROW,
    { code: 1, meaning: "no command given: usage printed" },
    { code: 1, meaning: "unknown command (including create, EX-1): usage printed" },
    {
      code: 1,
      meaning: "unexpected error, such as a package manager that cannot be started",
    },
  ],
  init: [
    { code: 0, meaning: "framework package installed and ultimate.config.json written" },
    NO_FRAMEWORK_ROW,
    INCOMPATIBLE_ROW,
    INSTALL_FAILED_ROW,
    HELP_ROW,
  ],
  add: [
    { code: 0, meaning: "package installed" },
    { code: 1, meaning: "missing argument: no package name given" },
    NO_FRAMEWORK_ROW,
    INCOMPATIBLE_ROW,
    INSTALL_FAILED_ROW,
    HELP_ROW,
  ],
  theme: [
    { code: 0, meaning: "preset applied, ultimate.config.json and the theme entry file written" },
    { code: 1, meaning: "missing argument: no preset name given" },
    { code: 1, meaning: "refused: unknown preset (v1 accepts only aura)" },
    NO_FRAMEWORK_ROW,
    INCOMPATIBLE_ROW,
    INSTALL_FAILED_ROW,
    HELP_ROW,
  ],
  doctor: [
    {
      code: 0,
      meaning: "report printed for a detected framework, compatible or incompatible",
    },
    { code: 1, meaning: "report printed: no supported framework detected" },
    HELP_ROW,
  ],
  generate: [
    { code: 0, meaning: "snippet printed to stdout" },
    { code: 1, meaning: "missing argument: no component name given" },
    NO_FRAMEWORK_ROW,
    { code: 1, meaning: "refused: unknown component name" },
    HELP_ROW,
  ],
  ai: [{ code: 1, meaning: "always: stub, Phase 9 (AI Skills) not started (EX-2)" }, HELP_ROW],
};

/** Per-command usage and arguments for `renderHelp()` and the README. */
export const COMMAND_USAGE: Readonly<Record<KnownCommand, CommandUsage>> = {
  init: {
    usage: "ultimate init",
    summary: "Install the compatible Ultimate framework package and write ultimate.config.json.",
    arguments: [],
  },
  add: {
    usage: "ultimate add <package>",
    summary: "Install an Ultimate package into a compatible project.",
    arguments: [{ name: "<package>", description: "the package name to install" }],
  },
  theme: {
    usage: "ultimate theme <preset>",
    summary: "Install @ultimate/themes if needed and apply a theme preset.",
    arguments: [{ name: "<preset>", description: 'the preset name; v1 accepts only "aura"' }],
  },
  doctor: {
    usage: "ultimate doctor",
    summary: "Report the detected framework, compatibility and installed components.",
    arguments: [],
  },
  generate: {
    usage: "ultimate generate <component>",
    summary: "Print a usage snippet for a known component to stdout. Writes no file.",
    arguments: [{ name: "<component>", description: "a known component name, such as Button" }],
  },
  ai: {
    usage: "ultimate ai",
    summary: "Stub (EX-2): prints an unavailable message. Not an implemented command.",
    arguments: [],
  },
};

const DOCUMENTED_EXCEPTIONS: ReadonlyArray<{ name: string; text: string }> = [
  {
    name: "create",
    text: "EX-1: not implemented; create the project with the framework's own tooling",
  },
  { name: "ai", text: "EX-2: stub only; always exits 1" },
];

function formatExitCodes(rows: readonly ExitCodeRow[]): string[] {
  return rows.map((row) => `  ${row.code}  ${row.meaning}`);
}

function renderCommandHelp(command: KnownCommand): string {
  const { usage, summary, arguments: args } = COMMAND_USAGE[command];
  const lines = [`Usage: ${usage}`, "", summary, ""];
  if (args.length > 0) {
    lines.push("Arguments:", ...args.map((arg) => `  ${arg.name}  ${arg.description}`), "");
  }
  lines.push("Exit codes:", ...formatExitCodes(EXIT_CODES[command]));
  return lines.join("\n");
}

function isKnownCommand(command: string): command is KnownCommand {
  return (KNOWN_COMMANDS as readonly string[]).includes(command);
}

/** Global help, or one command's help when `command` is a known command. */
export function renderHelp(command?: string): string {
  if (command !== undefined && isKnownCommand(command)) {
    return renderCommandHelp(command);
  }

  const width = Math.max(...KNOWN_COMMANDS.map((name) => COMMAND_USAGE[name].usage.length));
  return [
    "Usage: ultimate <command> [args]",
    "       ultimate <command> --help",
    "",
    "Commands:",
    ...KNOWN_COMMANDS.map(
      (name) => `  ${COMMAND_USAGE[name].usage.padEnd(width)}  ${COMMAND_USAGE[name].summary}`
    ),
    "",
    "Documented exceptions (not implemented commands):",
    ...DOCUMENTED_EXCEPTIONS.map((exception) => `  ${exception.name.padEnd(6)}  ${exception.text}`),
    "",
    "Exit codes:",
    ...formatExitCodes(EXIT_CODES.ultimate),
    "",
    'Run "ultimate <command> --help" for that command\'s arguments and exit codes.',
  ].join("\n");
}
