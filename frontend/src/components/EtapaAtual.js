"use client";

import Box from "@mui/material/Box";
import EtapaTextos from "./EtapaTextos";
import { MapPin } from "lucide-react";
import { alpha } from "@mui/material/styles";

export const LARGURA_COLUNA_ETAPA = { xs: 52, md: 70 };
const TAMANHO = LARGURA_COLUNA_ETAPA;

export default function EtapaAtual({ nome, data, comentario, acao, ultima }) {
  return (
    <Box sx={{ display: "flex", gap: { xs: 1.5, md: 2 } }}>
      <Box
        sx={{
          width: LARGURA_COLUNA_ETAPA,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: TAMANHO,
            height: TAMANHO,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            bgcolor: "primary.dark",
            color: "secondary.main",
          }}
        >
          <MapPin size={30} strokeWidth={1} />
        </Box>

        {!ultima && (
          <Box
            sx={{
              flex: 1,
              minHeight: 24,
              borderLeft: "1px solid",
              borderColor: (theme) => alpha(theme.palette.text.primary, 0.15),
            }}
          />
        )}
      </Box>

      <EtapaTextos
        nome={nome}
        data={data}
        comentario={comentario}
        acao={acao}
        altura={TAMANHO}
      />
    </Box>
  );
}
