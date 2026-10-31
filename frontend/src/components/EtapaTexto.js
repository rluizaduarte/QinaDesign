"use client";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function EtapaTextos({ nome, data, comentario }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 15, fontWeight: 900, color: "primary.dark" }}>
        {nome}
      </Typography>

      {data && (
        <Typography
          sx={{ fontSize: 13, fontWeight: 300, color: "primary.dark" }}
        >
          {data}
        </Typography>
      )}

      {comentario && (
        <Typography
          component="button"
          type="button"
          sx={{
            display: "block",
            p: 0,
            border: 0,
            bgcolor: "transparent",
            cursor: "pointer",
            textAlign: "left",
            textDecoration: "underline",
            fontSize: 13,
            fontWeight: 300,
            color: "primary.dark",
          }}
        >
          Visualizar comentário da etapa
        </Typography>
      )}
    </Box>
  );
}
