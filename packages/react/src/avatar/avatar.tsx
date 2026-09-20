import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { avatarStyleModule } from "./avatar-style";

export interface UAvatarProps {
  label?: string;
  icon?: React.ReactNode;
  image?: string;
  size?: "normal" | "large" | "xlarge";
  shape?: "square" | "circle";
  ariaLabel?: string;
  onImageError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  className?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Avatar` component (real
 * source: `components/lib/avatar/Avatar.js`). Renders an image when
 * `image` is set (falling back to `label`/`icon` on a load error, matching
 * real source's own `onImageError`/`imageFailed`-state branching), else a
 * text `label`, else an `icon`.
 *
 * Deliberately excludes real source's `imageAlt`/`imageFallback`/
 * `template`/`onClick`-driven `p-avatar-clickable` styling and `nested`
 * (AvatarGroup-context) detection — none of these appear in this task's
 * spec-mandated surface.
 */
export const UAvatar = React.forwardRef<HTMLDivElement, UAvatarProps>(function UAvatar(
  { label, icon, image, size = "normal", shape = "square", ariaLabel, onImageError, className },
  ref
) {
  const { cx } = useComponentBase({ componentName: "avatar", styleModule: avatarStyleModule });
  const [imageFailed, setImageFailed] = React.useState(false);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageFailed(true);
    onImageError?.(event);
  };

  const renderContent = () => {
    if (image && !imageFailed) {
      return <img src={image} alt={ariaLabel} onError={handleImageError} />;
    }
    if (label) {
      return <span className={cx("label")}>{label}</span>;
    }
    if (icon) {
      return <span className={cx("icon")}>{icon}</span>;
    }
    return null;
  };

  return (
    <div
      ref={ref}
      aria-label={ariaLabel}
      className={[cx("root", { hasImage: !!image, imageFailed, shape, size }), className]
        .filter(Boolean)
        .join(" ")}
    >
      {renderContent()}
    </div>
  );
});
