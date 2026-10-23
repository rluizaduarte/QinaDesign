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
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: false,
        disableGutters: true,
      },
      styleOverrides: {
        root: {
          width: "100%",
          maxWidth: 1280,
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        },
      },
    },
  },
});

export default theme;
