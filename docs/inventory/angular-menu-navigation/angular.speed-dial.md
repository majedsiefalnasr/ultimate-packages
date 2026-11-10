# Angular USpeedDial

ID: angular.speed-dial

Framework: angular; availability: public

## Authored interpretation

Floating toggle action button revealing a directionally arranged list of secondary command buttons.

## Framework surface

Selector u-speed-dial. Inputs model: UMenuItem[] = [], icon?: string, direction=up, type=linear, radius=0 and transitionDelay=30 (numberAttribute), mask=false, disabled=false, closeOnEscape=true (booleanAttribute), ariaLabel?: string. Source-only SpeedDialDirection union: up/down/left/right/up-left/up-right/down-left/down-right; SpeedDialType: linear/circle/semi-circle/quarter-circle. Outputs onVisibleChange: boolean, onClick: MouseEvent, onShow/onHide: void. Public show()/hide() update visibility and emit visibility plus transition events. Toggle click changes visibility and emits onClick; action calls command with {originalEvent,item} then hides. document:keydown.escape checks closeOnEscape; mask click hides. listDirectionStyle, getItemStyle and calculatePointStyle own flex direction, stagger delay and trigonometric point placement; keyboard/index helpers wrap among eligible action buttons using direction-dependent axes. Hidden entries remain in DOM with a hidden class; action tabindex depends on disabled/visible state. speedDialStyleModule is source-only with inline direction/open/hidden parameter shapes; local speeddial token CSS controls scale/opacity and pointer-events. Extends UBaseComponent, which owns shared component lifecycle/style handling. Consumer availability: @ultimate/ng#USpeedDial, @ultimate/ng/speed-dial#USpeedDial via selected root/family barrels and manifest entries; source-only exports mentioned above are not package barrel API. All remaining class state, event/DOM handlers and local css/classes constants in the listed files are implementation parts owned by this record, not independent products. Aura preset registers the speeddial component token family; this is source configuration, not rendered-theme verification. Metadata relationship is not inferred from a matching component name; this record relies on direct implementation and styling evidence. Inherited inputs dt?: Record<string,unknown> and unstyled?: boolean come from UBaseComponent; its ngOnInit registers theme variables and component CSS through the per-document stylesheet. Shared UMenuItem supports optional label/icon/url/routerLink/command/items/separator/disabled/visible/target/tooltip; each component consumes only the fields described above, not automatically every field in the shared type.

## Public exports

@ultimate/ng#USpeedDial
@ultimate/ng/speed-dial#USpeedDial

## Owned source and evidence

packages/ng/src/speed-dial/index.ts
packages/ng/src/speed-dial/speed-dial-style.ts
packages/ng/src/speed-dial/speed-dial.ts

```text
packages/ng/src/speed-dial/speed-dial.ts: export class USpeedDial extends UBaseComponent
packages/ng/src/speed-dial/index.ts: export { USpeedDial }
packages/ng/src/index.ts: @ultimate/ng/speed-dial
packages/ng/package.json: "./speed-dial"
packages/ng/src/speed-dial/speed-dial-style.ts: export const speedDialStyleModule = { css, classes };
packages/themes/src/presets/aura/index.ts:     speeddial:
packages/ng-core/src/api/types.ts: command?: (event: unknown) => void;
packages/ng-core/src/basecomponent/base-component.ts: registerThemeVariables(sheet, this.componentName);
```

## Relationships

package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.api (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, owned composition/types/helpers/style source and supporting specs exist; source inspection is not execution."
  },
  {
    "state": "not-run",
    "behavior": "Angular speed-dial product checks NOT RUN.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/speed-dial/*.spec.ts'",
    "outcome": "not-run",
    "revision": "e661ec4539053d25da39594441225520e5dd07ab",
    "limitations": "Explicit resource limits prohibit installs, builds, Vitest, ng test, Storybook and watchers. No product runtime success or failure inferred from source/test presence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs Test step invokes root pnpm run test, whose recursive command includes Angular test. Configuration only: no successful CI execution or branch protection inferred; test:scripts selects provenance tests, not these inventory tests.",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on !cancelled() and classification scope != docs; dependencies can prevent assertions. Remote CI not observed."
  }
]
```
