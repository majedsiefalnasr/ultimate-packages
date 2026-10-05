import type { Meta, StoryObj } from "@storybook/angular";
import { UAccordion, type UAccordionPanel } from "./accordion";

const meta: Meta<UAccordion> = {
  title: "Ng/Accordion",
  component: UAccordion,
};

export default meta;
type Story = StoryObj<UAccordion>;

const panels: UAccordionPanel[] = [
  { value: "0", header: "Header I" },
  { value: "1", header: "Header II" },
  { value: "2", header: "Header III", disabled: true },
];

export const Default: Story = {
  args: { panels },
  render: (args) => ({
    props: args,
    template: `
      <u-accordion [panels]="panels">
        <ng-template #panelContent let-panel>
          <p>Content for {{ panel.header }}.</p>
        </ng-template>
      </u-accordion>
    `,
  }),
};

export const Multiple: Story = {
  args: { panels, multiple: true },
  render: (args) => ({
    props: args,
    template: `
      <u-accordion [panels]="panels" [multiple]="multiple">
        <ng-template #panelContent let-panel>
          <p>Content for {{ panel.header }}.</p>
        </ng-template>
      </u-accordion>
    `,
  }),
};

/** GAP-064 G3-B verification story (Spec §8 C5): an active and a disabled panel. */
export const ActiveAndDisabled: Story = {
  args: { panels, value: "0" },
  render: (args) => ({
    props: args,
    template: `
      <u-accordion [panels]="panels" [value]="value">
        <ng-template #panelContent let-panel>
          <p>Content for {{ panel.header }}.</p>
        </ng-template>
      </u-accordion>
    `,
  }),
};
