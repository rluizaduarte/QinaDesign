"use client";

import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import BotaoAcao from "./BotaoAcao";
import { BOTAO_NEUTRO } from "./EstilosCampo";

const LARGURA = 320;

export default function PopupConfirmacao({
  ancora,
  titulo,
  descricao,
  textoConfirmar = "Confirmar",
  textoOcupado = "Aguarde...",
  ocupado = false,
  erro = "",
  onConfirmar,
  onCancelar,
}) {
  return (
    <Popover
      open={Boolean(ancora)}
      anchorEl={ancora}
      onClose={ocupado ? undefined : onCancelar}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            width: LARGURA,
            mt: 1,
            p: "20px",
            borderRadius: "4px",
            border: "1px solid",
            borderColor: (theme) => alpha(theme.palette.text.primary, 0.15),
            bgcolor: "background.default",
            backgroundImage: "none",
            boxShadow: (theme) =>
              `0 8px 24px ${alpha(theme.palette.primary.dark, 0.18)}`,
          },
        },
      }}
    >
      <Typography sx={{ fontSize: 15, fontWeight: 700, color: "text.primary" }}>
        {titulo}
      </Typography>

      <Typography
        sx={{ mt: 1, fontSize: 13, fontWeight: 300, color: "primary.dark" }}
      >
        {descricao}
      </Typography>

      {erro && (
        <Typography
          role="alert"
          sx={{ mt: 1.5, fontSize: 13, color: "error.main" }}
        >
          {erro}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          mt: "20px",
        }}
      >
        <BotaoAcao
          type="button"
          onClick={onCancelar}
          sx={BOTAO_NEUTRO}
          disabled={ocupado}
        >
          Cancelar
        </BotaoAcao>
        <BotaoAcao
          type="button"
          onClick={onConfirmar}
          disabled={ocupado}
          autoFocus
        >
          {ocupado ? textoOcupado : textoConfirmar}
        </BotaoAcao>
      </Box>
    </Popover>
  );
}
