import { createGlobalTheme, globalStyle } from "@macaron-css/core";

export const theme = createGlobalTheme(":root", {
  fontSize: {
    xs2: "0.75rem",
    xs: "0.8125rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    xl2: "1.5rem",
    xl3: "1.875rem",
    xl4: "2.25rem",
  },
  space: {
    0: "0px",
    px: "1px",
    xxs: "2px",
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "64px",
  },
  color: {},
});
