import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UFloatLabel } from "./float-label";

/**
 * ACCESSIBILITY-INFO FALLBACK NOTICE: `UFloatLabel` has no
 * `packages/component-metadata/src/records/` entry — that directory only
 * covers the shared 8 (Button, Checkbox, Dialog, Menu, Paginator, Scroller,
 * Table, Tooltip). Per this task's brief, this story file's own prose (this
 * comment) is the accessibility-info source instead of an invented metadata
 * record.
 *
 * Accessibility notes: `UFloatLabel` renders a `<span>` wrapping its
 * children (typically an input plus its `<label>`), applying no ARIA role
 * of its own. The projected `<label>`/`<input>` pair remains responsible
 * for its own label association (`htmlFor`/`id`).
 */
const meta: Meta<typeof UFloatLabel> = {
  title: "React/FloatLabel",
  component: UFloatLabel,
};

export default meta;
type Story = StoryObj<typeof UFloatLabel>;

/** Default 'over' variant — label overlaps the input's top edge, floats up on focus/content. */
export const Default: Story = {
  args: { variant: "over" },
  render: (args) => (
    <UFloatLabel {...args}>
      <input id="username" type="text" className="u-input-text" />
      <label htmlFor="username">Username</label>
    </UFloatLabel>
  ),
};

/** 'in' variant — label sits inside the input's padding area once floated. */
export const InVariant: Story = {
  args: { variant: "in" },
  render: (args) => (
    <UFloatLabel {...args}>
      <input id="username-in" type="text" className="u-input-text" />
      <label htmlFor="username-in">Username</label>
    </UFloatLabel>
  ),
};

/** 'on' variant — floated label sits directly on the input's border. */
export const OnVariant: Story = {
  args: { variant: "on" },
  render: (args) => (
    <UFloatLabel {...args}>
      <input id="username-on" type="text" className="u-input-text" />
      <label htmlFor="username-on">Username</label>
    </UFloatLabel>
  ),
};
