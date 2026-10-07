import { Component, ElementRef, inject } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
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

@Component({
  selector: "g3d-confirm-popup-icon-demo",
  standalone: true,
  imports: [UButton, UConfirmPopup],
  template: `
    <u-button label="Delete" severity="danger" (onClick)="onDeleteClick()"></u-button>
    <u-confirm-popup></u-confirm-popup>
  `,
})
class ConfirmPopupIconDemo {
  protected readonly confirmationService = inject(UConfirmationService);
  private readonly el = inject(ElementRef);

  protected onDeleteClick(): void {
    this.confirmationService.confirm({
      message: "Are you sure you want to delete this record?",
      icon: "pi pi-exclamation-triangle",
      target: this.el.nativeElement.querySelector("button"),
      accept: () => {},
    });
  }
}

/** GAP-064 G3-D verification story (Spec §9.1): a confirmation with an icon. */
export const WithIcon: Story = {
  decorators: [moduleMetadata({ imports: [ConfirmPopupIconDemo] })],
  render: () => ({ template: `<g3d-confirm-popup-icon-demo></g3d-confirm-popup-icon-demo>` }),
};
