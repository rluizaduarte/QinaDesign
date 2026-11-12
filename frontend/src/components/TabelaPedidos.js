"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Eraser } from "lucide-react";
import { formatarAtualizadoEm } from "../lib/pedidosAdm";
import BotaoAcao from "./BotaoAcao";

const LARGURA_BOTAO = 76;

const COLUNAS = [
  { titulo: "Código", largura: 78 },
  { titulo: "Cliente", largura: 150 },
  { titulo: "Etapa atual", largura: 280 },
  { titulo: "Atualizado em", largura: 125 },
];

const BORDA = (theme) => `1px solid ${theme.palette.primary.light}`;

const CELULA_TRUNCADA = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const hrefEdicao = (codigo) =>
  `/dashboard/pedido/${encodeURIComponent(codigo)}`;

export default function TabelaPedidos({ pedidos }) {
  if (pedidos.length === 0) {
    return (
      <Typography sx={{ fontSize: 13, fontWeight: 300, color: "primary.dark" }}>
        Nenhum pedido encontrado para os filtros selecionados.
      </Typography>
    );
  }

  return (
    <Box
      component="table"
      sx={{
        width: "100%",
        tableLayout: "fixed",
        borderCollapse: "collapse",
        textAlign: "left",
        fontSize: 13,
        color: "primary.dark",
        "& th, & td": { borderBottom: BORDA, pr: 2 },
        "& th": { py: "12px", fontWeight: 300, whiteSpace: "nowrap" },
        "& td": { height: 59, fontWeight: 400, verticalAlign: "middle" },
        "& th:last-of-type, & td:last-of-type": { pr: 0 },
      }}
    >
      <colgroup>
        {COLUNAS.map(({ titulo, largura }) => (
          <col key={titulo} style={{ width: largura }} />
        ))}
        <col style={{ width: LARGURA_BOTAO }} />
      </colgroup>

      <Box component="thead">
        <Box component="tr">
          {COLUNAS.map(({ titulo }) => (
            <Box component="th" key={titulo} scope="col">
              {titulo}
            </Box>
          ))}
          <Box component="th" scope="col" aria-label="Ações" />
        </Box>
      </Box>

      <Box component="tbody">
        {pedidos.map((pedido) => (
          <Box component="tr" key={pedido.codigo}>
            <Box
              component="td"
              sx={{
                ...CELULA_TRUNCADA,
                fontWeight: 700,
                color: "text.primary",
              }}
            >
              #{pedido.codigo}
            </Box>

            <Box component="td" title={pedido.nomeCliente} sx={CELULA_TRUNCADA}>
              {pedido.nomeCliente}
            </Box>

            <Box
              component="td"
              title={pedido.etapaAtual?.nome}
              sx={CELULA_TRUNCADA}
            >
              {pedido.etapaAtual?.nome ?? "—"}
            </Box>

            <Box component="td" sx={CELULA_TRUNCADA}>
              {formatarAtualizadoEm(pedido.dataUltimaAtualizacao)}
            </Box>

            <Box component="td">
              <BotaoAcao
                component={Link}
                href={hrefEdicao(pedido.codigo)}
                aria-label={`Editar o pedido ${pedido.codigo}`}
                endIcon={
                  <Eraser size={16} strokeWidth={1.5} aria-hidden="true" />
                }
                sx={{
                  width: LARGURA_BOTAO,
                  px: "10px",
                  justifyContent: "space-between",
                  "& .MuiButton-endIcon": { ml: 0 },
                }}
              >
                Editar
              </BotaoAcao>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
