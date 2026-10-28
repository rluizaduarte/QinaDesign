"use client";

import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import { Search } from "lucide-react";

const hidden = { opacity: 0, pointerEvents: "none" };

export default function SearchForm({ children }) {
  const [value, setValue] = useState("");
  const [searched, setSearched] = useState(false);

  function handleChange(event) {
    setValue(event.target.value);
    if (!event.target.value) setSearched(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (value.trim()) setSearched(true);
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        "& form:hover + div, & form:focus-within + div": hidden,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: value ? 550 : 265,
          maxWidth: "100%",
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

      {children && (
        <Box sx={{ transition: "opacity 0.3s", ...(value && hidden) }}>
          {children}
        </Box>
      )}
    </Box>
  );
}
