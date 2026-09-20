import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { terminalEventBus, type UTerminalCommand } from "./terminal-event-bus";
import { terminalStyleModule } from "./terminal-style";

export interface UTerminalProps {
  welcomeMessage?: string;
  prompt?: string;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Terminal` component (real
 * source: `components/lib/terminal/Terminal.js`/`TerminalBase.js`).
 * Confirmed against real source: extends the bare `ComponentBase` tier (no
 * CVA) — a text-based command-input/output-log display, not a standard
 * form control. Real source's own command interpretation is fully
 * pluggable: `Terminal` only echoes submitted commands and any response
 * published on `TerminalService`; the actual command handler lives
 * entirely in consuming application code, subscribing to this port's own
 * `terminalEventBus`'s `"command"` event and calling
 * `terminalEventBus.emit("response", text)`.
 *
 * This port keeps real source's up-arrow command-history recall
 * (`ArrowUp` cycling through prior commands) and Enter-to-submit behavior.
 * Deliberately excludes real source's `pt`/passthrough system — same
 * "smaller surface than upstream" precedent as every sibling component.
 */
export function UTerminal({ welcomeMessage, prompt = "$", className }: UTerminalProps): React.ReactNode {
  const { cx } = useComponentBase({ componentName: "terminal", styleModule: terminalStyleModule });
  const [commandText, setCommandText] = React.useState("");
  const [commands, setCommands] = React.useState<UTerminalCommand[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onResponse = (response: unknown) => {
      setCommands((prev) => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], response: response as string };
        return next;
      });
    };
    const onClear = () => {
      setCommands([]);
      setHistoryIndex(0);
    };
    terminalEventBus.on("response", onResponse);
    terminalEventBus.on("clear", onClear);
    return () => {
      terminalEventBus.off("response", onResponse);
      terminalEventBus.off("clear", onClear);
    };
  }, []);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  });

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      if (commands.length) {
        const prevIndex = historyIndex - 1 < 0 ? commands.length - 1 : historyIndex - 1;
        setHistoryIndex(prevIndex);
        setCommandText(commands[prevIndex].text);
      }
      return;
    }
    if (event.key === "Enter" && commandText) {
      const text = commandText;
      setCommands((prev) => [...prev, { text }]);
      setHistoryIndex((prev) => prev + 1);
      setCommandText("");
      terminalEventBus.emit("command", text);
    }
  };

  return (
    <div
      ref={containerRef}
      className={[cx("root"), className].filter(Boolean).join(" ")}
      onClick={() => inputRef.current?.focus()}
    >
      {welcomeMessage && <div className={cx("welcomeMessage")}>{welcomeMessage}</div>}
      <div className={cx("content")}>
        {commands.map((command, index) => (
          // eslint-disable-next-line react/no-array-index-key -- matches real source's own text+index key
          <div key={`${command.text}_${index}`} className={cx("command")}>
            <span className={cx("prompt")}>{prompt}&nbsp;</span>
            <span>{command.text}</span>
            <div className={cx("response")} aria-live="polite">
              {command.response}
            </div>
          </div>
        ))}
      </div>
      <div className={cx("container")}>
        <span className={cx("prompt")}>{prompt}&nbsp;</span>
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          className={cx("commandText")}
          value={commandText}
          onChange={(e) => setCommandText(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
}
