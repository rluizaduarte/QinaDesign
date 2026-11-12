"use client";

import EtapaTextos from "./EtapaTextos";
import { LARGURA_COLUNA_ETAPA } from "./EtapaAtual";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { Check } from "lucide-react";

const TAMANHO = { xs: 46, md: 60 };

export default function EtapaConcluida({ nome, data, comentario, ultima }) {
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
            border: "1px solid",
            borderColor: (theme) => alpha(theme.palette.primary.light, 0.5),
            bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.1),
            color: "primary.light",
          }}
        >
          <Check size={24} strokeWidth={1} />
        </Box>

        {!ultima && (
          <Box
            sx={{
              flex: 1,
              minHeight: 34,
              borderLeft: "1px solid",
              borderColor: (theme) => alpha(theme.palette.primary.light, 0.5),
            }}
          />
        )}
      </Box>

      <EtapaTextos
        nome={nome}
        data={data}
        comentario={comentario}
        altura={TAMANHO}
      />
    </Box>
  );
}
