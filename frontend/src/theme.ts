"use client";

import { createTheme } from "@mui/material/styles";

// 1) ADICIONE: paleta de cores da Qina Design
export const cores = {
  ferroCru: "#1A1A1A",
  verdeProfundo: "#394B44",
  begeAreia: "#7A6A49",
  offWhite: "#E4DED1",
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#4A6B58",
      dark: "#394B44",
      light: "#5C7A65",
    },
    secondary: {
      main: "#E4DED1",
    },
    text: {
      primary: "#1A1A1A",
    },
    background: {
      default: "#E4E3E0",
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