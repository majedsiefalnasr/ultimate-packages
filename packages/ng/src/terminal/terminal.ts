import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  inject,
  input,
  signal,
} from "@angular/core";
import { UBaseComponent, UTerminalService } from "@ultimate/ng-core";
import { terminalStyleModule } from "./terminal-style";

interface TerminalCommand {
  text: string;
  response?: string;
}

/**
 * Ultimate-owned adaptation of PrimeNG's `Terminal` component (see
 * `.vendor-extracted/ng/terminal/terminal.ts`). Confirmed against real
 * source: extends the bare `BaseComponent` tier (no CVA) — a text-based
 * command-input/output-log display, not a standard form control. Real
 * source's own command interpretation is fully pluggable: `Terminal`
 * itself only echoes submitted commands and any response published via
 * `TerminalService`; the actual command handler lives entirely in
 * consuming application code (subscribing to `commandHandler`, calling
 * `sendResponse()`), matching this port's own `UTerminalService`
 * (`@ultimate/ng-core`, new for Angular this task — see that service's own
 * doc comment) mechanism exactly.
 *
 * Deliberately excludes real source's up-arrow command-history recall
 * (present in PrimeReact's own `Terminal.js` `ArrowUp` handling, absent
 * from real PrimeNG's `Terminal` itself) and its `response` `@Input()`
 * setter path (this port's `UTerminalService.responseHandler` subscription
 * already covers the same use case) — same "smaller surface than upstream"
 * precedent as every sibling component.
 */
@Component({
  standalone: true,
  selector: "u-terminal",
  template: `
    @if (welcomeMessage()) {
      <div [class]="cx('welcomeMessage')">{{ welcomeMessage() }}</div>
    }
    <div [class]="cx('commandList')">
      @for (command of commands(); track $index) {
        <div [class]="cx('command')">
          <span [class]="cx('promptLabel')">{{ prompt() }}</span>
          <span [class]="cx('commandValue')">{{ command.text }}</span>
          <div [class]="cx('commandResponse')" aria-live="polite">{{ command.response }}</div>
        </div>
      }
    </div>
    <div [class]="cx('prompt')">
      <span [class]="cx('promptLabel')">{{ prompt() }}</span>
      <input
        #commandInput
        type="text"
        autocomplete="off"
        [class]="cx('promptValue')"
        [value]="commandText()"
        (input)="commandText.set($any($event.target).value)"
        (keydown)="handleCommand($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "cx('root')",
    "(click)": "focusInput()",
  },
})
export class UTerminal extends UBaseComponent {
  protected override readonly componentName = "terminal";
  protected override readonly styleModule = terminalStyleModule;

  /** Initial text to display on the terminal. */
  welcomeMessage = input<string>();
  /** Prompt text shown before each command. */
  prompt = input<string>("$");

  protected readonly commandText = signal("");
  protected readonly commands = signal<TerminalCommand[]>([]);

  @ViewChild("commandInput") private readonly commandInputRef?: ElementRef<HTMLInputElement>;

  private readonly terminalService = inject(UTerminalService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    super();
    const subscription = this.terminalService.responseHandler.subscribe((response) => {
      this.commands.update((commands) => {
        if (commands.length === 0) {
          return commands;
        }
        const next = [...commands];
        next[next.length - 1] = { ...next[next.length - 1], response };
        return next;
      });
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  protected handleCommand(event: KeyboardEvent): void {
    if (event.key !== "Enter" || !this.commandText()) {
      return;
    }
    const text = this.commandText();
    this.commands.update((commands) => [...commands, { text }]);
    this.terminalService.sendCommand(text);
    this.commandText.set("");
  }

  protected focusInput(): void {
    this.commandInputRef?.nativeElement.focus();
  }
}
