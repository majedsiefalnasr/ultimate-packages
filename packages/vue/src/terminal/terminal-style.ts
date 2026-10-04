/**
 * Ultimate-owned adaptation of PrimeVue's `Terminal` style (see
 * `.vendor-extracted/vue/terminal/style/TerminalStyle.js`), shaped to
 * match `createBaseComponent`'s `styleModule: {css, classes}` contract. No
 * `@ultimate/uix-styles/terminal` entry exists yet, so `css`/`classes` are
 * authored locally (same precedent as `messageStyleModule`).
 * GAP-064 G3-A: the css below is the applicable @primeuix/styles 2.0.3 structural CSS mapped to this component's DOM (see packages/themes/test/utils/g3a-port.mjs).
 */
const css = /*css*/ `
.u-terminal{display: block;height: dt('terminal.height');overflow: auto;background: dt('terminal.background');color: dt('terminal.color');border: 1px solid dt('terminal.border.color');padding: dt('terminal.padding');border-radius: dt('terminal.border.radius');}
.u-terminal-prompt{display: flex;align-items: center;}
.u-terminal-prompt-value{flex: 1 1 auto;border: 0 none;background: transparent;color: inherit;padding: 0;outline: 0 none;font-family: inherit;font-feature-settings: inherit;font-size: 1rem;}
.u-terminal-prompt-label{margin-inline-end: dt('terminal.prompt.gap');}
.u-terminal-command-response{margin: dt('terminal.command.response.margin');}
.u-terminal-welcome-message{margin-bottom: 0.5rem;}
.u-terminal-command{display: block;margin-bottom: 0.25rem;}
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
