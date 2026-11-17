# Angular UColorPicker

ID: angular.color-picker

Framework: angular; availability: public

## Authored interpretation

Color picker: a readonly preview input opens an overlay panel with a saturation/brightness square and a vertical hue strip; mouse selection writes a hex string, RGB object or HSB object to the form control.

## Framework surface

Extends UBaseEditableHolder directly (not UBaseInput), so it inherits the disabled signal input, $disabled, modelValue/$filled and the ControlValueAccessor methods, and has no fluid, variant, size or min/max inputs. Provides NG_VALUE_ACCESSOR via useExisting with multi and overrides writeControlValue. Selector u-color-picker; componentName colorpicker. Composes UOverlay (panel div with appendTo=body, rendered only while visible). Signal inputs: format (hex, rgb or hsb; default hex), defaultColor (default ff0000, a hex string without #) and autoZIndex (default true; declared but never read). Outputs: onChange (UColorPickerChangeEvent {originalEvent: Event; value: string | {r,g,b} | {h,s,b}}), onShow (void), onHide (void). Template: a readonly input type=text with a background color from the HSB state, aria-label Select color, aria-haspopup=true, aria-expanded bound to the overlay state, tabindex -1 when disabled; the panel holds a color square (mousedown) with a handle and a hue strip (mousedown) with a handle. The square and strip have no role, aria attribute, tabindex or key handler, so selection is mouse-only. Keyboard on the input: Space toggles the panel with preventDefault; Escape and Tab call hide() unconditionally, so onHide is emitted on each Escape or Tab even when the panel is already closed; Enter is not handled. These key handlers do not check $disabled themselves (show() and the click and mousedown handlers do). No click-outside handler exists, so the panel closes only through the input (click, Space, Escape, Tab). Dragging: mousedown on the square or strip returns early when disabled, then picks a value and binds document mousemove and mouseup listeners; the mouseup handler of that binding removes them. There is no ngOnDestroy, so a component destroyed mid-drag keeps the listeners until the next mouseup. Pixel math is fixed at 150 px: saturation and brightness are floor-ed clamped offsets, hue is floor(360 * (150 - clamped y) / 150); HSB values are clamped by validateHsb. Every pick calls writeModelValue, onModelChange and onModelTouched and emits onChange with the real mouse event. Conversion math is local: hsbToRgb rounds channels; rgbToHsb gives hue 300 for any gray (saturation 0 sets hue to -1 before the 60x scale and wrap); hexToRgb uses parseInt with bit shifts and no validation, so a 3-digit value such as #fff is read as {r:0,g:15,b:255} and an unparsable value as black. writeControlValue: a truthy value is converted by the current format (rgb through rgbToHsb, hsb taken as-is without validateHsb, hex through hexToHsb) with no shape checks; a falsy value uses defaultColor. It then calls setModelValue(value ?? getValueToUpdate()), so null or undefined stores the default color in the active format as modelValue; it does not call onModelChange and does not emit onChange. Changing format does not convert an existing model value. Host class cx('root') with no params; preview gets p-disabled while disabled. Owned source-only declarations: Hsb (interface) and colorPickerStyleModule (classes root, preview, panel, content, colorSelector, colorBackground, colorHandle, hue, hueHandle). Consumer availability: exported (UColorPicker, type UColorPickerChangeEvent) from the root barrel via @ultimate/ng/color-picker and from the @ultimate/ng/color-picker manifest subpath. No dedicated @ultimate/uix-styles export exists for this family: its CSS is hand-ported into the local style file. Aura registry key is colorpicker (folder and selector use the hyphenated name); aura-token-wiring.spec.ts lists one approved unresolved variable (--u-colorpicker-preview-border-color). That spec was not executed. There is no component-metadata record for this family (packages/component-metadata/src/records holds none for it). Inherits dt: Record<string, unknown>|undefined and unstyled: boolean|undefined from UBaseComponent; those declared inputs are not read anywhere in ng-core, so they are not evidence that unstyled suppresses registration. Standalone, OnPush, ViewEncapsulation.None. Style helper exports are source-only internals, not barrel exports or independent rendered components. The spec and stories files are excluded.

## Public exports

@ultimate/ng#UColorPicker
@ultimate/ng/color-picker#UColorPicker
@ultimate/ng#UColorPickerChangeEvent
@ultimate/ng/color-picker#UColorPickerChangeEvent

## Owned source and evidence

packages/ng/src/color-picker/index.ts
packages/ng/src/color-picker/color-picker.ts
packages/ng/src/color-picker/color-picker-style.ts

```text
packages/ng/src/color-picker/index.ts: export { UColorPicker }
packages/ng/src/color-picker/color-picker.ts: export class UColorPicker extends UBaseEditableHolder
packages/ng/src/color-picker/color-picker.ts: providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UColorPicker, multi: true }],
packages/ng/src/color-picker/color-picker.ts: autoZIndex = input(true, { transform: booleanAttribute });
packages/ng/src/color-picker/color-picker.ts: onChange = output<UColorPickerChangeEvent>();
packages/ng/src/color-picker/color-picker.ts: case "Tab":
        this.hide();
packages/ng/src/color-picker/color-picker.ts: document.addEventListener("mousemove", move);
packages/ng/src/color-picker/color-picker.ts: this.onChange.emit({ originalEvent: event, value });
packages/ng/src/color-picker/color-picker.ts: const hexValue = parseInt(hex.indexOf("#") > -1 ? hex.substring(1) : hex, 16);
packages/ng/src/color-picker/color-picker.ts: setModelValue(value ?? this.getValueToUpdate());
packages/ng/src/color-picker/color-picker.ts: <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('panel')">
packages/ng/src/color-picker/color-picker-style.ts: export const colorPickerStyleModule
packages/ng/package.json: "./color-picker": {
packages/ng/src/index.ts: export * from "@ultimate/ng/color-picker";
packages/ng-core/src/overlay/overlay.ts: selector: "[uOverlay]",
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
packages/themes/src/presets/aura/index.ts:     colorpicker: colorPicker,
```

## Relationships

package.ultimate.ng.color-picker → [angular.color-picker](angular.color-picker.md) (reconciled family alias)
package.ultimate.ng-core.base-editable-holder (pending cross-batch)
package.ultimate.ng-core.model-holder (pending cross-batch)
package.ultimate.ng-core.basecomponent (pending cross-batch)
package.ultimate.ng-core.overlay (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, local style module and behavioral spec exist; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Angular product suite for the numeric, date, color and file input families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{input-number,date-picker,color-picker,file-upload}/*.spec.ts'",
    "outcome": "not-run",
    "revision": "73cc77945ad2e4213695c2d140166822dc1ad12c",
    "limitations": "Not run by instruction to avoid heavy local load (no ng test, build or Storybook); node_modules is absent in the worktree. No product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking @ultimate/ng test. This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
