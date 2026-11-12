"use client";

import Image from "next/image";
import Link from "next/link";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { Plus } from "lucide-react";

const LARGURA_SIDEBAR = 475;
const LARGURA_CONTEUDO = 295;
const ALTURA_BOTAO = 49;
const ESPACO_BLOCOS = 30; // topo → logo → "Novo pedido" → navs
const ESPACO_ITENS = 20; // label → botões e entre os botões de uma nav
const LOGO = { largura: 166, altura: 40 };

const FILTROS = [
  { valor: "TODOS", rotulo: "Todos os pedidos" },
  { valor: "EM_ANDAMENTO", rotulo: "Em andamento" },
  { valor: "FINALIZADO", rotulo: "Finalizados" },
];

const SECOES_EDICAO = [
  { valor: "dados", rotulo: "Dados do pedido" },
  { valor: "etapas", rotulo: "Etapas" },
  { valor: "financeiro", rotulo: "Financeiro" },
  { valor: "documentos", rotulo: "Documentos" },
];

const ROTULO_NAV = {
  display: "block",
  mb: `${ESPACO_ITENS}px`,
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1,
  textTransform: "uppercase",
  color: (theme) => alpha(theme.palette.common.white, 0.5),
};

const BOTAO_BASE = {
  width: "100%",
  height: ALTURA_BOTAO,
  px: "10px",
  justifyContent: "flex-start",
  borderRadius: "4px",
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1,
  textAlign: "left",
  transition: "background-color 0.2s ease, color 0.2s ease",
  "&.Mui-focusVisible": {
    outline: "2px solid",
    outlineColor: "secondary.main",
    outlineOffset: 2,
  },
};

// estados dos itens de nav
// ativo = fundo primary.light a 50%, texto a 100%
// inativo = fundo a 0%, texto a 80%
// hover = fundo a 25%, texto a 80% (aplicado apenas aos itens inativos)
const estiloItemNav = (ativo) => ({
  ...BOTAO_BASE,
  bgcolor: (theme) => alpha(theme.palette.primary.light, ativo ? 0.5 : 0),
  color: (theme) =>
    ativo
      ? theme.palette.secondary.main
      : alpha(theme.palette.secondary.main, 0.8),
  ...(!ativo && {
    "&:hover": {
      bgcolor: (theme) => alpha(theme.palette.primary.light, 0.25),
    },
  }),
});

function NavSidebar({ rotulo, itens, valorAtivo, onSelecionar, ariaLabel }) {
  return (
    <Box component="nav" aria-label={ariaLabel} sx={{ width: "100%" }}>
      <Typography component="h2" sx={ROTULO_NAV}>
        {rotulo}
      </Typography>

      <Box
        component="ul"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          display: "flex",
          flexDirection: "column",
          gap: `${ESPACO_ITENS}px`,
        }}
      >
        {itens.map(({ valor, rotulo: texto }) => {
          const ativo = valorAtivo === valor;

          return (
            <Box component="li" key={valor}>
              <ButtonBase
                type="button"
                onClick={() => onSelecionar(valor)}
                aria-current={ativo ? "page" : undefined}
                sx={estiloItemNav(ativo)}
              >
                {texto}
              </ButtonBase>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// ,enu lateral da área administrativa
// a nav "Editar pedido" só é exibida quando um pedido ta aberto
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
        width: { xs: "100%", md: LARGURA_SIDEBAR },
        minHeight: { xs: "auto", md: "100vh" },
        bgcolor: "primary.dark",
        color: "secondary.main",
        px: 3,
        pt: `${ESPACO_BLOCOS}px`,
        pb: 5,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {/* Coluna de 295px centralizada na sidebar; os elementos ficam
          alinhados à esquerda dentro dela. */}
      <Box
        sx={{
          width: LARGURA_CONTEUDO,
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: `${ESPACO_BLOCOS}px`,
        }}
      >
        <Link
          href="/"
          aria-label="Qina Design - página inicial"
          style={{ display: "inline-flex", lineHeight: 0 }}
        >
          <Image
            src="/logo_horizontal-off-white.svg"
            alt="Qina Design"
            width={LOGO.largura}
            height={LOGO.altura}
            priority
            style={{ width: LOGO.largura, height: LOGO.altura }}
          />
        </Link>

        <ButtonBase
          type="button"
          onClick={onNovoPedido}
          sx={{
            ...BOTAO_BASE,
            justifyContent: "space-between",
            bgcolor: (theme) => alpha(theme.palette.primary.light, 0.5),
            color: "secondary.main",
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.primary.light, 0.65),
            },
          }}
        >
          Novo pedido
          <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
        </ButtonBase>

        <NavSidebar
          rotulo="Filtrar"
          ariaLabel="Filtrar pedidos"
          itens={FILTROS}
          valorAtivo={filtro}
          onSelecionar={onFiltro}
        />

        {mostrarEdicao && (
          <NavSidebar
            rotulo="Editar pedido"
            ariaLabel="Seções do pedido"
            itens={SECOES_EDICAO}
            valorAtivo={secao}
            onSelecionar={onSecao}
          />
        )}
      </Box>
    </Box>
  );
}
