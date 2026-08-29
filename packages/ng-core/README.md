# @ultimate/ng-core

Angular-specific foundation for the Ultimate Platform: base component hierarchy, overlay/focus-trap infrastructure, icons, and minimal config.

**Status:** unstable (pre-1.0). No semver guarantee yet.

## Architecture

`ng-core`'s `UBaseComponent`/`UBaseEditableHolder` hierarchy is **Option B**: informed by PrimeNG's own `BaseComponent`/`BaseEditableHolder` pattern, but independently authored and deliberately scoped down. It covers DI wiring, lifecycle hooks, and `@ultimate/uix-styled`-backed style registration only.

PrimeNG's full passthrough (`pt`/`ptOptions`/`ptm`/`ptms`/`ptmo`) system, its full global-config surface, and its `$parentInstance` DI-token lookup are explicitly out of scope for this phase (deferred, needs architecture decision) — see `docs/architecture/PROVENANCE.md` and `docs/architecture/provenance/ng-core.json` for the full provenance record.

## Modules

- `basecomponent` — `UBaseComponent`, the abstract base every `ng` component/directive extends: DI wiring (`document`, `platformId`, `el`, `renderer`, `config`), the `dt`/`unstyled` input pair, a `cx()` class-name-slot resolver, and `ngOnInit` registration of the component's style module with `@ultimate/uix-styled`'s `StyleSheet` service (once per `componentName`).

## Usage

```typescript
import { UBaseComponent } from "@ultimate/ng-core";

@Component({
  standalone: true,
  selector: "u-example",
  template: `<div [class]="cx('root')"></div>`,
})
class ExampleComponent extends UBaseComponent {
  protected override readonly componentName = "example";
  protected override readonly styleModule = {
    css: ".u-example-root { }",
    classes: { root: () => "u-example-root" },
  };
}
```

## Dependencies

Depends on `@ultimate/uix-utils`, `@ultimate/uix-styled`, `@ultimate/uix-motion`, `@ultimate/uix-styles` (workspace), and `tslib`. Peers on `@angular/core`, `@angular/common`, `@angular/forms`, `@angular/platform-browser`, and `rxjs`.
