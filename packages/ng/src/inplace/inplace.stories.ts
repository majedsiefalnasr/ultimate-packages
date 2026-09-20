import type { Meta, StoryObj } from "@storybook/angular";
import { UInplace } from "./inplace";

const meta: Meta<UInplace> = {
  title: "Ng/Inplace",
  component: UInplace,
};

export default meta;
type Story = StoryObj<UInplace>;

export const Default: Story = {
  render: () => ({
    template: `
      <u-inplace>
        <span displayContent>Click to Edit</span>
        <ng-template #content let-closeCallback="closeCallback">
          <input type="text" value="Editable content" />
          <button type="button" (click)="closeCallback($event)">Close</button>
        </ng-template>
      </u-inplace>
    `,
  }),
};
