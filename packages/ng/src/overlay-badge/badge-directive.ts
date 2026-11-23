import {
  ApplicationRef,
  ComponentRef,
  Directive,
  EnvironmentInjector,
  Injector,
  booleanAttribute,
  createComponent,
  effect,
  inject,
  input,
  untracked,
} from "@angular/core";
import { UBaseComponent, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { UBadge } from "@ultimate/ng/badge";
import { overlayBadgeStyleModule } from "./overlay-badge-style";

type BadgeSeverity = "secondary" | "info" | "success" | "warn" | "danger" | "contrast";
type BadgeSize = "small" | "large" | "xlarge";

/**
 * Attribute form of the overlay badge, the equivalent of PrimeNG's
 * `BadgeDirective` (`[pBadge]`, see `.vendor-extracted/ng/badge/badge.ts`).
 * It composes a real `UBadge` inside the host and marks the host with
 * `u-overlaybadge`, so the badge sits at the host's top-end corner with the
 * same rules as `UOverlayBadge` (ADR-088).
 *
 * The badge is created with `createComponent` and a `Renderer2`-made host
 * element, so it works on the server. A host whose tag contains a dash is not
 * special-cased (PrimeNG attaches to its first child); attach the directive to
 * a plain element. `pt` reaches the badge as `pcBadge`, `unstyled` is
 * forwarded, and `badgeStyle` and `badgeStyleClass` are applied to the badge
 * element.
 */
@Directive({
  standalone: true,
  selector: "[uBadge]",
  exportAs: "uBadge",
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UBadgeDirective }],
  host: {
    "[class]": "badgeDisabled() ? null : cx('root')",
  },
})
export class UBadgeDirective extends UBaseComponent {
  protected override readonly componentName = "overlaybadge";
  protected override readonly styleModule = overlayBadgeStyleModule;

  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);

  /** When specified, the badge is not rendered. */
  badgeDisabled = input<boolean, boolean>(false, { transform: booleanAttribute });
  /** Size of the badge, valid options are "small", "large" and "xlarge". */
  badgeSize = input<BadgeSize | null>();
  /** Severity type of the badge. */
  severity = input<BadgeSeverity | null>();
  /** Value to display inside the badge. */
  value = input<string | number | null>();
  /** Inline style of the badge. */
  badgeStyle = input<Record<string, string | number> | null>();
  /** Class of the badge. */
  badgeStyleClass = input<string>();

  private badgeRef: ComponentRef<UBadge> | null = null;
  private appliedStyleKeys: string[] = [];
  private appliedClasses: string[] = [];

  constructor() {
    super();
    effect(() => {
      const disabled = this.badgeDisabled();
      const inputs = {
        value: this.value(),
        severity: this.severity(),
        badgeSize: this.badgeSize(),
        pt: this.ptm("pcBadge"),
        unstyled: this.unstyled(),
      };
      const style = this.badgeStyle();
      const styleClass = this.badgeStyleClass();
      untracked(() => this.syncBadge(disabled, inputs, style, styleClass));
    });
  }

  ngOnDestroy(): void {
    this.destroyBadge();
  }

  private syncBadge(
    disabled: boolean,
    inputs: Record<string, unknown>,
    style: Record<string, string | number> | null | undefined,
    styleClass: string | undefined
  ): void {
    if (disabled) {
      this.destroyBadge();
      return;
    }

    const host = this.el.nativeElement as HTMLElement;
    if (!this.badgeRef) {
      const hostElement = this.renderer.createElement("u-badge") as HTMLElement;
      this.renderer.appendChild(host, hostElement);
      this.badgeRef = createComponent(UBadge, {
        environmentInjector: this.environmentInjector,
        elementInjector: this.injector,
        hostElement,
      });
      this.appRef.attachView(this.badgeRef.hostView);
    }

    const badgeRef = this.badgeRef;
    for (const [name, inputValue] of Object.entries(inputs)) {
      badgeRef.setInput(name, inputValue);
    }
    this.applyStyle(badgeRef.location.nativeElement as HTMLElement, style, styleClass);
    badgeRef.changeDetectorRef.detectChanges();
  }

  private applyStyle(
    badge: HTMLElement,
    style: Record<string, string | number> | null | undefined,
    styleClass: string | undefined
  ): void {
    for (const key of this.appliedStyleKeys) {
      this.renderer.removeStyle(badge, key);
    }
    this.appliedStyleKeys = Object.keys(style ?? {});
    for (const [key, styleValue] of Object.entries(style ?? {})) {
      this.renderer.setStyle(badge, key, styleValue);
    }

    for (const name of this.appliedClasses) {
      this.renderer.removeClass(badge, name);
    }
    this.appliedClasses = (styleClass ?? "").split(/\s+/).filter(Boolean);
    for (const name of this.appliedClasses) {
      this.renderer.addClass(badge, name);
    }
  }

  private destroyBadge(): void {
    if (!this.badgeRef) return;
    const element = this.badgeRef.location.nativeElement as HTMLElement;
    this.badgeRef.destroy();
    this.renderer.removeChild(this.el.nativeElement, element);
    this.badgeRef = null;
    this.appliedStyleKeys = [];
    this.appliedClasses = [];
  }
}
