"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { ArrowLeft, SquarePen } from "lucide-react";
import BotaoAcao from "./BotaoAcao";
import FormularioNovoPedido from "./FormularioNovoPedido";
import Label from "./Label";
import SecaoEtapasAdm from "./SecaoEtapasAdm";
import SectionTitle from "./SectionTitle";
import SidebarAdm from "./SidebarAdm";
import {
  atualizarPedidoAdm,
  buscarPedidoAdm,
  criarPedidoAdm,
} from "../lib/pedidosAdm";
import { formatarCriadoEm } from "../lib/pedidos";
import { CAMPO, TEXTAREA, TITULO_CAMPO } from "./EstilosCampo";

const DISTANCIA_SIDEBAR = 115;
const ESPACO_TOPO = 30;
const ESPACO_BLOCOS = 32;

const TEXTO_APOIO = {
  fontSize: { xs: 14, md: 15 },
  fontWeight: 300,
  color: "primary.dark",
};

export default function EditarPedido({ codigo }) {
  const router = useRouter();
  const [pedido, setPedido] = useState(null);
  const [carregado, setCarregado] = useState(false);
  const [secao, setSecao] = useState("dados");
  const [novoPedidoAberto, setNovoPedidoAberto] = useState(false);

  useEffect(() => {
    setPedido(buscarPedidoAdm(codigo));
    setCarregado(true);
  }, [codigo]);

  function irParaLista() {
    router.push("/dashboard");
  }

  function irParaFiltro(valor) {
    router.push(
      valor === "TODOS" ? "/dashboard" : `/dashboard?filtro=${valor}`,
    );
  }

  function salvarPedido(dados) {
    atualizarPedidoAdm(codigo, dados);
    irParaLista();
  }

  function cadastrarPedido(dados) {
    criarPedidoAdm(dados);
    setNovoPedidoAberto(false);
    irParaLista();
  }

  const criadoEm = formatarCriadoEm(pedido?.criadoEm);

  return (
    <>
      <SidebarAdm
        filtro={null}
        onFiltro={irParaFiltro}
        onNovoPedido={() => setNovoPedidoAberto(true)}
        secao={secao}
        onSecao={setSecao}
        mostrarEdicao={Boolean(pedido)}
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
        {/* Seta + label alinhadas ao topo (mesma altura da logo da sidebar);
            o conjunto é o link de volta à dashboard. */}
        <Box
          component={Link}
          href="/dashboard"
          sx={{
            display: "flex",
            width: "fit-content",
            alignItems: "center",
            gap: "8px",
            mb: 2,
            textDecoration: "none",
            color: "primary.light",
            "&:hover": { color: "primary.dark" },
          }}
        >
          <ArrowLeft size={8} strokeWidth={2.5} aria-hidden="true" />
          <Label sx={{ mb: 0, color: "inherit" }}>
            dashboard administrativo
          </Label>
        </Box>

        {!carregado && (
          <Typography sx={TEXTO_APOIO}>Carregando pedido...</Typography>
        )}

        {carregado && !pedido && (
          <Box sx={{ maxWidth: 720 }}>
            <SectionTitle component="h1" sx={{ mb: 2 }}>
              #{codigo}
            </SectionTitle>
            <Typography sx={{ ...TEXTO_APOIO, mb: 3 }}>
              Não encontramos nenhum pedido com esse código.
            </Typography>
            <BotaoAcao component={Link} href="/dashboard">
              Voltar para a lista
            </BotaoAcao>
          </Box>
        )}

        {pedido && (
          <>
            <SectionTitle
              component="h1"
              italic={criadoEm}
              sx={{
                mb: `${ESPACO_BLOCOS}px`,
                "& em": { fontSize: { xs: "1.1rem", md: "1.5rem" } },
              }}
            >
              #{pedido.codigo}
            </SectionTitle>

            {secao === "dados" && (
              <SecaoDados
                key={pedido.codigo}
                pedido={pedido}
                onSalvar={salvarPedido}
                onEditarEtapa={() => setSecao("etapas")}
              />
            )}

            {secao === "etapas" && (
              <SecaoEtapasAdm pedido={pedido} onAtualizar={setPedido} />
            )}

            {(secao === "financeiro" || secao === "documentos") && (
              <SecaoEmConstrucao
                titulo={secao === "financeiro" ? "Financeiro" : "Documentos"}
              />
            )}
          </>
        )}
      </Box>

      <FormularioNovoPedido
        aberto={novoPedidoAberto}
        onFechar={() => setNovoPedidoAberto(false)}
        onCadastrar={cadastrarPedido}
      />
    </>
  );
}

function SecaoDados({ pedido, onSalvar, onEditarEtapa }) {
  const [nomeCliente, setNomeCliente] = useState(pedido.nomeCliente);
  const [observacao, setObservacao] = useState(pedido.observacao ?? "");
  const [erro, setErro] = useState("");

  function enviar(event) {
    event.preventDefault();

    const nome = nomeCliente.trim();
    if (!nome) {
      setErro("Informe o nome do cliente.");
      return;
    }

    onSalvar({ nomeCliente: nome, observacao: observacao.trim() || null });
  }

  return (
    <Box component="form" onSubmit={enviar} noValidate>
      <Label>alteração do pedido</Label>
      <SectionTitle component="h2" sx={{ mb: `${ESPACO_BLOCOS}px` }}>
        Dados do pedido
      </SectionTitle>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: `${ESPACO_BLOCOS}px`,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Box component="label" htmlFor="editar-nome" sx={TITULO_CAMPO}>
            Nome do cliente
          </Box>
          <Box
            component="input"
            id="editar-nome"
            type="text"
            value={nomeCliente}
            maxLength={80}
            onChange={(event) => {
              setNomeCliente(event.target.value);
              if (erro) setErro("");
            }}
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? "erro-editar-nome" : undefined}
            sx={{ ...CAMPO, ...(erro && { borderColor: "error.main" }) }}
          />
          {erro && (
            <Typography
              id="erro-editar-nome"
              role="alert"
              sx={{ mt: 1, fontSize: 13, color: "error.main" }}
            >
              {erro}
            </Typography>
          )}
        </Box>

        <Box sx={{ width: "100%" }}>
          <Typography component="p" id="editar-etapa-titulo" sx={TITULO_CAMPO}>
            Etapa atual
          </Typography>
          {/* Mesma caixa dos campos, mas somente leitura: o texto da etapa
              à esquerda e o ícone de edição à direita, ambos dentro dela. */}
          <Box
            sx={{
              ...CAMPO,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              pr: "16px",
            }}
          >
            <Typography
              aria-labelledby="editar-etapa-titulo"
              sx={{
                minWidth: 0,
                fontSize: 14,
                fontWeight: 500,
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pedido.etapaAtual}
            </Typography>

            <ButtonBase
              type="button"
              onClick={onEditarEtapa}
              aria-label="Alterar a etapa atual"
              sx={{
                flexShrink: 0,
                borderRadius: "4px",
                color: "text.primary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <SquarePen size={20} strokeWidth={1.5} aria-hidden="true" />
            </ButtonBase>
          </Box>
        </Box>

        <Box sx={{ width: "100%" }}>
          <Box component="label" htmlFor="editar-observacao" sx={TITULO_CAMPO}>
            Observação (opcional)
          </Box>
          <Box
            component="textarea"
            id="editar-observacao"
            value={observacao}
            onChange={(event) => setObservacao(event.target.value)}
            sx={TEXTAREA}
          />
        </Box>

        <BotaoAcao type="submit">Salvar alterações</BotaoAcao>
      </Box>
    </Box>
  );
}

function SecaoEmConstrucao({ titulo }) {
  return (
    <>
      <Label>alteração do pedido</Label>
      <SectionTitle component="h2" sx={{ mb: 2 }}>
        {titulo}
      </SectionTitle>
      <Typography sx={TEXTO_APOIO}>Seção em construção.</Typography>
    </>
  );
}
