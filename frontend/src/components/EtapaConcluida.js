"use client";

import EtapaTextos from "./EtapaTextos";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { Check } from "lucide-react";

export default function EtapaConcluida({ nome, data, comentario }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {/* coluna de 70px p td ficar alinhado c a atual */}
      <Box
        sx={{
          width: 70,
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "0.5px solid",
            borderColor: "primary.light",
            bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.1),
            color: "primary.light",
          }}
        >
          <Check size={24} />
        </Box>
      </Box>

      <EtapaTextos nome={nome} data={data} comentario={comentario} />
    </Box>
  );
}
