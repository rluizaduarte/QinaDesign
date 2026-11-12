"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import BotaoAcao from "./BotaoAcao";
import { BOTAO_NEUTRO, TEXTAREA } from "./EstilosCampo";

const LARGURA_BOTAO = 96;

export default function ComentarioEtapa({
  valorInicial = "",
  onSalvar,
  onCancelar,
  sx = [],
}) {
  const [texto, setTexto] = useState(valorInicial);

  return (
    <Box
      sx={[
        { display: "flex", alignItems: "flex-start", gap: "16px" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        component="textarea"
        value={texto}
        onChange={(event) => setTexto(event.target.value)}
        placeholder="Escreva um comentário sobre a etapa"
        aria-label="Comentário da etapa"
        autoFocus
        sx={{ ...TEXTAREA, flex: 1, minWidth: 0 }}
      />

      <Box
        sx={{
          width: LARGURA_BOTAO,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <BotaoAcao type="button" onClick={() => onSalvar(texto.trim())}>
          Salvar
        </BotaoAcao>

        <BotaoAcao type="button" onClick={onCancelar} sx={BOTAO_NEUTRO}>
          Cancelar
        </BotaoAcao>
      </Box>
    </Box>
  );
}
