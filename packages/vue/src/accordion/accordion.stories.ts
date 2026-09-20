import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { UAccordion } from "./index";
import { UAccordionPanel } from "../accordion-panel";
import { UAccordionHeader } from "../accordion-header";
import { UAccordionContent } from "../accordion-content";

const meta: Meta<typeof UAccordion> = {
  title: "Vue/Accordion",
  component: UAccordion,
};

export default meta;
type Story = StoryObj<typeof UAccordion>;

export const Default: Story = {
  render: () => ({
    components: { UAccordion, UAccordionPanel, UAccordionHeader, UAccordionContent },
    template: `
      <UAccordion value="0">
        <UAccordionPanel value="0">
          <UAccordionHeader>Header I</UAccordionHeader>
          <UAccordionContent>Content for Header I.</UAccordionContent>
        </UAccordionPanel>
        <UAccordionPanel value="1">
          <UAccordionHeader>Header II</UAccordionHeader>
          <UAccordionContent>Content for Header II.</UAccordionContent>
        </UAccordionPanel>
        <UAccordionPanel value="2" disabled>
          <UAccordionHeader>Header III</UAccordionHeader>
          <UAccordionContent>Content for Header III.</UAccordionContent>
        </UAccordionPanel>
      </UAccordion>
    `,
  }),
};

export const Multiple: Story = {
  render: () => ({
    components: { UAccordion, UAccordionPanel, UAccordionHeader, UAccordionContent },
    template: `
      <UAccordion multiple>
        <UAccordionPanel value="0">
          <UAccordionHeader>Header I</UAccordionHeader>
          <UAccordionContent>Content for Header I.</UAccordionContent>
        </UAccordionPanel>
        <UAccordionPanel value="1">
          <UAccordionHeader>Header II</UAccordionHeader>
          <UAccordionContent>Content for Header II.</UAccordionContent>
        </UAccordionPanel>
      </UAccordion>
    `,
  }),
};
