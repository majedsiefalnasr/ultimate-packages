import { Component, inject } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { UConfirmationService } from "@ultimate/ng-core";
import { UButton } from "../button/button";
import { UConfirmDialog } from "./confirm-dialog";

@Component({
  standalone: true,
  imports: [UButton, UConfirmDialog],
  template: `
    <u-button
      label="Delete"
      (onClick)="
        confirmationService.confirm({
          header: 'Confirm',
          message: 'Are you sure you want to delete this item?',
          accept: noop,
        })
      "
    ></u-button>
    <u-confirm-dialog></u-confirm-dialog>
  `,
})
class ConfirmDialogDemo {
  protected readonly confirmationService = inject(UConfirmationService);
  protected readonly noop = () => {};
}

/**
 * `UConfirmDialog` is service-driven — an always-mounted instance listens
 * on `UConfirmationService.requireConfirmation$` and renders whenever
 * `confirm()` is called with a matching `key`, mirrored here via a trigger
 * button injecting the same DI-provided service instance.
 */
const meta: Meta<ConfirmDialogDemo> = {
  title: "Ng/ConfirmDialog",
  component: ConfirmDialogDemo,
};

export default meta;
type Story = StoryObj<ConfirmDialogDemo>;

export const Default: Story = {};

@Component({
  selector: "g3d-confirm-dialog-icon-demo",
  standalone: true,
  imports: [UButton, UConfirmDialog],
  template: `
    <u-button
      label="Delete"
      (onClick)="
        confirmationService.confirm({
          header: 'Confirm',
          message: 'Are you sure you want to delete this item?',
          icon: 'pi pi-exclamation-triangle',
          accept: noop,
        })
      "
    ></u-button>
    <u-confirm-dialog></u-confirm-dialog>
  `,
})
class ConfirmDialogIconDemo {
  protected readonly confirmationService = inject(UConfirmationService);
  protected readonly noop = () => {};
}

/** GAP-064 G3-D verification story (Spec §9.1): a confirmation with an icon. */
export const WithIcon: Story = {
  decorators: [moduleMetadata({ imports: [ConfirmDialogIconDemo] })],
  render: () => ({ template: `<g3d-confirm-dialog-icon-demo></g3d-confirm-dialog-icon-demo>` }),
};
