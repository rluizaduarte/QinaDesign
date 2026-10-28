"use client";

import Link from "next/link";
import Box from "@mui/material/Box";

export default function GhostButton({ href, children }) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        height: 49,
        px: 4,
        fontSize: "0.9rem",
        fontWeight: 500,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        textDecoration: "none",
        color: "primary.main",
        bgcolor: "transparent",
        border: "1px solid rgba(90, 122, 101, 0.3)",
        borderRadius: "4px",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "&:hover": {
          bgcolor: "rgba(228, 222, 206, 0.05)",
          borderColor: "rgba(228, 222, 206, 0.6)",
        },
      }}
    >
      {children}
    </Box>
  );
}
