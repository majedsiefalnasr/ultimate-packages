import type { Meta, StoryObj } from "@storybook/angular";
import { UDialog } from "./dialog";

/**
 * Accessibility info source: `packages/component-metadata/src/records/dialog.ts`
 * (the `DIALOG_METADATA` record — one of the shared 8 `component-metadata`
 * records). State coverage below is sourced from
 * `packages/ng/src/dialog/dialog.spec.ts`'s existing test cases (closed by
 * default, visible with header/role=dialog/aria-modal, closable, non-modal).
 */
const meta: Meta<UDialog> = {
  title: "Ng/Dialog",
  component: UDialog,
};

export default meta;
type Story = StoryObj<UDialog>;

/** Default state — closed (visible=false is UDialog's own input default). */
export const Default: Story = {
  args: {
    header: "Confirm",
  },
};

/**
 * Interactive open state, per dialog.spec.ts's 'renders with role="dialog",
 * aria-modal="true", and aria-labelledby pointing at the header when
 * visible' test. UOverlay appends the dialog to document.body (not the
 * story's own canvas root), matching UDialog's real runtime behavior.
 */
export const Open: Story = {
  args: {
    visible: true,
    header: "Confirm",
    modal: true,
  },
  render: (args) => ({
    props: args,
    template: `<u-dialog [visible]="visible" [header]="header" [modal]="modal" [closable]="closable">Dialog body content.</u-dialog>`,
  }),
};

/** Non-closable variant, per dialog.spec.ts's closable-input coverage. */
export const NonClosable: Story = {
  args: {
    visible: true,
    header: "Non-closable",
    closable: false,
  },
  render: (args) => ({
    props: args,
    template: `<u-dialog [visible]="visible" [header]="header" [closable]="closable">Cannot be closed via the header button.</u-dialog>`,
  }),
};
