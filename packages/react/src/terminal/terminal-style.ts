/**
 * Ultimate-owned adaptation of PrimeReact's `Terminal` style (real source:
 * `components/lib/terminal/TerminalBase.js`), shaped to match
 * `useComponentBase`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/terminal` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 */
const css = /*css*/ `
.u-terminal { background: var(--u-terminal-bg, #1e1e1e); color: var(--u-terminal-color, #f3f4f6); font-family: monospace; padding: 0.75rem; border-radius: 6px; overflow-y: auto; max-height: 20rem; }
.u-terminal-welcome-message { margin-bottom: 0.5rem; }
.u-terminal-command { display: block; margin-bottom: 0.25rem; }
.u-terminal-response { white-space: pre-wrap; }
.u-terminal-prompt { margin-right: 0.5rem; }
.u-terminal-container { display: flex; align-items: center; }
.u-terminal-command-text { flex: 1; background: transparent; border: none; outline: none; color: inherit; font: inherit; }
`;

const classes = {
  root: "u-terminal u-component",
  welcomeMessage: "u-terminal-welcome-message",
  content: "u-terminal-content",
  command: "u-terminal-command",
  response: "u-terminal-response",
  prompt: "u-terminal-prompt",
  container: "u-terminal-container",
  commandText: "u-terminal-command-text",
};

/** `useComponentBase`-shaped style module for `UTerminal`. */
export const terminalStyleModule = { css, classes };
