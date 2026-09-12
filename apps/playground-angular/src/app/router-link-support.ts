import { type Provider, type EnvironmentProviders } from "@angular/core";
import { ActivatedRoute, provideRouter } from "@angular/router";

/**
 * Providers satisfying `UMenu`'s internal `RouterModule` import (it binds
 * `[routerLink]="item.disabled ? null : (item.routerLink ?? null)"` on
 * every rendered `<a>`, always `null` for this harness's fixture data) —
 * without adding any real routing/navigation behavior. Neither
 * `withRoutes()` nor `withAppShell()` is used; `provideRouter([])`
 * configures zero routes, so nothing ever matches and no navigation
 * occurs.
 *
 * `RouterLink`'s own factory (`@angular/router`'s `_router_module-chunk`)
 * declares a required, non-optional `ActivatedRoute` constructor
 * dependency. With zero configured routes there is no real navigation to
 * produce one, and — confirmed empirically here — `provideRouter([])`
 * alone leaves `ActivatedRoute` unavailable to any `RouterLink` instance
 * beyond the first one hydrated: a real NG0201 "no provider" error that
 * silently aborted hydration of every sibling rendered after `UMenu`'s
 * second `<a [routerLink]>` (Button/Checkbox/Dialog above it hydrated
 * fine; Paginator/Scroller/Table below it did not). A plain
 * `ActivatedRoute` provider below resolves this: every `routerLink`
 * binding in this harness is always `null`, so `route`'s only real
 * consumer inside `RouterLink` (relative-navigation URL resolution via
 * `createUrlTree`) is never exercised — the stub just needs to exist
 * without throwing.
 */
export function provideRouterLinkSupport(): (Provider | EnvironmentProviders)[] {
  return [
    provideRouter([]),
    {
      provide: ActivatedRoute,
      useValue: new ActivatedRoute(),
    },
  ];
}
