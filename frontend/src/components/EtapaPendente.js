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
            position: "relative",
            width: 60,
            height: 60,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: (theme) => alpha(theme.palette.text.primary, 0.15),
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 60 60"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <circle
              cx="30"
              cy="30"
              r="29.5"
              fill="rgba(255, 255, 255, 0.1)"
              stroke="currentColor"
              strokeWidth="1"
              pathLength="12"
              strokeDasharray="0.65 0.35"
            />
          </Box>
          <Loader size={24} strokeWidth={1} />
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
