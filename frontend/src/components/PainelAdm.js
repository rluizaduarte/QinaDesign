"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { alpha } from "@mui/material/styles";
import { ChevronDown, Search } from "lucide-react";
import CartaoResumo from "./CartaoResumo";
import FormularioNovoPedido from "./FormularioNovoPedido";
import Label from "./Label";
import SectionTitle from "./SectionTitle";
import SidebarAdm from "./SidebarAdm";
import TabelaPedidos from "./TabelaPedidos";
import {
  PEDIDOS_ADM,
  carregarPedidosAdm,
  criarPedidoAdm,
  etapasDe,
} from "../lib/pedidosAdm";

const DISTANCIA_SIDEBAR = 115;
const ESPACO_TOPO = 30; // alinhado com a logo da sidebar
const LARGURA_CONTEUDO = 709;
const ESPACO_BLOCOS = 32;
const ALTURA_CAMPO = 49;
const LARGURA_BUSCA = 490;
const LARGURA_FILTRO = 203;
// 490 + 16 + 203 = 709
const ESPACO_BUSCA_FILTRO = LARGURA_CONTEUDO - LARGURA_BUSCA - LARGURA_FILTRO;

const FILTROS_VALIDOS = ["TODOS", "EM_ANDAMENTO", "FINALIZADO"];

export default function PainelAdm() {
  const [listaPedidos, setListaPedidos] = useState(PEDIDOS_ADM);
  const [filtro, setFiltro] = useState("TODOS");
  const [etapa, setEtapa] = useState("");
  const [busca, setBusca] = useState("");
  const [novoPedidoAberto, setNovoPedidoAberto] = useState(false);

  useEffect(() => {
    setListaPedidos(carregarPedidosAdm());

    const filtroDaUrl = new URLSearchParams(window.location.search).get(
      "filtro",
    );
    if (FILTROS_VALIDOS.includes(filtroDaUrl)) setFiltro(filtroDaUrl);
  }, []);

  const etapas = useMemo(() => etapasDe(listaPedidos), [listaPedidos]);

  const contagens = useMemo(
    () => ({
      TODOS: listaPedidos.length,
      EM_ANDAMENTO: listaPedidos.filter(
        (pedido) => pedido.situacao === "EM_ANDAMENTO",
      ).length,
      FINALIZADO: listaPedidos.filter(
        (pedido) => pedido.situacao === "FINALIZADO",
      ).length,
    }),
    [listaPedidos],
  );

  const pedidos = useMemo(() => {
    const termo = busca.trim().replace(/^#/, "").toLowerCase();

    return listaPedidos.filter((pedido) => {
      const combinaFiltro = filtro === "TODOS" || pedido.situacao === filtro;
      const combinaBusca =
        !termo || pedido.codigo.toLowerCase().includes(termo);
      const combinaEtapa = !etapa || pedido.etapaAtual === etapa;

      return combinaFiltro && combinaBusca && combinaEtapa;
    });
  }, [busca, etapa, filtro, listaPedidos]);

  function cadastrarPedido(dados) {
    setListaPedidos(criarPedidoAdm(dados));

    setFiltro("TODOS");
    setEtapa("");
    setBusca("");
    setNovoPedidoAberto(false);
  }

  return (
    <>
      <SidebarAdm
        filtro={filtro}
        onFiltro={setFiltro}
        onNovoPedido={() => setNovoPedidoAberto(true)}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          pl: { xs: 3, md: `${DISTANCIA_SIDEBAR}px` },
          pr: 3,
          pt: { xs: 4, md: `${ESPACO_TOPO}px` },
          pb: 8,
        }}
      >
        <Label>dashboard administrativo</Label>

        <SectionTitle component="h1" sx={{ mb: `${ESPACO_BLOCOS}px` }}>
          Andamento dos pedidos
        </SectionTitle>

        <Box
          sx={{
            width: "100%",
            maxWidth: LARGURA_CONTEUDO,
            display: "flex",
            flexDirection: "column",
            gap: `${ESPACO_BLOCOS}px`,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, minmax(0, 1fr))",
              },
              gap: `${ESPACO_BLOCOS}px`,
            }}
          >
            <CartaoResumo
              valor={contagens.TODOS}
              rotulo="Pedidos cadastrados"
            />
            <CartaoResumo
              valor={contagens.EM_ANDAMENTO}
              rotulo="Em andamento"
            />
            <CartaoResumo valor={contagens.FINALIZADO} rotulo="Finalizados" />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: `${ESPACO_BUSCA_FILTRO}px`,
            }}
          >
            {/* Busca com o mesmo desenho do SearchForm da home, mas de
                largura fixa e filtrando a lista enquanto o usuário digita. */}
            <Box
              component="form"
              role="search"
              onSubmit={(event) => event.preventDefault()}
              sx={{
                width: { xs: "100%", sm: LARGURA_BUSCA },
                height: ALTURA_CAMPO,
                px: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "primary.dark",
                color: "secondary.main",
                borderRadius: "4px",
              }}
            >
              <InputBase
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por código"
                slotProps={{ input: { "aria-label": "Buscar por código" } }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  color: "inherit",
                  // 16px no celular evita o zoom automático do iOS ao focar
                  fontSize: { xs: "16px", md: "0.9rem" },
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  "& input::placeholder": {
                    color: "secondary.main",
                    opacity: 1,
                  },
                }}
              />
              <Search size={24} strokeWidth={1.5} aria-hidden="true" />
            </Box>

            <Box
              sx={{
                position: "relative",
                width: { xs: "100%", sm: LARGURA_FILTRO },
                flexShrink: 0,
              }}
            >
              <Box
                component="select"
                value={etapa}
                onChange={(event) => setEtapa(event.target.value)}
                aria-label="Filtrar por etapa"
                sx={{
                  width: "100%",
                  height: ALTURA_CAMPO,
                  pl: "10px",
                  pr: "40px",
                  border: 0,
                  borderRadius: "4px",
                  appearance: "none",
                  bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.1),
                  color: "primary.dark",
                  fontFamily: "inherit",
                  fontSize: { xs: "16px", md: 15 },
                  fontWeight: 300,
                  cursor: "pointer",
                  "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.light",
                    outlineOffset: 1,
                  },
                }}
              >
                <option value="">Todas as etapas</option>
                {etapas.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </Box>

              <Box
                component="span"
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  display: "flex",
                  pointerEvents: "none",
                  color: "primary.dark",
                }}
              >
                <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
              </Box>
            </Box>
          </Box>

          <TabelaPedidos pedidos={pedidos} />
        </Box>
      </Box>

      <FormularioNovoPedido
        aberto={novoPedidoAberto}
        onFechar={() => setNovoPedidoAberto(false)}
        onCadastrar={cadastrarPedido}
      />
    </>
  );
}
