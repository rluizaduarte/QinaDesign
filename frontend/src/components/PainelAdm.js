"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { alpha } from "@mui/material/styles";
import { ChevronDown, Search } from "lucide-react";
import CartaoResumo from "./CartaoResumo";
import FormularioNovoPedido from "./FormularioNovoPedido";
import SidebarAdm from "./SidebarAdm";
import TabelaPedidos from "./TabelaPedidos";
import {
  PEDIDOS_ADM,
  carregarPedidosAdm,
  criarPedidoAdm,
  etapasDe,
} from "../lib/pedidosAdm";

const ALTURA_CAMPO = 57;

const FILTROS_VALIDOS = ["TODOS", "EM_ANDAMENTO", "FINALIZADO"];

const TITULO_OCULTO = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

// Painel administrativo: menu de filtros, indicadores, busca e lista de pedidos.
export default function PainelAdm() {
  const [listaPedidos, setListaPedidos] = useState(PEDIDOS_ADM);
  const [filtro, setFiltro] = useState("TODOS");
  const [etapa, setEtapa] = useState("");
  const [busca, setBusca] = useState("");
  const [novoPedidoAberto, setNovoPedidoAberto] = useState(false);

  useEffect(() => {
    setListaPedidos(carregarPedidosAdm());

    // O menu lateral da edição volta para a lista já com o filtro escolhido.
    const filtroDaUrl = new URLSearchParams(window.location.search).get(
      "filtro"
    );
    if (FILTROS_VALIDOS.includes(filtroDaUrl)) setFiltro(filtroDaUrl);
  }, []);

  const etapas = useMemo(() => etapasDe(listaPedidos), [listaPedidos]);

  const contagens = useMemo(
    () => ({
      TODOS: listaPedidos.length,
      EM_ANDAMENTO: listaPedidos.filter(
        (pedido) => pedido.situacao === "EM_ANDAMENTO"
      ).length,
      FINALIZADO: listaPedidos.filter(
        (pedido) => pedido.situacao === "FINALIZADO"
      ).length,
    }),
    [listaPedidos]
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

    // Limpa os filtros para o pedido recém-cadastrado aparecer na lista.
    setFiltro("TODOS");
    setEtapa("");
    setBusca("");
    setNovoPedidoAberto(false);
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // pt reserva espaço para o Header, que fica por cima da página
        pt: 10,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <Box component="h1" sx={TITULO_OCULTO}>
        Painel administrativo
      </Box>

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
          px: { xs: 3, md: 6, lg: 8 },
          py: { xs: 4, md: 5 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 3 },
          }}
        >
          <CartaoResumo valor={contagens.TODOS} rotulo="Pedidos cadastrados" />
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
            alignItems: "stretch",
            gap: { xs: 2, md: 3 },
            mt: { xs: 4, md: 6 },
          }}
        >
          <Box
            component="form"
            role="search"
            onSubmit={(event) => event.preventDefault()}
            sx={{
              flex: "1 1 320px",
              maxWidth: 630,
              display: "flex",
              alignItems: "center",
              gap: 2,
              height: ALTURA_CAMPO,
              px: 2.5,
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
                // 16px no celular evita o zoom automático do iOS ao focar o campo
                fontSize: { xs: "16px", md: "1rem" },
                "& input::placeholder": {
                  color: "secondary.main",
                  opacity: 1,
                },
              }}
            />
            <Search size={22} strokeWidth={1.5} />
          </Box>

          <Box
            sx={{
              position: "relative",
              width: { xs: "100%", sm: 260 },
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
                pl: 2.5,
                pr: 6,
                border: 0,
                borderRadius: "4px",
                appearance: "none",
                bgcolor: (theme) =>
                  alpha(theme.palette.secondary.main, 0.55),
                color: "primary.main",
                fontFamily: "inherit",
                fontSize: { xs: "16px", md: "1rem" },
                cursor: "pointer",
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
                right: 16,
                transform: "translateY(-50%)",
                display: "flex",
                pointerEvents: "none",
                color: "primary.main",
              }}
            >
              <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
            </Box>
          </Box>
        </Box>

        <TabelaPedidos pedidos={pedidos} />
      </Box>

      <FormularioNovoPedido
        aberto={novoPedidoAberto}
        onFechar={() => setNovoPedidoAberto(false)}
        onCadastrar={cadastrarPedido}
      />
    </Box>
  );
}
