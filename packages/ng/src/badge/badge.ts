import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  effect,
  inject,
  input,
} from "@angular/core";
import { UBaseComponent, UBind, U_PARENT_INSTANCE } from "@ultimate/ng-core";
import { badgeStyleModule } from "./badge-style";

/**
 * Ultimate-owned adaptation of PrimeNG's `Badge` component and `BadgeDirective`
 * (see `.vendor-extracted/ng/badge/badge.ts`). A small status indicator for
 * another element.
 *
 * `pt`, `unstyled` and `dt` come from `UBaseComponent`; the root section is
 * bound through the `UBind` host directive. The attribute form is
 * `UBadgeDirective` (`[uBadge]`), the equivalent of PrimeNG's `[pBadge]`
 * (ADR-088). `styleClass` is not offered; the host takes a normal `class`.
 */
@Component({
  standalone: true,
  selector: "u-badge",
  template: `{{ value() }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: U_PARENT_INSTANCE, useExisting: UBadge }],
  host: {
    "[class]":
      "cx('root', { value: value(), size: size(), badgeSize: badgeSize(), severity: severity() })",
    "[style.display]": "badgeDisabled() ? 'none' : null",
  },
  hostDirectives: [UBind],
})
export class UBadge extends UBaseComponent {
  protected override readonly componentName = "badge";
  protected override readonly styleModule = badgeStyleModule;

  private readonly bindDirective = inject(UBind, { self: true });

  /** Size of the badge, valid options are "small", "large" and "xlarge". */
  badgeSize = input<"small" | "large" | "xlarge" | null>();
  /**
   * Size of the badge, valid options are "small", "large" and "xlarge".
   * @deprecated use `badgeSize` instead.
   */
  size = input<"small" | "large" | "xlarge" | null>();
  /** Severity type of the badge. */
  severity = input<"secondary" | "info" | "success" | "warn" | "danger" | "contrast" | null>();
  /** Value to display inside the badge. */
  value = input<string | number | null>();
  /** When specified, disables the component. */
  badgeDisabled = input<boolean, boolean>(false, { transform: booleanAttribute });

  ngAfterViewChecked(): void {
    this.bindDirective.setAttrs(this.ptms(["host", "root"]));
  }
}

/**
 * Attribute form of the badge: renders a `<span class="u-badge">` inside the
 * host and marks the host with `u-overlaybadge`, so the badge sits at its
 * top-end corner. Equivalent of PrimeNG's `BadgeDirective` (`[pBadge]`).
 *
 * The badge is created with `Renderer2`, so it works on the server. A host
 * whose tag contains a dash is not special-cased (PrimeNG attaches to its
 * first child); attach the directive to a plain element. `pt` is not applied
 * to the created span: PrimeNG gives the directive its own `pBadgePT` input,
 * and that part of the pass-through decision is open (ADR-088).
 */
@Directive({
  standalone: true,
  selector: "[uBadge]",
  exportAs: "uBadge",
})
export class UBadgeDirective extends UBaseComponent {
  protected override readonly componentName = "badge";
  protected override readonly styleModule = badgeStyleModule;

  /** When specified, the badge is not rendered. */
  badgeDisabled = input<boolean, boolean>(false, { transform: booleanAttribute });
  /** Size of the badge, valid options are "small", "large" and "xlarge". */
  badgeSize = input<"small" | "large" | "xlarge" | null>();
  /** Severity type of the badge. */
  severity = input<"secondary" | "info" | "success" | "warn" | "danger" | "contrast" | null>();
  /** Value to display inside the badge. */
  value = input<string | number | null>();
  /** Inline style of the badge. */
  badgeStyle = input<Record<string, string | number> | null>();
  /** Class of the badge. */
  badgeStyleClass = input<string>();

  private badgeElement: HTMLElement | null = null;
  private appliedStyleKeys: string[] = [];

  constructor() {
    super();
    effect(() => this.syncBadge());
  }

  private syncBadge(): void {
    const host = this.el.nativeElement as HTMLElement;

    if (this.badgeDisabled()) {
      if (this.badgeElement) {
        this.renderer.removeChild(host, this.badgeElement);
        this.renderer.removeClass(host, "u-overlaybadge");
        this.badgeElement = null;
        this.appliedStyleKeys = [];
      }
      return;
    }

    if (!this.badgeElement) {
      this.badgeElement = this.renderer.createElement("span") as HTMLElement;
      this.renderer.appendChild(host, this.badgeElement);
      this.renderer.addClass(host, "u-overlaybadge");
    }

    const value = this.value();
    const classes = [
      this.cx("root", { value, badgeSize: this.badgeSize(), severity: this.severity() }),
      this.badgeStyleClass(),
    ]
      .filter(Boolean)
      .join(" ");

    this.renderer.setAttribute(this.badgeElement, "class", classes);
    this.renderer.setProperty(this.badgeElement, "textContent", value == null ? "" : String(value));
    this.applyStyle(this.badgeElement, this.badgeStyle());
  }

  private applyStyle(
    badge: HTMLElement,
    style: Record<string, string | number> | null | undefined
  ) {
    for (const key of this.appliedStyleKeys) {
      this.renderer.removeStyle(badge, key);
    }
    this.appliedStyleKeys = Object.keys(style ?? {});
    for (const [key, styleValue] of Object.entries(style ?? {})) {
      this.renderer.setStyle(badge, key, styleValue);
    }
  }
}
