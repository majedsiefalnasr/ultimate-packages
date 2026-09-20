<template>
  <ul :class="depth === 0 ? cx('list') : cx('sublist')" role="tree">
    <li v-if="nodes.length === 0" :class="cx('emptyMessage')" role="treeitem">
      {{ emptyMessage }}
    </li>
    <li
      v-for="node in nodes"
      :key="node.key"
      role="treeitem"
      :aria-selected="isSelected(node)"
      :aria-expanded="node.children.length > 0 ? activePath.includes(node.key) : null"
      :class="cx('option')"
    >
      <div
        :class="cx('optionContent', { selected: isSelected(node), disabled: isDisabled(node.option) })"
        @click="$emit('option-click', node)"
      >
        <span>{{ getLabel(node.option) }}</span>
        <span v-if="node.children.length > 0" :class="cx('groupIcon')" aria-hidden="true">&#9656;</span>
      </div>
      <CascadeSelectSublist
        v-if="node.children.length > 0 && activePath.includes(node.key)"
        :nodes="node.children"
        :depth="depth + 1"
        :active-path="activePath"
        :selected-value="selectedValue"
        :get-label="getLabel"
        :get-value="getValue"
        :is-disabled="isDisabled"
        :cx="cx"
        :empty-message="emptyMessage"
        @option-click="$emit('option-click', $event)"
      />
    </li>
  </ul>
</template>

<script>
// Recursive submenu renderer for UCascadeSelect (CascadeSelect.vue) — kept
// as a small separate, self-referencing component (Vue's Options API
// resolves a component's own `name` within its own `components` map,
// enabling recursion) rather than inlining recursion in the parent, since
// Vue templates have no direct recursive-template-outlet mechanism the way
// Angular's `ng-template`/`ngTemplateOutlet` does. This mirrors real
// PrimeVue's own two-component split (CascadeSelect.vue +
// CascadeSelectSub.vue, .vendor-extracted/vue/cascadeselect/) — the same
// real structure, not an invented pattern.
export default {
  name: "CascadeSelectSublist",
  props: {
    nodes: { type: Array, required: true },
    depth: { type: Number, required: true },
    activePath: { type: Array, required: true },
    selectedValue: { default: null },
    getLabel: { type: Function, required: true },
    getValue: { type: Function, required: true },
    isDisabled: { type: Function, required: true },
    cx: { type: Function, required: true },
    emptyMessage: { type: String, default: "" },
  },
  emits: ["option-click"],
  methods: {
    isSelected(node) {
      return node.children.length === 0 && this.getValue(node.option) === this.selectedValue;
    },
  },
};
</script>
