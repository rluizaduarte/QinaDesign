"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

// Diâmetros dos círculos numerados: 60 nas etapas anteriores e posteriores,
// 70 na etapa atual.
export const TAMANHO_CIRCULO = { padrao: 60, atual: 70 };
const LARGURA_ETAPA = 215; // três etapas visíveis nos 645px da trilha

const estiloCirculo = (situacao) => {
  if (situacao === "ATUAL") {
    return { bgcolor: "primary.dark", color: "secondary.main" };
  }

  if (situacao === "CONCLUIDA") {
    return {
      border: "1px solid",
      borderColor: (theme) => alpha(theme.palette.primary.light, 0.5),
      bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.1),
      color: "primary.light",
    };
  }

  return {
    border: "1px dashed",
    borderColor: (theme) => alpha(theme.palette.text.primary, 0.25),
    color: (theme) => alpha(theme.palette.text.primary, 0.4),
  };
};

// Linha de ligação: tracejada nos trechos que levam a etapas futuras.
const estiloLinha = (tracejada) => ({
  flex: 1,
  borderTop: tracejada ? "1px dashed" : "1px solid",
  borderColor: (theme) => alpha(theme.palette.text.primary, 0.2),
});

// Círculo numerado isolado, reutilizado no modo de comentário.
export function CirculoEtapa({ numero, situacao }) {
  const tamanho =
    situacao === "ATUAL" ? TAMANHO_CIRCULO.atual : TAMANHO_CIRCULO.padrao;

  return (
    <Box
      sx={{
        width: tamanho,
        height: tamanho,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        fontSize: situacao === "ATUAL" ? 22 : 20,
        fontWeight: 500,
        ...estiloCirculo(situacao),
      }}
    >
      {numero}
    </Box>
  );
}

// Uma etapa da trilha horizontal: círculo numerado com as linhas de ligação
// e, abaixo, o nome, a data e (na etapa atual) a ação de comentar.
export default function EtapaCirculoAdm({
  numero,
  nome,
  situacao,
  data,
  acao,
  refAtual,
}) {
  const pendente = situacao === "PENDENTE";

  return (
    <Box
      ref={refAtual}
      sx={{
        flex: "0 0 auto",
        width: LARGURA_ETAPA,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Altura fixa de 70px: os círculos de 60 e 70 ficam alinhados pelo
          centro, e as linhas passam sempre na mesma altura. */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: TAMANHO_CIRCULO.atual,
        }}
      >
        <Box sx={estiloLinha(pendente)} />
        <CirculoEtapa numero={numero} situacao={situacao} />
        <Box sx={estiloLinha(situacao !== "CONCLUIDA")} />
      </Box>

      <Box
        sx={{
          mt: 2,
          px: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1.25,
            overflowWrap: "anywhere",
            color: (theme) =>
              pendente
                ? alpha(theme.palette.text.primary, 0.45)
                : theme.palette.text.primary,
          }}
        >
          {nome}
        </Typography>

        {data && (
          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              fontWeight: 300,
              color: (theme) => alpha(theme.palette.text.primary, 0.7),
            }}
          >
            {data}
          </Typography>
        )}

        {acao && (
          <Typography
            component="button"
            type="button"
            onClick={acao.onClick}
            sx={{
              mt: 0.5,
              p: 0,
              border: 0,
              bgcolor: "transparent",
              cursor: "pointer",
              textDecoration: "underline",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 300,
              color: "primary.dark",
            }}
          >
            {acao.rotulo}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
