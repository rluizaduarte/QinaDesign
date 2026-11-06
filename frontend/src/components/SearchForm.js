"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import { Search } from "lucide-react";

const hidden = { opacity: 0, pointerEvents: "none" };

export default function SearchForm({ children, defaultValue = "" }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(event) {
    event.preventDefault();
    const codigo = value.trim();
    if (!codigo) return;
    router.push(`/pedido/${encodeURIComponent(codigo)}`);
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: { xs: 1.5, md: 2 },
        "& form:hover + div, & form:focus-within + div": hidden,
      }}
    >
      {/* espaço reservado de 265px: o form cresce por cima dele sem empurrar o botão */}
      <Box
        sx={{
          // No celular o campo ocupa a linha inteira; a partir de md mantém a
          // largura original, que expande ao receber foco/hover.
          width: { xs: "100%", md: value ? 550 : 265 },
          maxWidth: "100%",
          bgcolor: "primary.dark",
          color: "secondary.main",
          borderRadius: "4px",
          overflow: "hidden",
          transition: { md: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)" },
          "&:hover, &:focus-within": { width: { md: 550 } },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: 49,
            px: { xs: 1.5, md: 2 },
          }}
        >
          <InputBase
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Digite o código do pedido"
            slotProps={{ input: { "aria-label": "Código do pedido" } }}
            sx={{
              flex: 1,
              minWidth: 0,
              color: "inherit",
              fontSize: { xs: "16px", md: "0.9rem" },
              fontWeight: 500,
              letterSpacing: "0.02em",
              "& input::placeholder": {
                color: "secondary.main",
                opacity: 1,
              },
            }}
          />

          <IconButton
            type="submit"
            aria-label="Buscar pedido"
            disableRipple
            sx={{
              p: 0,
              flexShrink: 0,
              color: "inherit",
              "&:hover": { bgcolor: "transparent" },
            }}
          >
            <Search size={24} />
          </IconButton>
        </Box>
      </Box>

      {children && (
        <Box
          sx={{
            width: { xs: "100%", md: "auto" },
            transition: "opacity 0.3s",
            ...(value && hidden),
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}
