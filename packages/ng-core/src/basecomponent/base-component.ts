import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  Renderer2,
  computed,
  effect,
  inject,
  input,
  untracked,
} from "@angular/core";
import { DOCUMENT, isPlatformServer } from "@angular/common";
import { cn } from "@ultimate/uix-utils/classnames";
import { uuid } from "@ultimate/uix-utils/uuid";
import {
  createScopedTheme,
  registerComponentCss,
  registerBoxModel,
  registerHiddenAccessible,
  registerIconSpin,
  registerThemeVariables,
  scopeRootsOf,
  type ScopedTheme,
} from "@ultimate/uix-styled";
import { UltimateConfig } from "../config/ultimate-config";
import { ngCoreStyleSheetFor } from "./style-sheet";

/**
 * Ultimate-owned, scoped-down reimplementation of PrimeNG's own
 * `BaseComponent`. Covers DI wiring, the `dt`/`unstyled` input pair, a
 * `cx()` class-name-slot resolver, and `@ultimate/uix-styled`-backed style
 * registration on init.
 *
 * Deliberately excludes PrimeNG's passthrough (`pt`/`ptOptions`/`ptm`/
 * `ptms`/`ptmo`) system, full global-config surface, and `$parentInstance`
 * DI-token lookup — all explicitly deferred per the approved Phase 2 spec
 * (Option B architecture decision).
 */
@Directive({ standalone: true })
export abstract class UBaseComponent {
  protected readonly document: Document = inject(DOCUMENT);
  protected readonly platformId: object = inject(PLATFORM_ID);
  protected readonly el: ElementRef = inject(ElementRef);
  protected readonly renderer: Renderer2 = inject(Renderer2);
  protected readonly config: UltimateConfig = inject(UltimateConfig);

  /** Scoped design tokens (per-instance token override). */
  dt = input<Record<string, unknown> | undefined>();
  unstyled = input<boolean | undefined>();

  /** e.g. "button" — used as the uix-styled registration key. */
  protected abstract readonly componentName: string;
  protected abstract readonly styleModule: {
    css: string;
    classes: Record<string, unknown>;
  };

  /**
   * Resolves a class-name slot from `styleModule.classes` via
   * `@ultimate/uix-utils`'s `cn()`, matching PrimeNG's own `cx()` contract
   * but without the `pt`/passthrough merge layer.
   */
  protected cx(key: string, params?: Record<string, unknown>): string | undefined {
    if (this.$unstyled()) return undefined;
    const resolver = this.styleModule.classes[key];
    const resolved = typeof resolver === "function" ? resolver(params) : resolver;
    return cn(resolved);
  }

  ngOnInit(): void {
    this.registerStyles();
  }

  /**
   * The effective unstyled flag: the `unstyled` input when set, else the
   * global `UltimateConfig.unstyled`, like PrimeNG's `$unstyled`.
   */
  readonly $unstyled = computed(() => this.unstyled() ?? this.config.unstyled());

  /** Attribute selector the instance's scoped `dt` variables target (`pc1`, `pc2`, …). */
  readonly $attrSelector = uuid("pc");

  private scopedTheme?: ScopedTheme;

  constructor() {
    // PrimeNG loads its core styles from an effect that watches `$unstyled`,
    // so an instance that turns styled later gets its styles. Registration is
    // idempotent, which makes the first run, after `ngOnInit`, a no-op.
    effect(() => {
      if (!this.$unstyled()) untracked(() => this.registerStyles());
    });

    // PrimeNG's `dt` effect: scope the tokens to this instance, rewrite them
    // when `dt` changes, remove them when it is cleared. Skipped on the
    // server, where the per-instance selector would not survive hydration.
    effect(() => {
      const dt = this.dt();
      if (isPlatformServer(this.platformId)) return;
      untracked(() => this.applyScopedTheme(dt));
    });

    inject(DestroyRef).onDestroy(() => this.scopedTheme?.dispose());
  }

  private applyScopedTheme(dt: Record<string, unknown> | undefined): void {
    const host = this.el.nativeElement as Element;
    if (dt && Object.keys(dt).length > 0) {
      this.scopedTheme ??= createScopedTheme(
        ngCoreStyleSheetFor(this.document),
        this.componentName,
        this.$attrSelector
      );
      this.scopedTheme.update(dt);
      this.renderer.setAttribute(host, this.$attrSelector, "");
    } else if (this.scopedTheme) {
      this.scopedTheme.update(undefined);
      this.renderer.removeAttribute(host, this.$attrSelector);
    }
  }

  private registerStyles(): void {
    // Per-document registry (GAP-078): the injected DOCUMENT is the
    // per-request document under SSR and the real document in the browser.
    const sheet = ngCoreStyleSheetFor(this.document);
    // An unstyled instance registers only the shared base rules below, like
    // PrimeNG, which loads its base style before the `$unstyled()` check in
    // `_loadThemeStyles`.
    const styled = !this.$unstyled();
    // Theme variable DEFINITIONS first — the structural CSS below refers to
    // them via dt()-resolved var(--u-*) references, which resolve to nothing
    // unless something also defines the properties. Idempotent per its own
    // has() guards; see registerThemeVariables' doc comment.
    if (styled) registerThemeVariables(sheet, this.componentName);
    registerHiddenAccessible(sheet);
    // GAP-124: the opt-in `.u-icon-spin` rule (class-scoped; see uix-styled icon-spin.ts).
    registerIconSpin(sheet);
    // GAP-098 (ADR-063): the component's scoped border-box rule, under its own
    // key, before the component CSS. A no-op for an empty name or no roots.
    if (styled) {
      registerBoxModel(sheet, this.componentName, scopeRootsOf(this.styleModule.classes));

      registerComponentCss(sheet, this.componentName, this.styleModule.css);
    }
  }
}
