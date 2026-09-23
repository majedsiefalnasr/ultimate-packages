import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { UPickList } from "./pick-list";

function ControlledPickListStory({ dragdrop = false }: { dragdrop?: boolean }): React.ReactElement {
  const [source, setSource] = useState(["Apple", "Banana", "Cherry"]);
  const [target, setTarget] = useState<string[]>([]);
  return (
    <UPickList
      source={source}
      target={target}
      onSourceChange={setSource}
      onTargetChange={setTarget}
      itemTemplate={(item) => <span>{item}</span>}
      dragdrop={dragdrop}
    />
  );
}

const meta: Meta<typeof UPickList> = { title: "Data/PickList", component: UPickList };
export default meta;
type Story = StoryObj<typeof UPickList>;

export const Default: Story = { render: () => <ControlledPickListStory /> };
export const WithDragDrop: Story = { render: () => <ControlledPickListStory dragdrop /> };
