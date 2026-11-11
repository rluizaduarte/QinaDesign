"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { ChevronDown } from "lucide-react";
import EtapaAtual from "./EtapaAtual";
import EtapaConcluida from "./EtapaConcluida";
import EtapaPendente from "./EtapaPendente";
import FormularioNovoPedido from "./FormularioNovoPedido";
import Label from "./Label";
import SidebarAdm from "./SidebarAdm";
import {
  ETAPAS_ADM,
  atualizarPedidoAdm,
  buscarPedidoAdm,
  criarPedidoAdm,
} from "../lib/pedidosAdm";
import { formatarCriadoEm } from "../lib/pedidos";

const CAMPO = {
  width: "100%",
  height: 50,
  px: 2,
  border: 0,
  borderRadius: "2px",
  bgcolor: "common.white",
  color: "text.primary",
  fontFamily: "inherit",
  fontSize: "1rem",
  fontWeight: 300,
  "&:focus": {
    outline: "2px solid",
    outlineColor: "primary.light",
    outlineOffset: 1,
  },
};

const ROTULO = {
  display: "block",
  mb: 1,
  fontSize: "1rem",
  fontWeight: 300,
  color: "primary.dark",
};

const BOTAO = {
  height: 48,
  px: 3.5,
  borderRadius: "4px",
  fontSize: "0.95rem",
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  "&:hover": { boxShadow: "none" },
};

const TITULO_SECAO = {
  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: "-0.02em",
  color: "text.primary",
  mb: 3,
};

// Página de edição de um pedido, aberta pelo botão "Editar" da listagem.
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
    <Box
      sx={{
        minHeight: "100vh",
        // pt reserva espaço para o Header, que fica por cima da página
        pt: 10,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
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
          px: { xs: 3, md: 6, lg: 8 },
          py: { xs: 4, md: 5 },
        }}
      >
        {!carregado && (
          <Typography
            sx={{
              fontSize: { xs: 14, md: 15 },
              fontWeight: 300,
              color: "primary.dark",
            }}
          >
            Carregando pedido...
          </Typography>
        )}

        {carregado && !pedido && (
          <Box sx={{ maxWidth: 720 }}>
            <Label>pedido</Label>

            <Typography
              component="h1"
              sx={{
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "text.primary",
              }}
            >
              #{codigo}
            </Typography>

            <Typography
              sx={{
                mt: 2,
                mb: 3,
                fontSize: { xs: 14, md: 15 },
                fontWeight: 300,
                color: "primary.dark",
              }}
            >
              Não encontramos nenhum pedido com esse código.
            </Typography>

            <Button
              component={Link}
              href="/dashboard"
              variant="contained"
              disableElevation
              sx={{
                ...BOTAO,
                bgcolor: "primary.main",
                color: "secondary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Voltar para a lista
            </Button>
          </Box>
        )}

        {pedido && (
          <>
            <Typography
              component="h1"
              sx={{
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "text.primary",
              }}
            >
              #{pedido.codigo}
            </Typography>

            {criadoEm && (
              <Typography
                component="p"
                sx={{
                  mt: 1.5,
                  mb: { xs: 5, md: 7 },
                  fontSize: "clamp(1.5rem, 3.4vw, 2.6rem)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  lineHeight: 1.15,
                  color: "primary.dark",
                }}
              >
                {criadoEm}
              </Typography>
            )}

            <Box sx={{ maxWidth: 660 }}>
              <Label>alteração do pedido</Label>

              {secao === "dados" ? (
                <FormularioEdicao
                  key={pedido.codigo}
                  pedido={pedido}
                  onSalvar={salvarPedido}
                  onCancelar={irParaLista}
                />
              ) : (
                <SecaoEtapas pedido={pedido} />
              )}
            </Box>
          </>
        )}
      </Box>

      <FormularioNovoPedido
        aberto={novoPedidoAberto}
        onFechar={() => setNovoPedidoAberto(false)}
        onCadastrar={cadastrarPedido}
      />
    </Box>
  );
}

function FormularioEdicao({ pedido, onSalvar, onCancelar }) {
  const [nomeCliente, setNomeCliente] = useState(pedido.nomeCliente);
  const [etapaAtual, setEtapaAtual] = useState(pedido.etapaAtual);
  const [observacao, setObservacao] = useState(pedido.observacao ?? "");
  const [erro, setErro] = useState("");

  const etapas = ETAPAS_ADM.includes(pedido.etapaAtual)
    ? ETAPAS_ADM
    : [...ETAPAS_ADM, pedido.etapaAtual];

  function enviar(event) {
    event.preventDefault();

    const nome = nomeCliente.trim();
    if (!nome) {
      setErro("Informe o nome do cliente.");
      return;
    }

    onSalvar({
      nomeCliente: nome,
      etapaAtual,
      observacao: observacao.trim() || null,
      situacao: etapaAtual === "Finalização" ? "FINALIZADO" : "EM_ANDAMENTO",
    });
  }

  return (
    <>
      <Typography component="h2" sx={TITULO_SECAO}>
        Dados do pedido
      </Typography>

      <Box component="form" onSubmit={enviar}>
        <Box sx={{ mb: 2.5 }}>
          <Box component="label" htmlFor="editar-nome" sx={ROTULO}>
            Nome do cliente
          </Box>
          <Box
            component="input"
            id="editar-nome"
            type="text"
            value={nomeCliente}
            onChange={(event) => {
              setNomeCliente(event.target.value);
              if (erro) setErro("");
            }}
            required
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? "erro-editar-nome" : undefined}
            sx={{ ...CAMPO, borderColor: erro ? "error.main" : "transparent" }}
          />
          {erro && (
            <Typography
              id="erro-editar-nome"
              role="alert"
              sx={{ mt: 0.75, fontSize: "0.85rem", color: "error.main" }}
            >
              {erro}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 2.5, position: "relative" }}>
          <Box component="label" htmlFor="editar-etapa" sx={ROTULO}>
            Etapa atual
          </Box>
          <Box
            component="select"
            id="editar-etapa"
            value={etapaAtual}
            onChange={(event) => setEtapaAtual(event.target.value)}
            sx={{
              ...CAMPO,
              pr: 6,
              appearance: "none",
              cursor: "pointer",
            }}
          >
            {etapas.map((nome, indice) => (
              <option key={nome} value={nome}>
                {indice + 1}. {nome}
              </option>
            ))}
          </Box>
          <Box
            component="span"
            sx={{
              position: "absolute",
              right: 16,
              bottom: 15,
              display: "flex",
              pointerEvents: "none",
              color: "primary.dark",
            }}
          >
            <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
          </Box>
        </Box>

        <Box>
          <Box component="label" htmlFor="editar-observacao" sx={ROTULO}>
            Observação (opcional)
          </Box>
          <Box
            component="textarea"
            id="editar-observacao"
            value={observacao}
            onChange={(event) => setObservacao(event.target.value)}
            rows={4}
            sx={{
              ...CAMPO,
              height: "auto",
              minHeight: 110,
              py: 1.5,
              resize: "vertical",
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: 1.5,
            mt: 4,
          }}
        >
          <Button
            type="button"
            onClick={onCancelar}
            sx={{
              ...BOTAO,
              bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
              color: "primary.dark",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.12),
              },
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              ...BOTAO,
              bgcolor: "primary.main",
              color: "secondary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Salvar alterações
          </Button>
        </Box>
      </Box>
    </>
  );
}

function SecaoEtapas({ pedido }) {
  const indiceAtual = ETAPAS_ADM.indexOf(pedido.etapaAtual);

  return (
    <>
      <Typography component="h2" sx={TITULO_SECAO}>
        Etapas
      </Typography>

      <Box>
        {ETAPAS_ADM.map((nome, indice) => {
          const ultima = indice === ETAPAS_ADM.length - 1;

          if (indice < indiceAtual) {
            return <EtapaConcluida key={nome} nome={nome} ultima={ultima} />;
          }

          if (indice === indiceAtual) {
            return <EtapaAtual key={nome} nome={nome} ultima={ultima} />;
          }

          return <EtapaPendente key={nome} nome={nome} ultima={ultima} />;
        })}
      </Box>
    </>
  );
}
