import * as React from "react";
import { useComponentBase } from "@ultimate/react-core";
import { ratingStyleModule } from "./rating-style";

export interface URatingChangeEvent {
  originalEvent: React.SyntheticEvent;
  value: number | null;
}

export interface URatingProps {
  value: number | null;
  onChange: (event: URatingChangeEvent) => void;
  stars?: number;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-labelledby"?: string;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Rating` (real source:
 * `components/lib/rating/Rating.js`/`RatingBase.js`, extracted this session
 * via `scripts/provenance/extract-primereact-source.mjs`). Fully controlled
 * (`value`/`onChange`), per React's established no-shared-form-state-base-
 * class convention — same shape every sibling React component in this batch
 * follows.
 *
 * NOT overlay-based — real source renders a flat row of star options (each a
 * clickable `div` with an on/off SVG icon plus a hidden focus target), no
 * panel/dropdown.
 *
 * Keyboard stepping matches real source's own `onStarKeyDown`:
 * ArrowLeft/ArrowUp moves to the previous star (wrapping to `stars` at the
 * low end), ArrowRight/ArrowDown to the next (wrapping to 1 past the max).
 *
 * Deliberately excludes real source's much larger surface: the `cancel`
 * clear-icon affordance, icon prop overrides, tooltip integration, and
 * PrimeReact's global `context` config lookup — matching every sibling
 * component's established "smaller surface than upstream" precedent.
 */
export function URating({
  value,
  onChange,
  stars = 5,
  readOnly = false,
  disabled = false,
  className,
  "aria-labelledby": ariaLabelledBy,
}: URatingProps): React.ReactElement {
  const { cx } = useComponentBase({ componentName: "rating", styleModule: ratingStyleModule });
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const enabled = !disabled && !readOnly;

  const rate = (event: React.SyntheticEvent, newValue: number) => {
    if (!enabled) return;
    const next = value === newValue ? null : newValue;
    setFocusedIndex(next ?? -1);
    onChange({ originalEvent: event, value: next });
  };

  const onStarKeyDown = (event: React.KeyboardEvent, starValue: number) => {
    if (!enabled) return;
    switch (event.key) {
      case "Enter":
      case " ":
        rate(event, starValue);
        event.preventDefault();
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        rate(event, (value ?? 0) - 1 < 1 ? stars : (value ?? 0) - 1);
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        rate(event, (value ?? 0) + 1 > stars ? 1 : (value ?? 0) + 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      role="group"
      aria-labelledby={ariaLabelledBy}
      className={[cx("root", { disabled: !enabled }), className].filter(Boolean).join(" ")}
    >
      {Array.from({ length: stars }, (_, i) => i + 1).map((starValue) => {
        const active = value !== null && starValue <= value;
        return (
          <div
            key={starValue}
            className={cx("option", { focused: focusedIndex === starValue })}
            tabIndex={enabled ? 0 : -1}
            role="radio"
            aria-checked={value === starValue}
            aria-label={starValue === 1 ? "1 star" : `${starValue} stars`}
            onClick={(event) => rate(event, starValue)}
            onKeyDown={(event) => onStarKeyDown(event, starValue)}
            onFocus={() => enabled && setFocusedIndex(starValue)}
            onBlur={() => setFocusedIndex(-1)}
          >
            {active ? (
              <svg className={cx("onIcon")} viewBox="0 0 16 16" aria-hidden="true" data-testid={`star-on-${starValue}`}>
                <path d="M8 1l2.163 4.279 4.837.626-3.5 3.279.882 4.816L8 11.7l-4.382 2.3.882-4.816-3.5-3.279 4.837-.626z" />
              </svg>
            ) : (
              <svg className={cx("offIcon")} viewBox="0 0 16 16" aria-hidden="true" data-testid={`star-off-${starValue}`}>
                <path
                  d="M8 1l2.163 4.279 4.837.626-3.5 3.279.882 4.816L8 11.7l-4.382 2.3.882-4.816-3.5-3.279 4.837-.626z"
                  fill="none"
                  stroke="currentColor"
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
