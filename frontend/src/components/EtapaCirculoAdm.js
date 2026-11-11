"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

// Diâmetro dos círculos numerados, no tamanho do protótipo (60 x 60).
const TAMANHO = 60;

// Linha de ligação entre as etapas: tracejada antes das etapas futuras.
const estiloLinha = (situacao) => ({
  flex: 1,
  borderTop: situacao === "PENDENTE" ? "1px dashed" : "1px solid",
  borderColor: (theme) => alpha(theme.palette.text.primary, 0.2),
});

const estiloCirculo = (situacao) => {
  if (situacao === "ATUAL") {
    return { bgcolor: "primary.dark", color: "secondary.main" };
  }

  if (situacao === "CONCLUIDA") {
    return {
      bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.55),
      color: "primary.light",
    };
  }

  return {
    border: "1px dashed",
    borderColor: (theme) => alpha(theme.palette.text.primary, 0.25),
    color: (theme) => alpha(theme.palette.text.primary, 0.4),
  };
};

const corDoNome = (situacao) =>
  situacao === "PENDENTE"
    ? (theme) => alpha(theme.palette.text.primary, 0.45)
    : "text.primary";

// Uma etapa da trilha horizontal: círculo numerado, linhas de ligação e, abaixo,
// o nome, a data, o comentário salvo e o link "Comentar" (etapa atual).
export default function EtapaCirculoAdm({
  numero,
  nome,
  situacao,
  data,
  comentario,
  onComentar,
  refAtual,
}) {
  return (
    <Box
      ref={refAtual}
      sx={{
        flex: "0 0 auto",
        width: { xs: 168, md: 220 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Box sx={estiloLinha(situacao)} />

        <Box
          sx={{
            width: TAMANHO,
            height: TAMANHO,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            fontSize: 20,
            ...estiloCirculo(situacao),
          }}
        >
          {numero}
        </Box>

        <Box sx={estiloLinha(situacao)} />
      </Box>

      <Box sx={{ mt: 2, px: 1, minWidth: 0, textAlign: "center" }}>
        <Typography
          sx={{
            fontSize: { xs: 14, md: 16 },
            fontWeight: 700,
            lineHeight: 1.25,
            overflowWrap: "anywhere",
            color: corDoNome(situacao),
          }}
        >
          {nome}
        </Typography>

        {data && (
          <Typography
            sx={{
              mt: 0.5,
              fontSize: { xs: 12, md: 13 },
              fontWeight: 300,
              color: (theme) => alpha(theme.palette.text.primary, 0.7),
            }}
          >
            {data}
          </Typography>
        )}

        {comentario && (
          <Typography
            sx={{
              mt: 0.5,
              fontSize: { xs: 12, md: 13 },
              fontWeight: 300,
              fontStyle: "italic",
              overflowWrap: "anywhere",
              color: "primary.dark",
            }}
          >
            “{comentario}”
          </Typography>
        )}

        {onComentar && (
          <Typography
            component="button"
            type="button"
            onClick={onComentar}
            sx={{
              mt: 0.5,
              p: 0,
              border: 0,
              bgcolor: "transparent",
              cursor: "pointer",
              textAlign: "center",
              textDecoration: "underline",
              fontFamily: "inherit",
              fontSize: { xs: 12, md: 13 },
              fontWeight: 300,
              color: "primary.dark",
            }}
          >
            Comentar
          </Typography>
        )}
      </Box>
    </Box>
  );
}
