import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UFileUpload } from "./file-upload";

const meta: Meta<typeof UFileUpload> = {
  title: "React/FileUpload",
  component: UFileUpload,
};

export default meta;
type Story = StoryObj<typeof UFileUpload>;

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
