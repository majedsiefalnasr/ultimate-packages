import { defineComponent, h } from "vue";
import type { IconProps } from "./spinner-icon";

export const MinusIcon = defineComponent({
  name: "UMinusIcon",
  props: { class: String, label: String },
  setup(props: IconProps) {
    return () =>
      h(
        "svg",
        {
          role: "img",
          "aria-label": props.label,
          class: ["u-icon", props.class],
          width: "14",
          height: "14",
          viewBox: "0 0 14 14",
          fill: "none",
        },
        [
          h("path", {
            fill: "currentColor",
            d: "M0.5 7C0.5 6.58579 0.835786 6.25 1.25 6.25H12.75C13.1642 6.25 13.5 6.58579 13.5 7C13.5 7.41421 13.1642 7.75 12.75 7.75H1.25C0.835786 7.75 0.5 7.41421 0.5 7Z",
          }),
        ]
      );
  },
});
