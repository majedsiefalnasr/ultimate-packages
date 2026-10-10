import type { Meta, StoryObj } from "@storybook/angular";
import { UDataView } from "./data-view";

const meta: Meta<UDataView> = { title: "Data/DataView", component: UDataView };
export default meta;

type Story = StoryObj<UDataView>;

const fruits = [{ name: "Apple" }, { name: "Banana" }];
const six = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"].map((name) => ({ name }));
const itemTemplate = (item: unknown) => (item as { name: string }).name;

/** Repaired (G3-E Spec §4.1): binds the required itemTemplate input explicitly. */
export const Default: Story = {
  render: () => ({
    props: { value: fruits, itemTemplate },
    template: `<u-data-view [value]="value" [itemTemplate]="itemTemplate" />`,
  }),
};

/** GAP-064 G3-E verification story: grid layout. */
export const Grid: Story = {
  render: () => ({
    props: { value: fruits, itemTemplate },
    template: `<u-data-view [value]="value" [itemTemplate]="itemTemplate" layout="grid" />`,
  }),
};

/** GAP-064 G3-E verification story: paginator, 2 rows per page. */
export const Paginator: Story = {
  render: () => ({
    props: { value: six, itemTemplate },
    template: `<u-data-view [value]="value" [itemTemplate]="itemTemplate" [paginator]="true" [rows]="2" />`,
  }),
};

/** GAP-064 G3-E verification story: empty value. */
export const Empty: Story = {
  render: () => ({
    props: { value: [], itemTemplate },
    template: `<u-data-view [value]="value" [itemTemplate]="itemTemplate" />`,
  }),
};

/** GAP-064 G3-E verification story: loading (PrimeNG has a loading overlay oracle). */
export const Loading: Story = {
  render: () => ({
    props: { value: fruits, itemTemplate },
    template: `<u-data-view [value]="value" [itemTemplate]="itemTemplate" [loading]="true" />`,
  }),
};
