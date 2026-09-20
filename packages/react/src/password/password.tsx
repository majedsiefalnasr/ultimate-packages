import * as React from "react";
import { useComponentBase, useDisplayOrder, useGlobalEscapeKey, ESCAPE_PRIORITIES } from "@ultimate/react-core";
import { passwordStyleModule } from "./password-style";

type PasswordStrength = "weak" | "medium" | "strong" | null;

export interface UPasswordProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "size"> {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  feedback?: boolean;
  toggleMask?: boolean;
  promptLabel?: string;
  weakLabel?: string;
  mediumLabel?: string;
  strongLabel?: string;
  mediumRegex?: string;
  strongRegex?: string;
  fluid?: boolean;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const DEFAULT_MEDIUM_REGEX =
  "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})";
const DEFAULT_STRONG_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})";

function testStrength(value: string, mediumRegex: string, strongRegex: string): 0 | 1 | 2 | 3 {
  if (!value || value.length === 0) return 0;
  if (new RegExp(strongRegex).test(value)) return 3;
  if (new RegExp(mediumRegex).test(value)) return 2;
  return 1;
}

/**
 * Ultimate-owned adaptation of PrimeReact's `Password` (real source:
 * `components/lib/password/Password.js`/`PasswordBase.js`, extracted this
 * session via `scripts/provenance/extract-primereact-source.mjs`). Fully
 * controlled (`value`/`onChange`), per React's established no-shared-form-
 * state-base-class convention (`checkbox.tsx`'s own precedent, restated in
 * this task's own brief) — no CVA/model-holder tier exists for React.
 *
 * Renders a native `<input>` (toggled `type="password"`/`"text"`) plus a
 * strength-meter overlay. Real source composes `Portal` + `CSSTransition` +
 * `useOverlayListener`/`useDisplayOrder`/`useGlobalOnEscapeKey` — this port
 * uses a plain absolutely-positioned `<div>` (no portal to `document.body`)
 * since real source's own overlay is `position: absolute` relative to the
 * `.p-password` root wrapper (verified: `PasswordBase.js`'s `panel` class
 * `position: absolute; top:0; left:0`, and `.p-password .p-password-panel {
 * min-width: 100% }` — the overlay is sized/positioned relative to its own
 * parent, not portalled out), while still wiring the same
 * `useGlobalEscapeKey`/`useDisplayOrder` composition `dialog.tsx` uses for
 * its own escape-key stacking, matching this task's brief to reuse the
 * established react-core overlay-composition pattern.
 *
 * Strength scoring (`testStrength`) ports real source's own
 * `mediumRegex`/`strongRegex` two-tier classification exactly (`Password.js`
 * lines ~245-259).
 *
 * Deliberately excludes real source's much larger surface: `Portal`/
 * `appendTo` DOM-relocation, header/content/footer render-prop slots,
 * `panelStyle`/`panelClassName`, `tooltip`, and PrimeReact's global
 * `context`/`PrimeReactContext` config lookup — matching every sibling
 * component's established "smaller surface than upstream" precedent.
 */
export const UPassword = React.forwardRef<HTMLInputElement, UPasswordProps>(function UPassword(
  {
    value = "",
    onChange,
    feedback = true,
    toggleMask = false,
    promptLabel = "Enter a password",
    weakLabel = "Weak",
    mediumLabel = "Medium",
    strongLabel = "Strong",
    mediumRegex = DEFAULT_MEDIUM_REGEX,
    strongRegex = DEFAULT_STRONG_REGEX,
    fluid = false,
    disabled = false,
    className,
    inputRef,
    onFocus,
    onBlur,
    ...rest
  },
  ref
) {
  const { cx } = useComponentBase({ componentName: "password", styleModule: passwordStyleModule });
  const [unmasked, setUnmasked] = React.useState(false);
  const [overlayVisible, setOverlayVisible] = React.useState(false);
  const [meter, setMeter] = React.useState<{ strength: PasswordStrength; width: string } | null>(
    null
  );
  const [infoText, setInfoText] = React.useState(promptLabel);

  const setRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      if (typeof inputRef === "function") inputRef(node);
      else if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref, inputRef]
  );

  const displayOrder = useDisplayOrder("password", overlayVisible);
  useGlobalEscapeKey({
    callback: () => setOverlayVisible(false),
    when: overlayVisible && feedback,
    priority: [ESCAPE_PRIORITIES.DIALOG, displayOrder],
  });

  const updateUI = React.useCallback(
    (next: string) => {
      switch (testStrength(next, mediumRegex, strongRegex)) {
        case 1:
          setMeter({ strength: "weak", width: "33.33%" });
          setInfoText(weakLabel);
          break;
        case 2:
          setMeter({ strength: "medium", width: "66.66%" });
          setInfoText(mediumLabel);
          break;
        case 3:
          setMeter({ strength: "strong", width: "100%" });
          setInfoText(strongLabel);
          break;
        default:
          setMeter(null);
          setInfoText(promptLabel);
          break;
      }
    },
    [mediumRegex, strongRegex, weakLabel, mediumLabel, strongLabel, promptLabel]
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange?.(event);
    if (feedback) {
      updateUI(event.target.value);
    }
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    if (feedback) {
      updateUI(value);
      setOverlayVisible(true);
    }
    onFocus?.(event);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    if (feedback) {
      setOverlayVisible(false);
    }
    onBlur?.(event);
  };

  const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (!feedback) return;
    updateUI((event.target as HTMLInputElement).value);
    if (event.code === "Escape") {
      setOverlayVisible(false);
      return;
    }
    if (!overlayVisible) {
      setOverlayVisible(true);
    }
  };

  return (
    <div className={[cx("root", { filled: value.length > 0, disabled, fluid }), className].filter(Boolean).join(" ")}>
      <input
        ref={setRef}
        type={unmasked ? "text" : "password"}
        className={cx("input")}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyUp={handleKeyUp}
        {...rest}
      />
      {toggleMask &&
        (unmasked ? (
          <svg
            className={cx("maskIcon")}
            onClick={() => setUnmasked(false)}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            role="button"
            aria-label="Hide Password"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.0535499 7.25213C0.208567 7.59162 2.40413 12.4 7 12.4C11.5959 12.4 13.7914 7.59162 13.9465 7.25213C13.9487 7.2471 13.9506 7.24304 13.952 7.24001C13.9837 7.16396 14 7.08239 14 7.00001C14 6.91762 13.9837 6.83605 13.952 6.76001C13.9506 6.75697 13.9487 6.75292 13.9465 6.74788C13.7914 6.4084 11.5959 1.60001 7 1.60001C2.40413 1.60001 0.208567 6.40839 0.0535499 6.74788C0.0512519 6.75292 0.0494023 6.75697 0.048 6.76001C0.0163137 6.83605 0 6.91762 0 7.00001C0 7.08239 0.0163137 7.16396 0.048 7.24001C0.0494023 7.24304 0.0512519 7.2471 0.0535499 7.25213ZM7 11.2C3.664 11.2 1.736 7.92001 1.264 7.00001C1.736 6.08001 3.664 2.80001 7 2.80001C10.336 2.80001 12.264 6.08001 12.736 7.00001C12.264 7.92001 10.336 11.2 7 11.2ZM5.55551 9.16182C5.98308 9.44751 6.48576 9.6 7 9.6C7.68891 9.59789 8.349 9.32328 8.83614 8.83614C9.32328 8.349 9.59789 7.68891 9.59999 7C9.59999 6.48576 9.44751 5.98308 9.16182 5.55551C8.87612 5.12794 8.47006 4.7947 7.99497 4.59791C7.51988 4.40112 6.99711 4.34963 6.49276 4.44995C5.98841 4.55027 5.52513 4.7979 5.16152 5.16152C4.7979 5.52513 4.55027 5.98841 4.44995 6.49276C4.34963 6.99711 4.40112 7.51988 4.59791 7.99497C4.7947 8.47006 5.12794 8.87612 5.55551 9.16182ZM6.2222 5.83594C6.45243 5.6821 6.7231 5.6 7 5.6C7.37065 5.6021 7.72553 5.75027 7.98762 6.01237C8.24972 6.27446 8.39789 6.62934 8.4 7C8.4 7.27689 8.31789 7.54756 8.16405 7.77779C8.01022 8.00802 7.79157 8.18746 7.53575 8.29343C7.27994 8.39939 6.99844 8.42711 6.72687 8.37309C6.4553 8.31908 6.20584 8.18574 6.01005 7.98994C5.81425 7.79415 5.68091 7.54469 5.6269 7.27312C5.57288 7.00155 5.6006 6.72006 5.70656 6.46424C5.81253 6.20842 5.99197 5.98977 6.2222 5.83594Z"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg
            className={cx("unmaskIcon")}
            onClick={() => setUnmasked(true)}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            role="button"
            aria-label="Show Password"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.9414 6.74792C13.9437 6.75295 13.9455 6.757 13.9469 6.76003C13.982 6.8394 14.0001 6.9252 14.0001 7.01195C14.0001 7.0987 13.982 7.1845 13.9469 7.26386C13.6004 8.00059 13.1711 8.69549 12.6674 9.33515C12.6115 9.4071 12.54 9.46538 12.4582 9.50556C12.3765 9.54574 12.2866 9.56678 12.1955 9.56707C12.0834 9.56671 11.9737 9.53496 11.8788 9.47541C11.7838 9.41586 11.7074 9.3309 11.6583 9.23015C11.6092 9.12941 11.5893 9.01691 11.6008 8.90543C11.6124 8.79394 11.6549 8.68793 11.7237 8.5994C12.1065 8.09726 12.4437 7.56199 12.7313 6.99995C12.2595 6.08027 10.3402 2.8014 6.99732 2.8014C6.63723 2.80218 6.27816 2.83969 5.92569 2.91336C5.77666 2.93304 5.62568 2.89606 5.50263 2.80972C5.37958 2.72337 5.29344 2.59398 5.26125 2.44714C5.22907 2.30031 5.2532 2.14674 5.32885 2.01685C5.40451 1.88696 5.52618 1.79021 5.66978 1.74576C6.10574 1.64961 6.55089 1.60134 6.99732 1.60181C11.5916 1.60181 13.7864 6.40856 13.9414 6.74792ZM2.20333 1.61685C2.35871 1.61411 2.5091 1.67179 2.6228 1.77774L12.2195 11.3744C12.3318 11.4869 12.3949 11.6393 12.3949 11.7983C12.3949 11.9572 12.3318 12.1097 12.2195 12.2221C12.107 12.3345 11.9546 12.3976 11.7956 12.3976C11.6367 12.3976 11.4842 12.3345 11.3718 12.2221L10.5081 11.3584C9.46549 12.0426 8.24432 12.4042 6.99729 12.3981C2.403 12.3981 0.208197 7.59135 0.0532336 7.25198C0.0509364 7.24694 0.0490875 7.2429 0.0476856 7.23986C0.0162332 7.16518 3.05176e-05 7.08497 3.05176e-05 7.00394C3.05176e-05 6.92291 0.0162332 6.8427 0.0476856 6.76802C0.631261 5.47831 1.46902 4.31959 2.51084 3.36119L1.77509 2.62545C1.66914 2.51175 1.61146 2.36136 1.61421 2.20597C1.61695 2.05059 1.6799 1.90233 1.78979 1.79244C1.89968 1.68254 2.04794 1.6196 2.20333 1.61685ZM7.45314 8.35147L5.68574 6.57609V6.5361C5.5872 6.78938 5.56498 7.06597 5.62183 7.33173C5.67868 7.59749 5.8121 7.84078 6.00563 8.03158C6.19567 8.21043 6.43052 8.33458 6.68533 8.39089C6.94014 8.44721 7.20543 8.43359 7.45314 8.35147ZM1.26327 6.99994C1.7351 7.91163 3.64645 11.1985 6.99729 11.1985C7.9267 11.2048 8.8408 10.9618 9.64438 10.4947L8.35682 9.20718C7.86027 9.51441 7.27449 9.64491 6.69448 9.57752C6.11446 9.51014 5.57421 9.24881 5.16131 8.83592C4.74842 8.42303 4.4871 7.88277 4.41971 7.30276C4.35232 6.72274 4.48282 6.13697 4.79005 5.64041L3.35855 4.2089C2.4954 5.00336 1.78523 5.94935 1.26327 6.99994Z"
              fill="currentColor"
            />
          </svg>
        ))}
      {feedback && overlayVisible && (
        <div className={cx("overlay")}>
          <div className={cx("meter")}>
            <div className={cx("meterLabel", { strength: meter?.strength ?? null })} style={{ width: meter?.width ?? "" }} />
          </div>
          <div className={cx("meterText")}>{infoText}</div>
        </div>
      )}
    </div>
  );
});
