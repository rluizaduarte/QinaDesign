"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import { Search } from "lucide-react";

const hidden = { opacity: 0, pointerEvents: "none" };

export default function SearchForm({ children }) {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleChange(event) {
    setValue(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const codigo = value.trim();
    if (codigo) router.push(`/pedido/${encodeURIComponent(codigo)}`);
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {/* espaço reservado de 265px: o form cresce por cima dele sem empurrar o botão */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: 265,
          flexShrink: 0,
          "&:hover + div, &:focus-within + div": hidden,
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: value ? 550 : 265,
            maxWidth: "calc(100vw - 48px)",
            bgcolor: "primary.dark",
            color: "secondary.main",
            borderRadius: "4px",
            overflow: "hidden",
            transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            "&:hover, &:focus-within": { width: 550 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              height: 49,
              px: 2,
            }}
          >
            <InputBase
              value={value}
              onChange={handleChange}
              placeholder="Digite o código do pedido"
              inputProps={{ "aria-label": "Código do pedido" }}
              sx={{
                flex: 1,
                color: "inherit",
                fontSize: "0.9rem",
                fontWeight: 500,
                letterSpacing: "0.02em",
                "& input::placeholder": { color: "secondary.main", opacity: 1 },
              }}
            />
            <IconButton
              type="submit"
              aria-label="Buscar pedido"
              disableRipple
              sx={{
                p: 0,
                color: "inherit",
                "&:hover": { bgcolor: "transparent" },
              }}
            >
              <Search size={24} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {children && (
        <Box sx={{ transition: "opacity 0.3s", ...(value && hidden) }}>
          {children}
        </Box>
      )}
    </Box>
  );
}
