"use client";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

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

export default function EtapaTextos({
  nome,
  data,
  comentario,
  acao,
  altura = 60,
}) {
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
          <Typography component="button" type="button" sx={LINK}>
            Visualizar comentário da etapa
          </Typography>
        )
      )}
    </Box>
  );
}
