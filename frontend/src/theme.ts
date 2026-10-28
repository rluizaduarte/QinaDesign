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
  // 2) ADICIONE: este bloco palette
  palette: {
    primary: {
      main: cores.verdeProfundo,
      contrastText: cores.offWhite,
    },
    secondary: {
      main: cores.begeAreia,
      contrastText: cores.offWhite,
    },
    background: {
      default: cores.offWhite,
      paper: cores.offWhite,
    },
    text: {
      primary: cores.ferroCru,
    },
  },
  // o que você já tinha continua igual
  typography: {
    fontFamily: "var(--font-satoshi), sans-serif",
  },
});

export default theme;