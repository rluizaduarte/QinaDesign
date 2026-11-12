"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { ChevronDown, Search } from "lucide-react";
import CartaoResumo from "./CartaoResumo";
import FormularioNovoPedido from "./FormularioNovoPedido";
import Label from "./Label";
import SectionTitle from "./SectionTitle";
import SidebarAdm from "./SidebarAdm";
import TabelaPedidos from "./TabelaPedidos";
import {
  criarPedidoAdm,
  listarEtapas,
  listarPedidosAdm,
  rotuloDaEtapa,
} from "../lib/pedidosAdm";

const DISTANCIA_SIDEBAR = 115;
const ESPACO_TOPO = 30; // alinhado com a logo da sidebar
const LARGURA_CONTEUDO = 709;
const ESPACO_BLOCOS = 32;
const ALTURA_CAMPO = 49;
const LARGURA_BUSCA = 490;
const LARGURA_FILTRO = 203;
const ESPACO_BUSCA_FILTRO = LARGURA_CONTEUDO - LARGURA_BUSCA - LARGURA_FILTRO;

const FILTROS_VALIDOS = ["TODOS", "EM_ANDAMENTO", "FINALIZADO"];

const TEXTO_APOIO = {
  fontSize: { xs: 14, md: 15 },
  fontWeight: 300,
  color: "primary.dark",
};

export default function PainelAdm() {
  const [listaPedidos, setListaPedidos] = useState([]);
  const [totais, setTotais] = useState({
    todos: 0,
    emAndamento: 0,
    finalizados: 0,
  });
  const [etapas, setEtapas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [etapaId, setEtapaId] = useState("");
  const [busca, setBusca] = useState("");
  const [novoPedidoAberto, setNovoPedidoAberto] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [lista, listaEtapas] = await Promise.all([
        listarPedidosAdm(),
        listarEtapas(),
      ]);
      setListaPedidos(lista.itens);
      setTotais(lista.totais);
      setEtapas(listaEtapas);
      setErro("");
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();

    const filtroDaUrl = new URLSearchParams(window.location.search).get(
      "filtro",
    );
    if (FILTROS_VALIDOS.includes(filtroDaUrl)) setFiltro(filtroDaUrl);
  }, [carregar]);

  const pedidos = useMemo(() => {
    const termo = busca.trim().replace(/^#/, "").toLowerCase();

    return listaPedidos.filter((pedido) => {
      const combinaFiltro = filtro === "TODOS" || pedido.situacao === filtro;
      const combinaBusca =
        !termo || pedido.codigo.toLowerCase().includes(termo);
      const combinaEtapa =
        !etapaId || pedido.etapaAtual?.id === Number(etapaId);

      return combinaFiltro && combinaBusca && combinaEtapa;
    });
  }, [busca, etapaId, filtro, listaPedidos]);

  async function cadastrarPedido(dados) {
    await criarPedidoAdm(dados);
    await carregar();

    setFiltro("TODOS");
    setEtapaId("");
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
            <CartaoResumo valor={totais.todos} rotulo="Pedidos cadastrados" />
            <CartaoResumo valor={totais.emAndamento} rotulo="Em andamento" />
            <CartaoResumo valor={totais.finalizados} rotulo="Finalizados" />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: `${ESPACO_BUSCA_FILTRO}px`,
            }}
          >
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
                value={etapaId}
                onChange={(event) => setEtapaId(event.target.value)}
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
                {etapas.map((etapa) => (
                  <option key={etapa.id} value={etapa.id}>
                    {rotuloDaEtapa(etapa)}
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

          {erro && (
            <Typography
              role="alert"
              sx={{ ...TEXTO_APOIO, color: "error.main" }}
            >
              {erro}
            </Typography>
          )}

          {carregando ? (
            <Typography sx={TEXTO_APOIO}>Carregando pedidos...</Typography>
          ) : (
            !erro && <TabelaPedidos pedidos={pedidos} />
          )}
        </Box>
      </Box>

      <FormularioNovoPedido
        aberto={novoPedidoAberto}
        etapas={etapas}
        onFechar={() => setNovoPedidoAberto(false)}
        onCadastrar={cadastrarPedido}
      />
    </>
  );
}
