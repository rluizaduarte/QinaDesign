"use client";

import EtapaTextos from "./EtapaTextos";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { Check } from "lucide-react";

export default function EtapaConcluida({ nome, data, comentario, ultima }) {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box
        sx={{
          width: 70,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "1px solid",
            borderColor: "primary.light",
            bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.1),
            color: "primary.light",
          }}
        >
          <Check size={24} />
        </Box>

        {!ultima && (
          <Box
            sx={{
              flex: 1,
              minHeight: 24,
              borderLeft: "1px solid",
              borderColor: "primary.light",
            }}
          />
        )}
      </Box>

      <EtapaTextos
        nome={nome}
        data={data}
        comentario={comentario}
        altura={60}
      />
    </Box>
  );
}
