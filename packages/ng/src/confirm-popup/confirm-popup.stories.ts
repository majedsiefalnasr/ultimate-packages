import { Component, ElementRef, inject } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { UConfirmationService } from "@ultimate/ng-core";
import { UButton } from "../button/button";
import { UConfirmPopup } from "./confirm-popup";

@Component({
  standalone: true,
  imports: [UButton, UConfirmPopup],
  template: `
    <u-button #trigger label="Delete" severity="danger" (onClick)="onDeleteClick()"></u-button>
    <u-confirm-popup></u-confirm-popup>
  `,
})
class ConfirmPopupDemo {
  protected readonly confirmationService = inject(UConfirmationService);
  private readonly el = inject(ElementRef);

  protected onDeleteClick(): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this record?",
      target: this.el.nativeElement.querySelector("button"),
      accept: () => {},
    });
  }
}

/**
 * `UConfirmPopup` is service-driven, positioned relative to
 * `confirmation.target` — an always-mounted instance listens on
 * `UConfirmationService.requireConfirmation$` and renders next to the
 * triggering button.
 */
const meta: Meta<ConfirmPopupDemo> = {
  title: "Ng/ConfirmPopup",
  component: ConfirmPopupDemo,
};

export default meta;
type Story = StoryObj<ConfirmPopupDemo>;

export const Default: Story = {};
