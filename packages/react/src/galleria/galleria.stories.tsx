import type { Meta, StoryObj } from "@storybook/react-vite";
import { UGalleria } from "./galleria";

const meta: Meta<typeof UGalleria> = {
  title: "React/Galleria",
  component: UGalleria,
};

export default meta;
type Story = StoryObj<typeof UGalleria>;

const images = [
  "https://primefaces.org/cdn/primereact/images/galleria/galleria1.jpg",
  "https://primefaces.org/cdn/primereact/images/galleria/galleria2.jpg",
  "https://primefaces.org/cdn/primereact/images/galleria/galleria3.jpg",
];

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: "40rem" }}>
      <UGalleria
        value={images}
        itemTemplate={(item) => <img src={item} style={{ width: "100%", display: "block" }} />}
        thumbnailTemplate={(item) => <img src={item} style={{ width: "5rem", display: "block" }} />}
      />
    </div>
  ),
};
