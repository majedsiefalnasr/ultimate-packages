import type { Meta, StoryObj } from "@storybook/angular";
import { UCard } from "./card";

const meta: Meta<UCard> = {
  title: "Ng/Card",
  component: UCard,
};

export default meta;
type Story = StoryObj<UCard>;

export const Default: Story = {
  args: { header: "Simple Card", subheader: "Card subtitle" },
  render: (args) => ({
    props: args,
    template: `
      <u-card [header]="header" [subheader]="subheader" style="width: 20rem;">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </u-card>
    `,
  }),
};

export const WithHeaderAndFooter: Story = {
  args: { header: "Advanced Card" },
  render: (args) => ({
    props: args,
    template: `
      <u-card [header]="header" style="width: 20rem;">
        <div card-header><img src="https://primefaces.org/cdn/primeng/images/usercard.jpg" style="width: 100%; display: block;" /></div>
        <p>Card content with a header image and footer actions.</p>
        <div card-footer>
          <button type="button">Cancel</button>
          <button type="button">Save</button>
        </div>
      </u-card>
    `,
  }),
};
