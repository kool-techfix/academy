/**
 * Brand palette as raw hex, for contexts that cannot read CSS variables
 * (HTML emails). Keep in sync with the `--brand-*` tokens in
 * src/app/globals.css — the UI itself should always use those tokens.
 */
export const brandColors = {
  black: "#060807",
  green: "#085D1B",
  red: "#C6070C",
  white: "#FEFEFE",
  gray: "#DCDFDA",
  /* Pre-mixed equivalents of --brand-gray-light and --brand-text-muted. */
  grayLight: "#EFF0EE",
  textMuted: "#555756",
} as const;
