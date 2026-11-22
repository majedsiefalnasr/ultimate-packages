import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { cardStyleModule } from "./card-style";

export interface UCardProps {
  header?: React.ReactNode;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** Attributes for the card's elements by section: root, header, body, title, subTitle, content, footer. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Card` component (real source:
 * `components/lib/card/Card.js`). A flexible content-slot layout container:
 * an optional `header` node, a `title`/`subTitle` pair, `children` as the
 * default content, and an optional `footer` node — matching real source's
 * own header/title/subTitle/content/footer structural shape and prop names
 * exactly.
 */
export const UCard = React.forwardRef<HTMLDivElement, UCardProps>(function UCard(props, ref) {
  const { header, title, subTitle, footer, children, className } = props;
  const { cx } = useComponentBase({ componentName: "card", styleModule: cardStyleModule });
  const { ptm } = createPassThrough("card", { props });
  const mergeProps = useMergeProps();

  return (
    <div
      ref={ref}
      {...mergeProps({ className: [cx("root"), className].filter(Boolean).join(" ") }, ptm("root"))}
    >
      {header && <div {...mergeProps({ className: cx("header") }, ptm("header"))}>{header}</div>}
      <div {...mergeProps({ className: cx("body") }, ptm("body"))}>
        {title && <div {...mergeProps({ className: cx("title") }, ptm("title"))}>{title}</div>}
        {subTitle && (
          <div {...mergeProps({ className: cx("subtitle") }, ptm("subTitle"))}>{subTitle}</div>
        )}
        {children && (
          <div {...mergeProps({ className: cx("content") }, ptm("content"))}>{children}</div>
        )}
        {footer && <div {...mergeProps({ className: cx("footer") }, ptm("footer"))}>{footer}</div>}
      </div>
    </div>
  );
});
