import { alpha } from "@mui/material/styles";

// campos de login e campos de cadastro
export const LARGURA_CAMPO = 455;
export const ALTURA_CAMPO = 49;
export const ALTURA_TEXTAREA = 80;

export const CAMPO = {
  display: "block",
  width: "100%",
  maxWidth: LARGURA_CAMPO,
  height: ALTURA_CAMPO,
  pl: "16px",
  pr: 2,
  bgcolor: "rgba(255, 255, 255, 0.7)",
  border: "1px solid",
  borderColor: (theme) => alpha(theme.palette.text.primary, 0.15),
  borderRadius: "4px",
  color: "text.primary",
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 500,
  "&:focus": { outline: "none", borderColor: "primary.main" },
  "&::placeholder": {
    color: (theme) => alpha(theme.palette.text.primary, 0.5),
    opacity: 1,
  },
};

export const TEXTAREA = {
  ...CAMPO,
  height: ALTURA_TEXTAREA,
  py: "14px",
  resize: "none",
};

export const TITULO_CAMPO = {
  display: "block",
  mb: "16px",
  fontSize: 15,
  fontWeight: 400,
  lineHeight: 1,
  color: "primary.dark",
};

export const COR_PLACEHOLDER = (theme) =>
  alpha(theme.palette.text.primary, 0.5);

export const ICONE_CAMPO = {
  position: "absolute",
  top: "50%",
  right: "16px",
  transform: "translateY(-50%)",
  display: "flex",
  pointerEvents: "none",
  color: "text.primary",
};

export const BOTAO_NEUTRO = {
  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
  color: "primary.dark",
  "&:hover": { bgcolor: (theme) => alpha(theme.palette.text.primary, 0.12) },
  "&.Mui-disabled": {
    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
    color: (theme) => alpha(theme.palette.primary.dark, 0.35),
  },
};
