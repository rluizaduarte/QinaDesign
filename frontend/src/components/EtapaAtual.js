"use client";

import Box from "@mui/material/Box";
import EtapaTextos from "./EtapaTextos";
import { MapPin } from "lucide-react";
import { alpha } from "@mui/material/styles";

export default function EtapaAtual({ nome, data, comentario, ultima }) {
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
            width: 70,
            height: 70,
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
        altura={70}
      />
    </Box>
  );
}
