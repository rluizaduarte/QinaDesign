"use client";

import Box from "@mui/material/Box";
import EtapaTextos from "./EtapaTextos";
import { MapPin } from "lucide-react";

export default function EtapaAtual({ nome, data, comentario }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
        <MapPin size={30} />
      </Box>

      <EtapaTextos nome={nome} data={data} comentario={comentario} />
    </Box>
  );
}
