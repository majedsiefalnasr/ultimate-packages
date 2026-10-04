import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";
import { moduleMetadata } from "@storybook/angular";
import { UToastService } from "@ultimate/ng-core";
import { UToast } from "./toast";

const meta: Meta<UToast> = {
  title: "Ng/Toast",
  component: UToast,
};

export default meta;
type Story = StoryObj<UToast>;

export const Default: Story = {
  render: () => ({ template: `<u-toast></u-toast>` }),
};

/**
 * GAP-064 G3-A verification story (Spec §13.3): six sticky messages, one per
 * severity, so the Toast CSS is actually exercised. Messages are added after
 * the first render (a macrotask) so the toast is subscribed and change
 * detection is not re-entered.
 */
@Component({
  standalone: true,
  selector: "u-toast-all-severities-story",
  imports: [UToast],
  template: `<u-toast></u-toast>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ToastAllSeveritiesStory implements AfterViewInit {
  private readonly toast = inject(UToastService);

  ngAfterViewInit(): void {
    setTimeout(() => {
      for (const severity of [
        "success",
        "info",
        "warn",
        "error",
        "secondary",
        "contrast",
      ] as const) {
        this.toast.add({
          severity,
          summary: `${severity} summary`,
          detail: `${severity} detail`,
          sticky: true,
        });
      }
    });
  }
}

export const AllSeverities: Story = {
  decorators: [moduleMetadata({ imports: [ToastAllSeveritiesStory] })],
  render: () => ({ template: `<u-toast-all-severities-story></u-toast-all-severities-story>` }),
};
