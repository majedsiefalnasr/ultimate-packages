# Angular UColorPicker

ID: angular.color-picker

Framework: angular; availability: public

## Authored interpretation

Color picker: a preview input opens an overlay panel (or an inline panel replaces it) with a saturation/brightness square and a vertical hue strip; mouse and touch selection writes a #rrggbb hex string, an RGB object or an HSB object to the form control.

## Framework surface

Extends UBaseEditableHolder directly (not UBaseInput), so it inherits the disabled signal input, $disabled, modelValue/$filled and the ControlValueAccessor methods, and has no fluid, variant, size or min/max inputs; pt, unstyled and dt come from UBaseComponent. Provides NG_VALUE_ACCESSOR via useExisting with multi and itself as U_PARENT_INSTANCE, and overrides writeControlValue. Selector u-color-picker; componentName colorpicker; hostDirectives [UBind], and ngAfterViewChecked sets the root attributes from ptms(['host','root']). Signal inputs: inline (booleanAttribute), format (hex, rgb or hsb; default hex), tabindex, inputId, autoZIndex (booleanAttribute, default true, passed to UOverlay), autofocus (applied through UAutoFocus), defaultColor (default ff0000), appendTo (UColorPickerAppendTo: 'self', 'body', an HTMLElement or an ElementRef; default 'self') and motionOptions (MotionOptions from @ultimate/uix-motion, merged over { name: 'u-anchored-overlay' }); invalid, required and name are accepted and never read by the template, as in PrimeNG. Outputs: onChange (UColorPickerChangeEvent {originalEvent: Event; value: UColorPickerValue}, where UColorPickerValue is a string, {r,g,b} or {h,s,b}), onShow (void), onHide (void). Public methods: show(), hide() and togglePanel(). Template: unless inline, a readonly input type=text (pt preview) with id from inputId, tabindex from the input, a disabled attribute while disabled, a background color from the HSB state, aria-label Select a color, aria-haspopup=true and aria-expanded bound to the overlay state. The panel (pt panel) renders in place when inline, otherwise only while open, inside UOverlay with appendTo and autoZIndex; it holds content (pt content), a color square (pt colorSelector; mousedown and touchstart) with colorBackground and colorHandle, and a hue strip (pt hue; mousedown and touchstart) with hueHandle. The square and strip have no role, aria attribute, tabindex or key handler, so selection is pointer-only, as in PrimeNG source (ADR-104 records the PrimeNG doc/source mismatch). Keyboard on the input: Space toggles the panel with preventDefault; Escape and Tab call hide(), which returns early when the panel is already closed, so onHide is not emitted then; Enter is not handled. The key handler does not check $disabled itself; the input carries the disabled attribute, and the click handler and drag start check $disabled. Opening aligns the panel with relativePosition (appendTo self) or absolutePosition from @ultimate/uix-utils/dom, emits onShow, starts the uix-motion enter animation and binds an outside click listener on the document (right button ignored), a window resize listener that hides the panel on non-touch devices, and a ConnectedOverlayScrollHandler from @ultimate/uix-utils/dom that hides it on a scroll of any scrollable ancestor; hiding unbinds them and runs the leave animation, after which onHide is emitted and the panel is removed. Dragging: a press on the square or strip returns early when disabled, ends any running drag, picks a value and binds document listeners (mousemove and mouseup, or a non-passive touchmove plus touchend and touchcancel) that read the pointer's clientX and clientY against the element's getBoundingClientRect, follow only the touch that started the drag, ignore moves while disabled, and are removed when the drag ends or, through DestroyRef, when the component is destroyed, which also unbinds the overlay listeners and cancels the motion. While a drag runs the root carries u-color-picker-dragging. Pixel math is fixed at 150 px: saturation and brightness are floor-ed clamped offsets, hue is floor(360 * (150 - clamped y) / 150); HSB values are clamped by validateHsb. Every pick calls writeModelValue and onModelChange and emits onChange with the real pointer event; focusing the input calls onModelTouched. The hex format writes #rrggbb. Conversion math is PrimeNG's: hsbToRgb rounds channels; rgbToHsb gives hue 300 for any gray (saturation 0 sets hue to -1 before the 60x scale and wrap); hexToRgb strips an optional # and uses parseInt with bit shifts and no validation, so a 3-digit value such as #fff is read as {r:0,g:15,b:255}, an unparsable value as black, and a non-string as black. writeControlValue: a truthy value is converted by the current format (rgb through rgbToHsb, hsb taken as-is without validateHsb, hex through hexToHsb) with no shape checks; a falsy value uses defaultColor. It then calls setModelValue(value ?? getValueToUpdate()), so null or undefined stores the default color in the active format as modelValue; it does not call onModelChange and does not emit onChange. Changing format does not convert an existing model value. Host class cx('root', {inline, dragging}) (u-color-picker-overlay unless inline); the preview gets p-disabled while disabled; the panel gets u-color-picker-panel-inline when inline and p-disabled while disabled. Owned source-only declarations: UColorPickerValue (type), UColorPickerAppendTo (type), Hsb (interface, not exported), ColorPickerRootClassesParams, ColorPickerPreviewClassesParams, ColorPickerPanelClassesParams and colorPickerStyleModule (classes root, preview, panel, content, colorSelector, colorBackground, colorHandle, hue, hueHandle). Consumer availability: exported (UColorPicker, type UColorPickerChangeEvent) from the root barrel via @ultimate/ng/color-picker and from the @ultimate/ng/color-picker manifest subpath. The CSS imports the shared @ultimate/uix-styles/colorpicker module (ADR-082, ADR-104); that dependency is described here and not linked, as in the choice-range Knob record. Aura registry key is colorpicker (folder and selector use the hyphenated name); aura-token-wiring.spec.ts lists one approved unresolved variable (--u-colorpicker-preview-focus-border-color, the upstream focus border reference that Aura does not define). That spec was not executed for this inventory. There is no component-metadata record for this family (packages/component-metadata/src/records holds none for it). Excluded deliberately (ADR-104): PrimeNG's styleClass, showTransitionOptions and hideTransitionOptions (deprecated), overlayOptions and the pcOverlay section. Standalone, OnPush, ViewEncapsulation.None. Style helper exports are source-only internals, not barrel exports or independent rendered components. The spec and stories files are excluded.

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
packages/ng/src/color-picker/color-picker.ts: { provide: NG_VALUE_ACCESSOR, useExisting: UColorPicker, multi: true },
packages/ng/src/color-picker/color-picker.ts: { provide: U_PARENT_INSTANCE, useExisting: UColorPicker },
packages/ng/src/color-picker/color-picker.ts: hostDirectives: [UBind],
packages/ng/src/color-picker/color-picker.ts: autoZIndex = input(true, { transform: booleanAttribute });
packages/ng/src/color-picker/color-picker.ts: [autoZIndex]="autoZIndex()"
packages/ng/src/color-picker/color-picker.ts: onChange = output<UColorPickerChangeEvent>();
packages/ng/src/color-picker/color-picker.ts: case "Tab":
        this.hide();
packages/ng/src/color-picker/color-picker.ts: if (this.inline() || !this.overlayVisible()) return;
packages/ng/src/color-picker/color-picker.ts: const scrollHandler = new ConnectedOverlayScrollHandler(host, () => this.hide());
packages/ng/src/color-picker/color-picker.ts: this.document.addEventListener("touchmove", move, { passive: false });
packages/ng/src/color-picker/color-picker.ts: private readonly destroyRegistration = inject(DestroyRef).onDestroy(() => {
packages/ng/src/color-picker/color-picker.ts: this.onChange.emit({ originalEvent: event, value });
packages/ng/src/color-picker/color-picker.ts: return "#" + this.hsbToHex(this.hsbValue());
packages/ng/src/color-picker/color-picker.ts: const hexValue = parseInt(hex.indexOf("#") > -1 ? hex.substring(1) : hex, 16);
packages/ng/src/color-picker/color-picker.ts: setModelValue(value ?? this.getValueToUpdate());
packages/ng/src/color-picker/color-picker-style.ts: import { style as colorPickerStyle } from "@ultimate/uix-styles/colorpicker";
packages/ng/src/color-picker/color-picker-style.ts: export const colorPickerStyleModule
packages/uix-styles/package.json: "./colorpicker": {
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
    "behavior": "Component, shared style module and behavioral spec exist; source inspection is not a passing test."
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
