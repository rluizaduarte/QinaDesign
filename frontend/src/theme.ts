"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4A6B58",
      dark: "#394B44",
      light: "#5C7A65",
    },
  },
  typography: {
    fontFamily: "var(--font-satoshi), sans-serif",
  },
});

export default theme;
