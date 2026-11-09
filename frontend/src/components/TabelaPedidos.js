"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { Pencil } from "lucide-react";

const COLUNAS = ["Código", "Cliente", "Etapa atual", "Atualizado em"];

const BORDA = (theme) =>
  `1px solid ${alpha(theme.palette.text.primary, 0.15)}`;

// Tabela de pedidos do painel. Em telas estreitas a tabela rola na horizontal
// para manter as colunas legíveis.
export default function TabelaPedidos({ pedidos }) {
  if (pedidos.length === 0) {
    return (
      <Typography
        sx={{
          mt: { xs: 4, md: 5 },
          fontSize: { xs: 14, md: 15 },
          fontWeight: 300,
          color: "primary.dark",
        }}
      >
        Nenhum pedido encontrado para os filtros selecionados.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: { xs: 4, md: 5 }, overflowX: "auto" }}>
      <Box
        component="table"
        sx={{
          width: "100%",
          minWidth: 720,
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <Box component="thead">
          <Box component="tr">
            {COLUNAS.map((coluna, indice) => (
              <Box
                component="th"
                key={coluna}
                scope="col"
                sx={{
                  pb: 2,
                  width: ["12%", "20%", "36%", "20%"][indice],
                  borderBottom: BORDA,
                  fontSize: { xs: 14, md: 15 },
                  fontWeight: 400,
                  color: "primary.light",
                  whiteSpace: "nowrap",
                }}
              >
                {coluna}
              </Box>
            ))}

            <Box
              component="th"
              scope="col"
              aria-label="Ações"
              sx={{ pb: 2, width: "12%", borderBottom: BORDA }}
            />
          </Box>
        </Box>

        <Box component="tbody">
          {pedidos.map((pedido) => (
            <Box
              component="tr"
              key={pedido.codigo}
              sx={{
                "& td": {
                  py: 2,
                  pr: 2,
                  borderBottom: BORDA,
                  fontSize: { xs: 14, md: 15 },
                  fontWeight: 400,
                  color: "primary.dark",
                  verticalAlign: "middle",
                },
                "& td:last-of-type": { pr: 0 },
              }}
            >
              <Box
                component="td"
                sx={{ fontWeight: 700, color: "text.primary", whiteSpace: "nowrap" }}
              >
                #{pedido.codigo}
              </Box>

              <Box component="td">{pedido.nomeCliente}</Box>

              <Box component="td">{pedido.etapaAtual}</Box>

              <Box component="td" sx={{ whiteSpace: "nowrap" }}>
                {pedido.atualizadoEm}
              </Box>

              <Box component="td" sx={{ textAlign: "right" }}>
                <Button
                  type="button"
                  variant="contained"
                  disableElevation
                  aria-label={`Editar pedido ${pedido.codigo}`}
                  endIcon={<Pencil size={16} strokeWidth={1.75} />}
                  sx={{
                    height: 40,
                    minWidth: 100,
                    px: 2.5,
                    bgcolor: "primary.main",
                    color: "secondary.main",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    textTransform: "none",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "primary.dark",
                      boxShadow: "none",
                    },
                  }}
                >
                  Editar
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
