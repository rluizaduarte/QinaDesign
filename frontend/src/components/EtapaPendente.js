"use client";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";

export default function EtapaPendente({ nome }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            borderRadius: "50%",
            border: "1px dashed",
            borderColor: (theme) => alpha(theme.palette.text.primary, 0.15),
            bgcolor: "rgba(255, 255, 255, 0.1)",
          }}
        />
      </Box>

      <Typography
        sx={{
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
