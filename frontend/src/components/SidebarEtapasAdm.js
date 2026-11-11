"use client";

import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { Plus } from "lucide-react";

const FILTROS = [
  { valor: "TODOS", rotulo: "Todos os pedidos" },
  { valor: "EM_ANDAMENTO", rotulo: "Em andamento" },
  { valor: "FINALIZADO", rotulo: "Finalizados" },
];

const TITULO_SECAO = {
  fontSize: "0.75rem",
  fontWeight: 500,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "secondary.main",
  mb: 3,
};

// Item de seção do pedido: a seção ativa é a única com fundo preenchido.
const estiloItem = (ativo) => ({
  width: "100%",
  justifyContent: "flex-start",
  px: 2.5,
  py: 2,
  border: "1px solid",
  borderColor: (theme) =>
    alpha(theme.palette.secondary.main, ativo ? 0.55 : 0),
  borderRadius: "4px",
  bgcolor: (theme) =>
    ativo ? alpha(theme.palette.secondary.main, 0.14) : "transparent",
  color: "inherit",
  fontSize: "1.05rem",
  fontWeight: ativo ? 500 : 400,
  textAlign: "left",
  transition: "background-color 0.2s ease, border-color 0.2s ease",
  "&:hover": {
    bgcolor: (theme) =>
      alpha(theme.palette.secondary.main, ativo ? 0.18 : 0.08),
  },
});

// Barra lateral do acompanhamento de etapas. No protótipo ela ocupa
// 498 x 1024 e traz a logo da Qina, o cadastro de pedido, os filtros e as
// seções do pedido (com "Etapas" em destaque nesta tela).
export default function SidebarEtapasAdm({ codigo, onNovoPedido }) {
  return (
    <Box
      component="aside"
      sx={{
        flexShrink: 0,
        width: { xs: "100%", md: 498 },
        minHeight: { xs: "auto", md: 1024 },
        bgcolor: "primary.dark",
        color: "secondary.main",
        px: { xs: 3, md: 8 },
        py: { xs: 4, md: 5 },
      }}
    >
      <Link href="/" aria-label="Qina Design - página inicial">
        <Image
          src="/logo_horizontal-off-white.svg"
          alt="Qina Design"
          width={165}
          height={40}
        />
      </Link>

      <ButtonBase
        type="button"
        onClick={onNovoPedido}
        sx={{
          mt: 6,
          width: "100%",
          height: 68,
          px: 2.5,
          justifyContent: "space-between",
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.secondary.main, 0.35),
          borderRadius: "4px",
          bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.06),
          color: "secondary.main",
          fontSize: "1.05rem",
          transition: "background-color 0.2s ease",
          "&:hover": {
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.12),
          },
        }}
      >
        Novo pedido
        <Plus size={22} strokeWidth={1.5} aria-hidden="true" />
      </ButtonBase>

      <Box component="nav" aria-label="Filtrar por etapa" sx={{ mt: 6 }}>
        <Typography component="h2" sx={TITULO_SECAO}>
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
            gap: 1,
          }}
        >
          {FILTROS.map(({ valor, rotulo }) => (
            <Box component="li" key={valor}>
              <ButtonBase
                component={Link}
                href={
                  valor === "TODOS" ? "/dashboard" : `/dashboard?filtro=${valor}`
                }
                sx={{
                  width: "100%",
                  justifyContent: "flex-start",
                  px: 1.5,
                  py: 1.75,
                  borderRadius: "4px",
                  color: "inherit",
                  fontSize: "1.05rem",
                  fontWeight: 400,
                  textAlign: "left",
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    bgcolor: (theme) =>
                      alpha(theme.palette.secondary.main, 0.08),
                  },
                }}
              >
                {rotulo}
              </ButtonBase>
            </Box>
          ))}
        </Box>
      </Box>

      <Box component="nav" aria-label="Sobre o pedido" sx={{ mt: 6 }}>
        <Typography component="h2" sx={TITULO_SECAO}>
          Sobre o pedido
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <ButtonBase
            component={Link}
            href={
              codigo
                ? `/dashboard/pedido/${encodeURIComponent(codigo)}`
                : "/dashboard"
            }
            sx={estiloItem(false)}
          >
            Dados do pedido
          </ButtonBase>

          <ButtonBase type="button" aria-current="page" sx={estiloItem(true)}>
            Etapas
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
}
