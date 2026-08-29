import { Directive, booleanAttribute, input } from "@angular/core";

/**
 * Ultimate-owned reimplementation of PrimeNG's `BaseIcon`
 * (`primeng/icons/baseicon`). PrimeNG's real `BaseIcon` is a host-only
 * component: its selector is an attribute (`[data-p-icon="..."]`) applied
 * directly to an `<svg>` element the *consumer* writes in their own
 * template, with `width`/`height`/`viewBox`/`fill`/`xmlns` bound as host
 * attributes on that same `<svg>` — there is no nested `<svg>` child, and
 * no `role`/`aria-label` anywhere in PrimeNG's icon source (accessibility
 * is left to the consumer; e.g. PrimeNG's own `Button` passes
 * `[attr.aria-hidden]="true"` on its loading spinner).
 *
 * This diverges deliberately from that shape per the Task 9 spec: each
 * Ultimate icon is an ordinary *element*-selector component
 * (`<u-spinner-icon />`) that renders its own inline `<svg role="img">`
 * carrying `[attr.aria-label]`, so every icon is accessible out of the box
 * without relying on the consumer to wire ARIA attributes. `role="img"` and
 * `aria-label` are the confirmed accessibility RETAIN items from the spec.
 *
 * `UBaseIcon` is a `Directive`, not a `Component` — Angular component
 * inheritance only inherits class members (inputs/methods), never a parent
 * component's template, so the shared `<svg role="img" aria-label>` markup
 * cannot live in a base *component* template and be reused by subclasses;
 * each icon component repeats that wrapper markup itself and inherits only
 * the `label`/`spin` inputs from this base, matching the pattern
 * `UBaseComponent` already establishes for cross-cutting inputs.
 *
 * `spin` (renders PrimeNG's `p-icon-spin` CSS animation class) is kept as
 * a passthrough input for callers per the real source's contract; applying
 * the animation class itself is left to each icon's own template/style.
 */
@Directive({ standalone: true })
export abstract class UBaseIcon {
  /** Reflected as the rendered `<svg>`'s `aria-label`. */
  label = input<string | undefined>(undefined, { alias: "aria-label" });

  /** Matches PrimeNG's `spin` input (spin animation flag). */
  spin = input(false, { transform: booleanAttribute });
}
