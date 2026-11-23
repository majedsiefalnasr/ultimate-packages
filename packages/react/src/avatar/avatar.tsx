import * as React from "react";
import {
  createPassThrough,
  useComponentBase,
  useMergeProps,
  type PassThrough,
  type PassThroughOptions,
} from "@ultimate/react-core";
import { avatarStyleModule } from "./avatar-style";

/**
 * Ultimate-owned adaptation of PrimeReact's `Avatar` (real source:
 * `components/lib/avatar/Avatar.js`). Content priority follows PrimeReact:
 * the `image` (unless it failed), then the `label`, then the `icon`; `children`
 * replace all of them.
 *
 * A failed image follows PrimeReact's contract (ADR-087): with the default
 * `imageFallback` the image is dropped and the label or icon shows; any other
 * `imageFallback` is used as the image source instead. `onImageError` is
 * always called. Passing `onClick` adds the `u-avatar-clickable` class.
 */
export interface UAvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label?: string;
  /** A CSS class string (for example an icon font class) or a React node. */
  icon?: string | React.ReactNode;
  image?: string;
  imageAlt?: string;
  /** `"default"` drops the failed image; any other value is the fallback image URL. */
  imageFallback?: string;
  size?: "normal" | "large" | "xlarge";
  shape?: "square" | "circle";
  ariaLabel?: string;
  onImageError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  children?: React.ReactNode;
  /** Renders the component with no Ultimate classes or styles. */
  unstyled?: boolean;
  /** Attributes for the avatar's root, label, icon and image elements. */
  pt?: PassThrough;
  ptOptions?: PassThroughOptions;
}

export const UAvatar = React.forwardRef<HTMLDivElement, UAvatarProps>(function UAvatar(props, ref) {
  const {
    label,
    icon,
    image,
    imageAlt = "avatar",
    imageFallback = "default",
    size = "normal",
    shape = "square",
    ariaLabel,
    onImageError,
    children,
    className,
    onClick,
    unstyled,
    pt,
    ptOptions,
    ...rest
  } = props;
  const { cx } = useComponentBase({
    componentName: "avatar",
    styleModule: avatarStyleModule,
    unstyled,
  });
  const { ptm } = createPassThrough("avatar", { props: { pt, ptOptions } });
  const mergeProps = useMergeProps();
  const [imageFailed, setImageFailed] = React.useState(false);
  const [fallbackSrc, setFallbackSrc] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setImageFailed(false);
    setFallbackSrc(undefined);
  }, [image]);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (imageFallback === "default") {
      setImageFailed(true);
    } else {
      setFallbackSrc(imageFallback);
    }
    onImageError?.(event);
  };

  const showImage = !!image && !imageFailed;

  const renderContent = () => {
    if (children) return children;
    if (showImage) {
      return (
        <img
          {...mergeProps(
            { src: fallbackSrc ?? image, alt: imageAlt, onError: handleImageError },
            ptm("image")
          )}
        />
      );
    }
    if (label) {
      return <span {...mergeProps({ className: cx("label") }, ptm("label"))}>{label}</span>;
    }
    if (icon) {
      const iconClassName = typeof icon === "string" ? `${cx("icon")} ${icon}` : cx("icon");
      return (
        <span {...mergeProps({ className: iconClassName }, ptm("icon"))}>
          {typeof icon === "string" ? null : icon}
        </span>
      );
    }
    return null;
  };

  const rootClassName = [
    cx("root", { hasImage: showImage, clickable: !!onClick, shape, size }),
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      {...mergeProps(
        { "aria-label": ariaLabel, onClick },
        rest,
        { className: rootClassName },
        ptm("root")
      )}
    >
      {renderContent()}
    </div>
  );
});
