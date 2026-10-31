"use client";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { Loader } from "lucide-react";

export default function EtapaPendente({ nome, ultima }) {
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
            border: "1px dashed",
            borderColor: (theme) => alpha(theme.palette.text.primary, 0.15),
            bgcolor: "rgba(255, 255, 255, 0.1)",
            color: (theme) => alpha(theme.palette.text.primary, 0.15),
          }}
        >
          <Loader size={24} />
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

      <Typography
        sx={{
          alignSelf: "flex-start",
          minHeight: 60,
          display: "flex",
          alignItems: "center",
          fontSize: 15,
          fontWeight: 900,
          color: (theme) => alpha(theme.palette.text.primary, 0.5),
        }}
      >
        {nome}
      </Typography>
    </Box>
  );
}
