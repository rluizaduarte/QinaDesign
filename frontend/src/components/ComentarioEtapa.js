"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";

const BOTAO = {
  width: { xs: "100%", sm: 120 },
  height: 42,
  borderRadius: "4px",
  fontSize: "0.95rem",
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  "&:hover": { boxShadow: "none" },
};

// Barra de comentário da etapa atual: abre logo abaixo da trilha, com o campo
// de texto e os botões "Salvar" e "Cancelar" do protótipo.
export default function ComentarioEtapa({
  valorInicial = "",
  onSalvar,
  onCancelar,
}) {
  const [texto, setTexto] = useState(valorInicial);

  return (
    <Box
      sx={{
        mt: 3,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "stretch",
        gap: 1.5,
      }}
    >
      <Box
        component="textarea"
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
        placeholder="Escreva um comentário sobre a etapa"
        aria-label="Comentário da etapa"
        rows={3}
        autoFocus
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 90,
          p: 1.5,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.text.primary, 0.12),
          borderRadius: "4px",
          bgcolor: "common.white",
          color: "text.primary",
          fontFamily: "inherit",
          fontSize: "0.95rem",
          fontWeight: 400,
          resize: "vertical",
          "&:focus": {
            outline: "2px solid",
            outlineColor: "primary.light",
            outlineOffset: 1,
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          gap: 1,
        }}
      >
        <Button
          type="button"
          variant="contained"
          disableElevation
          onClick={() => onSalvar(texto.trim())}
          sx={{
            ...BOTAO,
            bgcolor: "primary.main",
            color: "secondary.main",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Salvar
        </Button>

        <Button
          type="button"
          onClick={onCancelar}
          sx={{
            ...BOTAO,
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
            color: "primary.dark",
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.12),
            },
          }}
        >
          Cancelar
        </Button>
      </Box>
    </Box>
  );
}
