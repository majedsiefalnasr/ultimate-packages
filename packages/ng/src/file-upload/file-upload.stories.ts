import type { Meta, StoryObj } from "@storybook/angular";
import { UFileUpload } from "./file-upload";

/**
 * State coverage below is sourced from
 * `packages/ng/src/file-upload/file-upload.spec.ts`'s existing test cases
 * (file selection, drag-drop, remove, clear, validation, upload progress).
 */
const meta: Meta<UFileUpload> = {
  title: "Ng/FileUpload",
  component: UFileUpload,
};

export default meta;
type Story = StoryObj<UFileUpload>;

/** Default state — choose files or drag-drop onto the content zone. */
export const Default: Story = {
  args: {
    url: "/api/upload",
  },
};

/** Allows selecting/uploading more than one file at a time. */
export const Multiple: Story = {
  args: {
    url: "/api/upload",
    multiple: true,
  },
};

/** Uploads automatically once files are selected, no explicit Upload click. */
export const AutoUpload: Story = {
  args: {
    url: "/api/upload",
    auto: true,
  },
};

/** Restricts accepted file types and maximum size. */
export const Constrained: Story = {
  args: {
    url: "/api/upload",
    accept: "image/*",
    maxFileSize: 1_000_000,
  },
};

/** Disabled — choosing/uploading files is blocked. */
export const Disabled: Story = {
  args: {
    url: "/api/upload",
    disabled: true,
  },
};
