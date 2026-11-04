# Angular UCascadeSelect

ID: angular.cascade-select

Framework: angular; availability: public

## Authored interpretation

Single-leaf dropdown over nested option groups: a combobox trigger opens an overlay tree where clicking a group drills into its submenu and clicking a leaf selects it.

## Framework surface

Extends UBaseEditableHolder directly (not UBaseInput), so it inherits the disabled signal input, $disabled, modelValue/$filled and the ControlValueAccessor methods writeValue/registerOnChange/registerOnTouched/setDisabledState, and has no fluid, variant, size, pattern, min, max or step inputs. Standalone, OnPush, ViewEncapsulation.None; provides NG_VALUE_ACCESSOR via useExisting with multi and overrides writeControlValue. Selector u-cascade-select; componentName cascadeselect (the registry key differs from the folder and selector names). Imports UOverlay and NgTemplateOutlet. Signal inputs: options, optionLabel, optionValue, optionGroupChildren (default "items", names the child array property), optionDisabled, placeholder, emptyMessage. There are no ariaLabel, inputId, filter or showClear inputs. Outputs: onChange (UCascadeSelectChangeEvent {originalEvent, value}), onFocus (Event, the real DOM event), onBlurEmit (Event, synthetic new Event("blur")); there is no onClear. onChange is emitted only when a leaf is clicked. Tree model: a non-exported ProcessedOption {option, key, parentKey, children} is built recursively by buildTree (key is the index at the root and <parentKey>_<index> below); an option is a group only when option[optionGroupChildren()] is a non-empty array. findPathToValue matches leaf nodes only, so a group's own value is never matched. The label is placeholder() ?? "" when modelValue is null/undefined or matches no leaf, otherwise the matched leaf's label; the placeholder class applies only when modelValue() == null. Template: trigger span role=combobox with aria-haspopup=tree, aria-expanded and aria-disabled and tabindex; no aria-label, aria-controls or aria-activedescendant. The overlay renders a recursive ng-template #sublist through NgTemplateOutlet: ul role=tree (cx('list') at the root, cx('sublist') nested) with li role=treeitem (aria-selected bound on every item and true only for the selected leaf, aria-expanded bound to isActiveNode for groups and null for leaves) whose inner div cx('optionContent') takes the click and mouseenter handlers; onOptionMouseEnter is an intentional no-op (its body is only void _node). A group icon span is aria-hidden. The empty-message li role=treeitem renders only for an empty list. Behaviour: show() opens the overlay and, when modelValue != null and a leaf matches, sets activeOptionPath to the ancestor keys of that leaf; hide() clears it. onOptionClick returns for disabled options (no drill, no select); for a group it collapses an active node (removing its key and descendant keys) or expands it with [...path.filter(key => key !== node.parentKey), node.key]; read literally, expanding a group below the root level removes its parent's key from the path, and the template renders a node's children only while isActiveNode(node) is true, so by reading the source the parent's submenu (which contains the expanded group) stops rendering (not executed); expanding a root group filters nothing out because root parentKey is "", so sibling root groups can stay open together. A leaf click writes the value, calls onModelChange and onModelTouched, emits onChange and hides. The trigger keydown (ignored when disabled) opens on Enter/NumpadEnter/Space/ArrowDown when closed (preventDefault is called even when already open), closes on Escape while open and closes on Tab; options have no tabindex and no keyboard path selects or navigates options. onOptionClick does not check $disabled(). Overlay composition: UOverlay moves the panel to document.body while visible; visibleChange is not bound; no outside-click listener exists in cascade-select.ts. Public API: UCascadeSelect (class), UCascadeSelectChangeEvent (type). Owned source-only declarations: ProcessedOption (non-exported interface in cascade-select.ts), CascadeSelectClassesParams (disabled, filled, fluid, overlayVisible, placeholder, selected, focused) and cascadeSelectStyleModule in cascade-select-style.ts; the last two are not barrel exports. Style facts: classesParams passes fluid as the constant false, so u-cascade-select-fluid is never emitted, and nodeClassesParams passes focused as the constant false, so u-cascade-select-option-focused is never emitted. Option classes u-cascade-select-option-selected and -disabled match CSS rules (child combinator to option-content). The root p-cascadeselect-open and p-disabled match emitted classes. Class keys: root, label, dropdown, overlay, list, sublist, option, optionContent, groupIcon, emptyMessage. Theme: the Aura components registry key cascadeselect (assigned from the cascadeSelect export of cascade-select.ts in packages/themes/src/presets/aura/index.ts) equals componentName cascadeselect. Root @ultimate/ng re-exports this family (barrel line export * from "@ultimate/ng/cascade-select"); it is also exposed via the @ultimate/ng/cascade-select manifest subpath. No outputs besides those listed; no ngOnInit/ngOnDestroy override, HostListener, document listener, ContentChild/ContentChildren or virtual scroll (Scroller) usage exists in cascade-select.ts. dt and unstyled are inherited UBaseComponent inputs and nothing in this component reads them. Component-metadata: no component-metadata record exists for cascade-select (packages/component-metadata/src/records has button, checkbox, dialog, menu, paginator, scroller, table, tooltip only). Styles: No dedicated @ultimate/uix-styles/cascade-select export exists; the CSS is hand-ported inside cascade-select-style.ts. The generated cascade-select.spec.ts and cascade-select.stories.ts are excluded supporting files.

## Public exports

@ultimate/ng#UCascadeSelect
@ultimate/ng/cascade-select#UCascadeSelect
@ultimate/ng#UCascadeSelectChangeEvent
@ultimate/ng/cascade-select#UCascadeSelectChangeEvent

## Owned source and evidence

packages/ng/src/cascade-select/index.ts
packages/ng/src/cascade-select/cascade-select.ts
packages/ng/src/cascade-select/cascade-select-style.ts

```text
packages/ng/src/cascade-select/index.ts: export { UCascadeSelect }
packages/ng/src/cascade-select/cascade-select.ts: export class UCascadeSelect extends UBaseEditableHolder
packages/ng/src/cascade-select/cascade-select.ts: optionGroupChildren = input("items");
packages/ng/src/cascade-select/cascade-select.ts: interface ProcessedOption {
packages/ng/src/cascade-select/cascade-select.ts: <ul [class]="parentKey === '' ? cx('list') : cx('sublist')" role="tree">
packages/ng/src/cascade-select/cascade-select.ts: [attr.aria-haspopup]="'tree'"
packages/ng/src/cascade-select/cascade-select.ts: protected onOptionMouseEnter(_node: ProcessedOption): void {
packages/ng/src/cascade-select/cascade-select.ts: : [...path.filter((key) => key !== node.parentKey), node.key]
packages/ng/src/cascade-select/cascade-select.ts: @if (node.children.length > 0 && isActiveNode(node)) {
packages/ng/src/cascade-select/cascade-select.ts: focused: false,
packages/ng/src/cascade-select/cascade-select-style.ts: export const cascadeSelectStyleModule
packages/ng/src/cascade-select/cascade-select-style.ts: export interface CascadeSelectClassesParams
packages/ng/src/cascade-select/cascade-select.ts: providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UCascadeSelect, multi: true }],
packages/ng/src/cascade-select/cascade-select.ts: <div uOverlay [visible]="overlayVisible()" appendTo="body" [class]="cx('overlay')">
packages/themes/src/presets/aura/index.ts:     cascadeselect: cascadeSelect,
.github/workflows/ci.yml: run: pnpm run test
packages/ng/package.json: "test": "ng test --project=ng"
```

## Relationships

package.ultimate.ng.cascade-select → [angular.cascade-select](angular.cascade-select.md) (reconciled family alias)
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
    "behavior": "Bounded Angular product suite for the option-selection families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/ng exec ng test --project=ng --watch=false --include='src/{autocomplete,select,multi-select,cascade-select,listbox}/*.spec.ts'",
    "outcome": "not-run",
    "revision": "f8fc98fc26ad56886dfe9af8714fb6b6f66e78a7",
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
