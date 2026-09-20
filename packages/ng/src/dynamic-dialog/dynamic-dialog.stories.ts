import { Component, Input, inject } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { UDialogService } from "@ultimate/ng-core";
import { UButton } from "../button/button";
import { UDynamicDialog } from "./dynamic-dialog";

@Component({
  standalone: true,
  template: `<p>Dynamically-loaded content for: {{ label }}</p>`,
})
class DemoDynamicContent {
  @Input() label = "";
}

@Component({
  standalone: true,
  imports: [UButton, UDynamicDialog],
  template: `
    <u-button label="Open dynamic dialog" (onClick)="openDialog()"></u-button>
    <u-dynamic-dialog></u-dynamic-dialog>
  `,
})
class DynamicDialogDemo {
  private readonly dialogService = inject(UDialogService);

  protected openDialog(): void {
    this.dialogService.open(DemoDynamicContent, {
      header: "Dynamic Dialog",
      inputValues: { label: "Ultimate" },
    });
  }
}

/**
 * `UDialogService.open(component, config)` dispatches an open request the
 * always-mounted `UDynamicDialog` subscribes to and renders, loading the
 * given component's inputs via `inputValues`.
 */
const meta: Meta<DynamicDialogDemo> = {
  title: "Ng/DynamicDialog",
  component: DynamicDialogDemo,
};

export default meta;
type Story = StoryObj<DynamicDialogDemo>;

export const Default: Story = {};
