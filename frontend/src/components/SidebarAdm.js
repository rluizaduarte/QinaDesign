"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { Plus } from "lucide-react";
import SidebarFiltros from "./SidebarFiltros";

const SECOES_EDICAO = [
  { valor: "dados", rotulo: "Dados do pedido" },
  { valor: "etapas", rotulo: "Etapas" },
];

const TITULO_SECAO = {
  fontSize: "0.75rem",
  fontWeight: 500,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "secondary.main",
  mb: 3,
};

const estiloItem = (ativo) => ({
  width: "100%",
  justifyContent: "flex-start",
  px: { xs: 2, md: 2.5 },
  py: 2,
  border: "1px solid",
  borderColor: (theme) =>
    alpha(theme.palette.secondary.main, ativo ? 0.55 : 0.3),
  borderRadius: "4px",
  bgcolor: (theme) =>
    ativo ? alpha(theme.palette.secondary.main, 0.14) : "transparent",
  color: "inherit",
  fontSize: { xs: "1rem", md: "1.05rem" },
  fontWeight: ativo ? 500 : 400,
  textAlign: "left",
  transition: "background-color 0.2s ease, border-color 0.2s ease",
  "&:hover": {
    bgcolor: (theme) =>
      alpha(theme.palette.secondary.main, ativo ? 0.18 : 0.08),
  },
});

// Menu lateral da área administrativa, compartilhado pela listagem e pela
// página de edição. Na listagem mostra os filtros; na edição mostra também as
// seções do pedido.
export default function SidebarAdm({
  filtro,
  onFiltro,
  onNovoPedido,
  secao,
  onSecao,
  mostrarEdicao = false,
}) {
  return (
    <Box
      component="aside"
      sx={{
        flexShrink: 0,
        width: { xs: "100%", md: 400, lg: 450 },
        bgcolor: "primary.dark",
        color: "secondary.main",
        px: { xs: 3, md: 4 },
        py: { xs: 4, md: 6 },
      }}
    >
      <ButtonBase
        type="button"
        onClick={onNovoPedido}
        sx={{
          width: "100%",
          height: { xs: 60, md: 68 },
          px: { xs: 2, md: 2.5 },
          justifyContent: "space-between",
          border: "1px solid",
          borderColor: (theme) =>
            alpha(theme.palette.secondary.main, 0.35),
          borderRadius: "4px",
          bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.06),
          color: "secondary.main",
          fontSize: { xs: "1rem", md: "1.05rem" },
          transition: "background-color 0.2s ease",
          "&:hover": {
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.12),
          },
        }}
      >
        Novo pedido
        <Plus size={22} strokeWidth={1.5} aria-hidden="true" />
      </ButtonBase>

      <Box sx={{ mt: 5 }}>
        <SidebarFiltros filtro={filtro} onChange={onFiltro} />
      </Box>

      {mostrarEdicao && (
        <Box component="nav" aria-label="Editar pedido" sx={{ mt: 5 }}>
          <Typography component="h2" sx={TITULO_SECAO}>
            Editar pedido
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {SECOES_EDICAO.map(({ valor, rotulo }) => {
              const ativo = secao === valor;

              return (
                <ButtonBase
                  key={valor}
                  type="button"
                  onClick={() => onSecao(valor)}
                  aria-current={ativo ? "page" : undefined}
                  sx={estiloItem(ativo)}
                >
                  {rotulo}
                </ButtonBase>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
