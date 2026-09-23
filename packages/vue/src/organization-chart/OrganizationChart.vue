<script>
import { h } from "vue";
import { createBaseOrganizationChart } from "./BaseOrganizationChart";

export default {
  name: "UOrganizationChart",
  extends: createBaseOrganizationChart(),
  data() {
    return { localCollapsedKeys: { ...(this.collapsedKeys ?? {}) } };
  },
  watch: {
    collapsedKeys(value) {
      this.localCollapsedKeys = { ...(value ?? {}) };
    },
  },
  methods: {
    toggleCollapse(node) {
      if (!this.collapsible || node.key == null) return;
      const keys = { ...this.localCollapsedKeys };
      if (keys[node.key]) delete keys[node.key];
      else keys[node.key] = true;
      this.localCollapsedKeys = keys;
      this.$emit("update:collapsedKeys", keys);
    },
    toggleSelect(node) {
      if (!this.selectionMode || node.selectable === false || node.key == null) return;
      let keys = { ...(this.selectionKeys ?? {}) };
      if (keys[node.key]) delete keys[node.key];
      else {
        if (this.selectionMode === "single") keys = {};
        keys[node.key] = true;
      }
      this.$emit("update:selectionKeys", keys);
    },
    renderNode(node) {
      if (!node) return null;
      const children = node.children ?? [];
      const expanded = !this.collapsible || !this.localCollapsedKeys[node.key];
      const selected = Boolean(this.selectionKeys?.[node.key]);
      return h(
        "div",
        {
          class: [this.cx("node"), node.className],
          role: "treeitem",
          "aria-expanded": children.length ? expanded : undefined,
          "aria-selected": this.selectionMode ? selected : undefined,
          "data-pc-section": "node",
          "data-selected": selected ? "true" : undefined,
        },
        [
          h(
            "div",
            {
              class: this.cx("nodeContent"),
              tabindex: this.selectionMode ? 0 : undefined,
              onClick: () => this.toggleSelect(node),
              onKeydown: (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  this.toggleSelect(node);
                }
              },
            },
            [
              node.label,
              this.collapsible && children.length
                ? h(
                    "button",
                    {
                      type: "button",
                      "aria-label": "Toggle " + (node.label ?? "node"),
                      "aria-expanded": expanded,
                      onKeydown: (event) => event.stopPropagation(),
                      onClick: (event) => {
                        event.stopPropagation();
                        this.toggleCollapse(node);
                      },
                    },
                    [h("span", { "aria-hidden": "true" }, expanded ? "−" : "+")]
                  )
                : null,
            ]
          ),
          expanded && children.length
            ? h(
                "div",
                { class: this.cx("children"), role: "group" },
                children.map((child) => this.renderNode(child))
              )
            : null,
        ]
      );
    },
  },
  render() {
    return h(
      "div",
      {
        class: this.cx("root"),
        role: "tree",
        "aria-label": "Organization chart",
        "aria-multiselectable": this.selectionMode === "multiple",
      },
      [this.renderNode(this.value)]
    );
  },
};
</script>
