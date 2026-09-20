import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UCard } from "./index";

const meta: Meta<typeof UCard> = {
  title: "Vue/Card",
  component: UCard,
};

export default meta;
type Story = StoryObj<typeof UCard>;

export const Default: Story = {
  render: () => ({
    components: { UCard },
    template: `
      <UCard style="width: 20rem;">
        <template #title>Simple Card</template>
        <template #subtitle>Card subtitle</template>
        <template #content>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </template>
      </UCard>
    `,
  }),
};

export const WithHeaderAndFooter: Story = {
  render: () => ({
    components: { UCard },
    template: `
      <UCard style="width: 20rem;">
        <template #header>
          <img src="https://primefaces.org/cdn/primevue/images/usercard.jpg" style="width: 100%; display: block;" />
        </template>
        <template #title>Advanced Card</template>
        <template #content>
          <p>Card content with a header image and footer actions.</p>
        </template>
        <template #footer>
          <button type="button">Cancel</button>
          <button type="button">Save</button>
        </template>
      </UCard>
    `,
  }),
};
