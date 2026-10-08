import { onBeforeUnmount, onMounted, ref } from "vue";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UDrawer } from "./index";

const meta: Meta<typeof UDrawer> = {
  title: "Vue/Drawer",
  component: UDrawer,
};

export default meta;
type Story = StoryObj<typeof UDrawer>;

export const Default: Story = {
  render: () => ({
    components: { UDrawer },
    setup() {
      const visible = ref(false);
      return { visible };
    },
    template: `
      <div>
        <button @click="visible = true">Show drawer</button>
        <UDrawer v-model:visible="visible" header="Menu">Drawer body content.</UDrawer>
      </div>
    `,
  }),
  args: {},
};

export const RightPosition: Story = {
  render: () => ({
    components: { UDrawer },
    setup() {
      const visible = ref(false);
      return { visible };
    },
    template: `
      <div>
        <button @click="visible = true">Show drawer</button>
        <UDrawer v-model:visible="visible" header="Settings" position="right">Right-positioned drawer.</UDrawer>
      </div>
    `,
  }),
};

const at = (position: string, header: string): Story => ({
  render: () => ({
    components: { UDrawer },
    setup() {
      const visible = ref(false);
      return { visible, position, header };
    },
    template: `
      <div>
        <button @click="visible = true">Show drawer</button>
        <UDrawer v-model:visible="visible" :header="header" :position="position">Drawer body content.</UDrawer>
      </div>
    `,
  }),
});

/** GAP-064 G3-D verification stories (Spec §9.1): the remaining positions. */
export const Top: Story = at("top", "Top");
export const Bottom: Story = at("bottom", "Bottom");
export const Full: Story = at("full", "Full");

/** GAP-064 G3-D verification story (Spec §9.1, OI-D3): a left drawer under `dir="rtl"` on the html element (restored on unmount). */
export const Rtl: Story = {
  render: () => ({
    components: { UDrawer },
    setup() {
      const visible = ref(false);
      let previous = "";
      onMounted(() => {
        previous = document.documentElement.dir;
        document.documentElement.dir = "rtl";
      });
      onBeforeUnmount(() => {
        document.documentElement.dir = previous;
      });
      return { visible };
    },
    template: `
      <div>
        <button @click="visible = true">Show drawer</button>
        <UDrawer v-model:visible="visible" header="RTL">Drawer body content.</UDrawer>
      </div>
    `,
  }),
};

/**
 * GAP-064 G3-D verification story (X-1 reach only; no screenshot): the Vue drawer renders
 * `.u-drawer-footer` only when a footer slot is supplied.
 */
export const WithFooter: Story = {
  render: () => ({
    components: { UDrawer },
    setup() {
      const visible = ref(false);
      return { visible };
    },
    template: `
      <div>
        <button @click="visible = true">Show drawer</button>
        <UDrawer v-model:visible="visible" header="Footer">
          Drawer body content.
          <template #footer>Drawer footer.</template>
        </UDrawer>
      </div>
    `,
  }),
};
