/**
 * Ultimate-owned adaptation of PrimeVue's `Terminal` style (see
 * `.vendor-extracted/vue/terminal/style/TerminalStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/terminal` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 */
const css = /*css*/ `
.u-terminal { background: var(--u-terminal-bg, #1e1e1e); color: var(--u-terminal-color, #f3f4f6); font-family: monospace; padding: 0.75rem; border-radius: 6px; overflow-y: auto; max-height: 20rem; }
.u-terminal-welcome-message { margin-bottom: 0.5rem; }
.u-terminal-command { display: block; margin-bottom: 0.25rem; }
.u-terminal-command-response { white-space: pre-wrap; }
.u-terminal-prompt { display: flex; align-items: center; }
.u-terminal-prompt-label { margin-right: 0.5rem; }
.u-terminal-prompt-value { flex: 1; background: transparent; border: none; outline: none; color: inherit; font: inherit; }
`;

const classes = {
  root: "u-terminal u-component",
  welcomeMessage: "u-terminal-welcome-message",
  commandList: "u-terminal-command-list",
  command: "u-terminal-command",
  promptLabel: "u-terminal-prompt-label",
  commandValue: "u-terminal-command-value",
  commandResponse: "u-terminal-command-response",
  prompt: "u-terminal-prompt",
  promptValue: "u-terminal-prompt-value",
};

/** `createBaseComponent`-shaped style module for `UTerminal`. */
export const terminalStyleModule = { css, classes };
