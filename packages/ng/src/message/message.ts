import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
  signal,
} from "@angular/core";
import { UBaseComponent } from "@ultimate/ng-core";
import { messageStyleModule } from "./message-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Message` component (see
 * `.vendor-extracted/ng/message/message.ts`). Confirmed against real
 * source (all 3 frameworks — PrimeNG's `Message`, PrimeReact's
 * `Message`/`MessageBase`, PrimeVue's `Message.vue`): extends the bare
 * `BaseComponent` tier in all 3, not `BaseEditableHolder`/`BaseInput` — it
 * is a status/display component (severity-colored banner with an optional
 * close button and optional auto-dismiss timer), never a form control.
 *
 * Real source's own feature set differs slightly per framework (Angular's
 * is the richest — templates for container/icon/close-icon, deprecated
 * `text`/`escape` inputs, `motionOptions`); this port follows Angular's own
 * shape for its own realization (content projection is the primary content
 * path, matching real source's v20+ deprecation of `text`/`escape` in favor
 * of `<ng-content>`), while React/Vue's realizations (separate files) match
 * PrimeReact/PrimeVue's own simpler `severity` + `icon` + `text`/default-
 * slot shape. Deliberately excludes real source's custom container/icon/
 * close-icon template overrides and its `@primeuix/motion`-driven show/hide
 * transition — this port shows/hides via a plain signal-gated `@if`, no
 * enter/leave animation, same "smaller surface than upstream" precedent as
 * every sibling component.
 */
@Component({
  standalone: true,
  selector: "u-message",
  template: `
    @if (visible()) {
      <div [class]="cx('root', { severity: severity() })" role="alert" aria-live="polite" [attr.data-severity]="severity()">
        <div [class]="cx('content')">
          @if (icon()) {
            <i [class]="cx('icon') + ' ' + icon()" aria-hidden="true"></i>
          }
          <span [class]="cx('text')">
            <ng-content></ng-content>
          </span>
          @if (closable()) {
            <button
              type="button"
              [class]="cx('closeButton')"
              [attr.aria-label]="closeAriaLabel()"
              (click)="close($event)"
            >
              @if (closeIcon()) {
                <i [class]="closeIcon()" aria-hidden="true"></i>
              } @else {
                &times;
              }
            </button>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class UMessage extends UBaseComponent implements OnInit, OnDestroy {
  protected override readonly componentName = "message";
  protected override readonly styleModule = messageStyleModule;

  /** Severity level of the message. */
  severity = input<"success" | "info" | "warn" | "error" | "secondary" | "contrast">("info");
  /** Whether the message can be closed manually using the close icon. */
  closable = input(false, { transform: booleanAttribute });
  /** Icon to display in the message. */
  icon = input<string>();
  /** Icon to display in the message close button. */
  closeIcon = input<string>();
  /** Delay in milliseconds to close the message automatically. */
  life = input<number>();
  /** Accessible label for the close button. */
  closeAriaLabel = input<string>("Close");

  /** Emits when the message is closed. */
  onClose = output<{ originalEvent: Event }>();

  protected readonly visible = signal(true);

  private autoCloseTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    super.ngOnInit();
    const life = this.life();
    if (life) {
      this.autoCloseTimer = setTimeout(() => this.visible.set(false), life);
    }
  }

  ngOnDestroy(): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  protected close(event: Event): void {
    this.visible.set(false);
    this.onClose.emit({ originalEvent: event });
  }
}
