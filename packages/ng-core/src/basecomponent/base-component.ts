import { Directive, ElementRef, PLATFORM_ID, Renderer2, inject, input } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { cn } from "@ultimate/uix-utils/classnames";
import { UltimateConfig } from "../config/ultimate-config";
import { ngCoreStyleSheet } from "./style-sheet";

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
    const resolver = this.styleModule.classes[key];
    const resolved = typeof resolver === "function" ? resolver(params) : resolver;
    return cn(resolved);
  }

  ngOnInit(): void {
    if (!ngCoreStyleSheet.has(this.componentName)) {
      ngCoreStyleSheet.add(this.componentName, this.styleModule.css);
    }
  }
}
