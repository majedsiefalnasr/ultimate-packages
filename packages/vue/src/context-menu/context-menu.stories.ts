import { UContextMenu } from "./index";

/**
 * `UContextMenu` activates on its trigger content's native `contextmenu`
 * (right-click) event — right-click inside the story's canvas area to open
 * it, matching real PrimeVue `ContextMenu`'s own activation mechanism.
 */
export default {
  title: "Vue/ContextMenu",
  component: UContextMenu,
};

const items = [
  { label: "Copy" },
  { label: "Paste" },
  { label: "Delete", disabled: true },
];

export const Default = {
  render: () => ({
    components: { UContextMenu },
    data: () => ({ items }),
    template: `
      <UContextMenu :model="items">
        <div style="padding: 2rem; border: 1px dashed #999;">Right-click here.</div>
      </UContextMenu>
    `,
  }),
};

export const Global = {
  render: () => ({
    components: { UContextMenu },
    data: () => ({ items }),
    template: `
      <UContextMenu :model="items" global>
        <div>Right-click anywhere on the page.</div>
      </UContextMenu>
    `,
  }),
};
