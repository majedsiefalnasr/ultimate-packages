import { UPopover } from "./index";

/**
 * `UPopover` is imperatively controlled (`toggle(event, target)`/`show`/
 * `hide`), matching real PrimeVue `Popover`'s own consumption pattern — a
 * trigger button's `@click` calls `$refs.op.toggle($event)`.
 */
export default {
  title: "Vue/Popover",
  component: UPopover,
};

export const Default = {
  render: () => ({
    components: { UPopover },
    template: `
      <div>
        <button @click="$refs.op.toggle($event)">Toggle Popover</button>
        <UPopover ref="op">
          <div style="padding: 1rem;">Popover panel content.</div>
        </UPopover>
      </div>
    `,
  }),
};

export const NonDismissable = {
  render: () => ({
    components: { UPopover },
    template: `
      <div>
        <button @click="$refs.op.toggle($event)">Toggle Popover</button>
        <UPopover ref="op" :dismissable="false">
          <div style="padding: 1rem;">Only closes via toggle/Escape, not outside click.</div>
        </UPopover>
      </div>
    `,
  }),
};
