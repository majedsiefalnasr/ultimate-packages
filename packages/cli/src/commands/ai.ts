/**
 * Implements `ultimate ai` per spec §7.3: Phase 9 (AI Skills) has not
 * started, so this command is an unconditional stub. It never parses
 * arguments and never branches on input — every invocation, regardless of
 * what follows `ai` on the command line, prints the same message to stderr
 * and returns the same non-zero exit code.
 */

export const AI_UNAVAILABLE_MESSAGE = "ai: not yet available — Phase 9 (AI Skills) is not started.";

export interface AiResult {
  exitCode: number;
}

/** Unconditionally prints the stub message to stderr and returns exit code 1. */
export function runAi(): AiResult {
  console.error(AI_UNAVAILABLE_MESSAGE);
  return { exitCode: 1 };
}
