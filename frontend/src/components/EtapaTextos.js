"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

const LINK = {
  alignSelf: "flex-start",
  p: 0,
  border: 0,
  bgcolor: "transparent",
  cursor: "pointer",
  textAlign: "left",
  textDecoration: "underline",
  fontFamily: "inherit",
  fontSize: { xs: 12, md: 13 },
  fontWeight: 300,
  color: "primary.dark",
};

const LARGURA_COMENTARIO = 340;

export default function EtapaTextos({
  nome,
  data,
  comentario,
  acao,
  altura = 60,
}) {
  const [ancora, setAncora] = useState(null);

  return (
    <Box
      sx={{
        alignSelf: "flex-start",
        minHeight: altura,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 14, md: 15 },
          fontWeight: 900,
          color: "primary.dark",
        }}
      >
        {nome}
      </Typography>

      {data && (
        <Typography
          sx={{
            fontSize: { xs: 12, md: 13 },
            fontWeight: 300,
            color: "primary.dark",
          }}
        >
          {data}
        </Typography>
      )}

      {acao ? (
        <Typography
          component="button"
          type="button"
          onClick={acao.onClick}
          sx={LINK}
        >
          {acao.rotulo}
        </Typography>
      ) : (
        comentario && (
          <>
            <Typography
              component="button"
              type="button"
              onClick={(event) => setAncora(event.currentTarget)}
              aria-haspopup="dialog"
              aria-expanded={Boolean(ancora)}
              sx={LINK}
            >
              Visualizar comentário da etapa
            </Typography>

            <Popover
              open={Boolean(ancora)}
              anchorEl={ancora}
              onClose={() => setAncora(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              slotProps={{
                paper: {
                  sx: {
                    width: LARGURA_COMENTARIO,
                    maxWidth: "calc(100vw - 32px)",
                    mt: 1,
                    p: "16px 20px",
                    borderRadius: "4px",
                    border: "1px solid",
                    borderColor: (theme) =>
                      alpha(theme.palette.text.primary, 0.15),
                    bgcolor: "background.default",
                    backgroundImage: "none",
                    boxShadow: (theme) =>
                      `0 8px 24px ${alpha(theme.palette.primary.dark, 0.18)}`,
                  },
                },
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "primary.light",
                }}
              >
                Comentário da etapa
              </Typography>

              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 300,
                  lineHeight: 1.5,
                  overflowWrap: "anywhere",
                  color: "text.primary",
                }}
              >
                {comentario}
              </Typography>
            </Popover>
          </>
        )
      )}
    </Box>
  );
}
