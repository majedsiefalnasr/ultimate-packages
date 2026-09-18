import type { StyleModule } from "@ultimate/react-core";

/**
 * Hand-authored CSS, no `dt()` tokens, matching `date-picker-style.ts`'s
 * established React convention. Selector structure ported from real
 * source's own inline `styles` string
 * (`.vendor-extracted` `react/chips/ChipsBase.js`), `.p-chips*` renamed to
 * `.u-input-chips*`.
 */
const css = /*css*/ `
.u-input-chips { display: inline-flex; }
.u-input-chips-fluid { display: flex; width: 100%; }
.u-input-chips-container {
  margin: 0;
  padding: 0.25rem 0.5rem;
  list-style-type: none;
  cursor: text;
  overflow: hidden;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: #ffffff;
}
.u-input-chips-container:focus-within { border-color: #2196f3; box-shadow: 0 0 0 0.2rem rgba(33,150,243,0.2); }
.u-input-chips-invalid .u-input-chips-container { border-color: #e24c4c; }
.u-input-chips-disabled .u-input-chips-container { opacity: 1; background: #e9ecef; }
.u-input-chips-token {
  cursor: default;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  flex: 0 0 auto;
  background: #e9ecef;
  border-radius: 1rem;
  padding: 0.125rem 0.625rem;
}
.u-input-chips-token-focused { outline: 2px solid #2196f3; outline-offset: 1px; }
.u-input-chips-token-icon {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  border: 0 none;
  background: transparent;
  padding: 0;
  color: inherit;
}
.u-input-chips-input-token { flex: 1 1 auto; display: inline-flex; min-width: 4rem; }
.u-input-chips-input-token input {
  border: 0 none;
  outline: 0 none;
  background: transparent;
  margin: 0;
  padding: 0;
  box-shadow: none;
  border-radius: 0;
  width: 100%;
  font-family: inherit;
  font-size: 1rem;
}
`;

const classes = {
  root: (params: { filled?: boolean; focused?: boolean; disabled?: boolean; invalid?: boolean } = {}) => [
    "u-input-chips",
    {
      "u-input-chips-filled": params.filled,
      "u-input-chips-focused": params.focused,
      "u-input-chips-disabled": params.disabled,
      "u-input-chips-invalid": params.invalid,
    },
  ],
  container: "u-input-chips-container",
  token: (params: { focused?: boolean } = {}) => [
    "u-input-chips-token",
    { "u-input-chips-token-focused": params.focused },
  ],
  tokenIcon: "u-input-chips-token-icon",
  inputToken: "u-input-chips-input-token",
};

export const inputChipsStyleModule: StyleModule = { css, classes };
