"use client";

import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";

export default function BotaoAcao({ sx = [], ...props }) {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={[
        {
          height: 35,
          minWidth: 0,
          px: "16px",
          bgcolor: "primary.dark",
          color: "secondary.main",
          borderRadius: "4px",
          fontSize: 13,
          fontWeight: 500,
          lineHeight: 1,
          textTransform: "none",
          whiteSpace: "nowrap",
          boxShadow: "none",
          "&:hover": { bgcolor: "primary.main", boxShadow: "none" },
          "&.Mui-disabled": {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.4),
            color: "secondary.main",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    />
  );
}
