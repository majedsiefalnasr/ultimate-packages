import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { cardStyleModule } from "./card-style";

export interface UCardProps {
  header?: React.ReactNode;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Card` component (real source:
 * `components/lib/card/Card.js`). A flexible content-slot layout container:
 * an optional `header` node, a `title`/`subTitle` pair, `children` as the
 * default content, and an optional `footer` node — matching real source's
 * own header/title/subTitle/content/footer structural shape and prop names
 * exactly.
 */
export const UCard = React.forwardRef<HTMLDivElement, UCardProps>(function UCard(
  { header, title, subTitle, footer, children, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "card", styleModule: cardStyleModule });

  return (
    <div ref={ref} className={[cx("root"), className].filter(Boolean).join(" ")}>
      {header && <div className={cx("header")}>{header}</div>}
      <div className={cx("body")}>
        {title && <div className={cx("title")}>{title}</div>}
        {subTitle && <div className={cx("subtitle")}>{subTitle}</div>}
        {children && <div className={cx("content")}>{children}</div>}
        {footer && <div className={cx("footer")}>{footer}</div>}
      </div>
    </div>
  );
});
