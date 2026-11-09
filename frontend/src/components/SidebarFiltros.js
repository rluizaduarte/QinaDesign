"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

const FILTROS = [
  { valor: "TODOS", rotulo: "Todos os pedidos" },
  { valor: "EM_ANDAMENTO", rotulo: "Em andamento" },
  { valor: "FINALIZADO", rotulo: "Finalizados" },
];

// Lista de filtros por situação, usada dentro do menu lateral do painel.
export default function SidebarFiltros({ filtro, onChange }) {
  return (
    <Box component="nav" aria-label="Filtrar por etapa">
      <Typography
        component="h2"
        sx={{
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "secondary.main",
          mb: 3,
        }}
      >
        Filtrar por etapa
      </Typography>

      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {FILTROS.map(({ valor, rotulo }) => {
          const ativo = filtro === valor;

          return (
            <Box component="li" key={valor}>
              <ButtonBase
                type="button"
                onClick={() => onChange(valor)}
                aria-pressed={ativo}
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  px: { xs: 2, md: 2.5 },
                  py: 2,
                  border: "1px solid",
                  borderColor: (theme) =>
                    alpha(theme.palette.secondary.main, ativo ? 0.55 : 0.3),
                  borderRadius: "4px",
                  bgcolor: (theme) =>
                    ativo
                      ? alpha(theme.palette.secondary.main, 0.14)
                      : "transparent",
                  color: "inherit",
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  fontWeight: ativo ? 500 : 400,
                  textAlign: "left",
                  transition:
                    "background-color 0.2s ease, border-color 0.2s ease",
                  "&:hover": {
                    bgcolor: (theme) =>
                      alpha(theme.palette.secondary.main, ativo ? 0.18 : 0.08),
                  },
                }}
              >
                {rotulo}
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
