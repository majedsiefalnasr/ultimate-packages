# Vue UCascadeSelect

ID: vue.cascade-select

Framework: vue; availability: public

## Authored interpretation

Single-value selector over a tree of options: a trigger opens an overlay with a recursive nested list in which group nodes expand and leaf nodes are selected.

## Framework surface

UCascadeSelect (Options API SFC CascadeSelect.vue, name "UCascadeSelect") and createBaseCascadeSelect (BaseCascadeSelect.ts) plus cascadeSelectStyleModule and CascadeSelectClassesParams (cascade-select-style.ts; neither style export is re-exported from index.ts). CascadeSelectSublist.vue (name "CascadeSelectSublist") is an owned internal recursive renderer registered locally and not exported from index.ts. Base factory chain: createBaseCascadeSelect extends createBaseInput() over createBaseEditableHolder (size, fluid, variant, modelValue, defaultValue, update:modelValue, value-change, dValue, filled, writeValue); the factory shadows cx() and mounted() and registers the style under the name cascadeselect, which is also the Aura registry key (the family and style module are named cascade-select). Declared props: options, optionLabel, optionValue, optionGroupChildren ("items"), optionDisabled, placeholder, disabled, emptyMessage ("No results found"), appendTo ("body"), plus inherited size, fluid, variant, modelValue and defaultValue. There is no inputId, ariaLabel, filter or showClear prop. Emits declared: change, focus, blur, select. change is declared and never emitted; focus and blur forward the trigger's native events; select carries { value } only, with no originalEvent. CascadeSelectSublist emits option-click (internal) with the processed node, re-emitted up each level. Writes use writeValue(value) without an event. No slots; no v-model/defineModel declaration. Tree: processedOptions computed calls buildTree, which maps each option to { option, key, parentKey, children } with an index-path key ("0", "0_1", …) and children read from option[optionGroupChildren] when it is an array; a node with an empty or missing child array is a leaf. Only leaves are selectable and only leaves can match the model: findPathToValue compares getOptionValue against dValue for leaves only, so a model value equal to a group's value renders the placeholder; isSelected in CascadeSelectSublist is likewise leaf-only. activeOptionPath is an array of node keys. onOptionClick returns for a disabled node (option-level optionDisabled only); a group click removes the key and its descendant keys when already active, otherwise it filters out only the entry equal to node.parentKey and appends node.key. Root-level groups have parentKey "" so nothing is removed and several root groups can be open at once; a nested group removes its parent's key, which unmounts the parent's sublist (rendered only while activePath includes the parent key) containing the clicked group, so groups two or more levels below the root cannot be expanded visibly. show() sets activeOptionPath to the ancestor keys of the selected leaf when dValue is not null; hide() clears it. A leaf click writes the value, emits select and hides. Template: trigger span role="combobox" with aria-haspopup="tree", aria-expanded, aria-disabled, tabindex 0 or -1 and a label of the selected leaf's label or the placeholder; a dropdown div role="button" aria-hidden; UPortal (appendTo) containing the overlay div and CascadeSelectSublist. The sublist renders ul role="tree" at every depth (nested lists are also role="tree"), li role="treeitem" keyed by node.key (the other four families key by index), aria-selected, aria-expanded only for groups (null for leaves), and an emptyMessage li role="treeitem" when nodes is empty. No treeitem carries aria-disabled and there is no aria-activedescendant, aria-controls or aria-label. Keyboard (event.code on the trigger): Enter, NumpadEnter, Space and ArrowDown open the overlay when closed and call preventDefault; Escape hides when open. No keyboard drill-down or focus within the tree, no Tab handling (blur emits blur without hiding) and no outside-click handler; the overlay also stays open when disabled becomes true (no watcher). No Home, End or filtering. Option-click handlers never read the component disabled prop: onOptionClick checks only the node's option-level disabled state; the disabled prop guards the trigger click and key handler, not the tree items. Styles (cascade-select-style.ts, hand-ported, no @ultimate/uix-styles import, tokens through dt('cascadeselect.…')): root classes u-cascade-select u-component p-inputwrapper with p-disabled, p-cascadeselect-open and p-inputwrapper-filled; styleParams passes fluid but the root class map has no fluid class and no fluid rule exists (no fluid class is applied); keys label (placeholder), dropdown, overlay, list, sublist, option, optionContent (selected, disabled), groupIcon and emptyMessage are all used. Only here among the five families is a z-index set (z-index: 1 on .u-cascade-select-sublist, positioned absolute at inset-inline-start 100%). The inherited size and variant props are never read and there is no invalid prop. Theme: Aura registry key cascadeselect (value cascadeSelect), which differs from the family name cascade-select. No component-metadata record exists. cascade-select.spec.ts and cascade-select.stories.ts are excluded supporting files.

## Public exports

@ultimate/vue#UCascadeSelect
@ultimate/vue/cascade-select#UCascadeSelect
@ultimate/vue#createBaseCascadeSelect
@ultimate/vue/cascade-select#createBaseCascadeSelect

## Owned source and evidence

packages/vue/src/cascade-select/BaseCascadeSelect.ts
packages/vue/src/cascade-select/CascadeSelect.vue
packages/vue/src/cascade-select/CascadeSelectSublist.vue
packages/vue/src/cascade-select/index.ts
packages/vue/src/cascade-select/cascade-select-style.ts

```text
packages/vue/src/cascade-select/CascadeSelect.vue: name: "UCascadeSelect",
packages/vue/src/cascade-select/CascadeSelect.vue: emits: ["change", "focus", "blur", "select"],
packages/vue/src/cascade-select/CascadeSelect.vue: this.$emit("select", { value });
packages/vue/src/cascade-select/CascadeSelect.vue: children: childrenSource.length > 0 ? this.buildTree(childrenSource, key) : [],
packages/vue/src/cascade-select/CascadeSelect.vue: : [...this.activeOptionPath.filter((key) => key !== node.parentKey), node.key];
packages/vue/src/cascade-select/CascadeSelectSublist.vue: name: "CascadeSelectSublist",
packages/vue/src/cascade-select/CascadeSelectSublist.vue: :key="node.key"
packages/vue/src/cascade-select/CascadeSelectSublist.vue: return node.children.length === 0 && this.getValue(node.option) === this.selectedValue;
packages/vue/src/cascade-select/BaseCascadeSelect.ts: extends: createBaseInput(),
packages/vue/src/cascade-select/BaseCascadeSelect.ts: registerComponentStyle("cascadeselect", cascadeSelectStyleModule);
packages/vue/src/cascade-select/cascade-select-style.ts: export const cascadeSelectStyleModule
packages/vue/src/cascade-select/cascade-select-style.ts: z-index: 1;
packages/vue/src/cascade-select/index.ts: createBaseCascadeSelect
packages/vue/src/index.ts: export * from "./cascade-select";
packages/vue/package.json: "./cascade-select": {
```

## Relationships

package.ultimate.vue.cascade-select → [vue.cascade-select](vue.cascade-select.md) (reconciled family alias)
package.ultimate.vue-core.base (pending cross-batch)
package.ultimate.vue-core.styling (pending cross-batch)
package.ultimate.vue-core.overlay (pending cross-batch)
package.ultimate.themes.presets (pending cross-batch)

## Verification

```text
[
  {
    "state": "implemented",
    "behavior": "Component, declared props and local style module exist in source with a colocated spec; source inspection is not a passing test."
  },
  {
    "state": "not-run",
    "behavior": "Bounded Vue product spec for the option-selection families was not executed for this inventory.",
    "command": "pnpm --filter @ultimate/vue exec vitest run src/autocomplete/ src/cascade-select/ src/listbox/ src/multi-select/ src/select/",
    "outcome": "not-run",
    "revision": "ba145d8cfc110bae18e4787a1242d51e38da9cd1",
    "limitations": "Not run by instruction to avoid heavy local load (no vitest, build or Storybook); no product or host repair attempted; presence of spec files is not pass evidence."
  },
  {
    "state": "ci-enforced",
    "behavior": "Configured non-docs CI Test step runs root pnpm run test, recursively invoking the @ultimate/vue test script (vitest run). This is workflow configuration evidence only, not a successful CI execution or branch-protection claim. Scoped inventory Node tests are not included in test:scripts (provenance-only glob).",
    "workflow": ".github/workflows/ci.yml",
    "limitations": "Conditional on classification scope != docs and !cancelled(); upstream steps/dependencies can prevent assertions. No remote CI observed."
  }
]
```
