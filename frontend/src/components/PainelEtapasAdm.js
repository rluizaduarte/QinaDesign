"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ComentarioEtapa from "./ComentarioEtapa";
import EtapaCirculoAdm from "./EtapaCirculoAdm";
import FormularioNovoPedido from "./FormularioNovoPedido";
import Label from "./Label";
import SidebarEtapasAdm from "./SidebarEtapasAdm";
import { carregarPedidosAdm, criarPedidoAdm } from "../lib/pedidosAdm";
import { formatarCriadoEm } from "../lib/pedidos";
import {
  ETAPAS,
  carregarProgressoAdm,
  formatarAtualizadoEtapa,
  formatarDataEtapa,
  indiceDaEtapa,
  salvarProgressoAdm,
} from "../lib/etapasAdm";

const TITULO_CODIGO = {
  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: "-0.03em",
  color: "text.primary",
};

const SUBTITULO = {
  mt: 1.5,
  fontSize: "clamp(1.5rem, 3.4vw, 2.6rem)",
  fontWeight: 300,
  fontStyle: "italic",
  lineHeight: 1.15,
  color: "primary.dark",
};

const TITULO_SECAO = {
  fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: "-0.02em",
  color: "text.primary",
  mb: { xs: 4, md: 6 },
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

// Texto abaixo de cada círculo: data da etapa concluída ou "Atualizado hoje".
function textoDaData(situacao, valor) {
  if (situacao === "PENDENTE") return null;
  return situacao === "ATUAL"
    ? formatarAtualizadoEtapa(valor)
    : formatarDataEtapa(valor);
}

// Tela de acompanhamento das etapas: o administrador avança a etapa atual,
// volta uma única vez quando erra e comenta a etapa em andamento.
export default function PainelEtapasAdm() {
  const [pedido, setPedido] = useState(null);
  const [progresso, setProgresso] = useState(null);
  const [carregado, setCarregado] = useState(false);
  const [podeVoltar, setPodeVoltar] = useState(true);
  const [comentarioAberto, setComentarioAberto] = useState(false);
  const [novoPedidoAberto, setNovoPedidoAberto] = useState(false);
  const trilhaRef = useRef(null);
  const etapaAtualRef = useRef(null);

  useEffect(() => {
    const codigo = new URLSearchParams(window.location.search).get("codigo");
    const pedidos = carregarPedidosAdm();
    const encontrado =
      pedidos.find((item) => item.codigo === codigo) ?? pedidos[0] ?? null;

    setPedido(encontrado);

    if (encontrado) {
      setProgresso(
        carregarProgressoAdm(encontrado.codigo, {
          etapaIndice: indiceDaEtapa(encontrado.etapaAtual),
          criadoEm: encontrado.criadoEm,
        })
      );
    }

    setCarregado(true);
  }, []);

  const indiceAtual = progresso?.etapaIndice ?? 0;

  // Mantém a etapa atual no centro da trilha, como no protótipo.
  useEffect(() => {
    const trilha = trilhaRef.current;
    const etapa = etapaAtualRef.current;
    if (!trilha || !etapa) return;

    const caixa = trilha.getBoundingClientRect();
    const alvo = etapa.getBoundingClientRect();

    trilha.scrollTo({
      left:
        trilha.scrollLeft +
        (alvo.left - caixa.left) -
        (caixa.width - alvo.width) / 2,
      behavior: "smooth",
    });
  }, [indiceAtual]);

  function salvar(novoProgresso) {
    setProgresso(novoProgresso);
    if (pedido) salvarProgressoAdm(pedido.codigo, novoProgresso);
  }

  function avancar() {
    if (!progresso || indiceAtual >= ETAPAS.length - 1) return;

    salvar({
      ...progresso,
      etapaIndice: indiceAtual + 1,
      datas: { ...progresso.datas, [indiceAtual + 1]: new Date().toISOString() },
    });

    setPodeVoltar(true);
    setComentarioAberto(false);
  }

  function voltar() {
    if (!progresso || !podeVoltar || indiceAtual === 0) return;

    salvar({
      ...progresso,
      etapaIndice: indiceAtual - 1,
      datas: { ...progresso.datas, [indiceAtual - 1]: new Date().toISOString() },
    });

    // O administrador só pode voltar uma etapa por vez.
    setPodeVoltar(false);
    setComentarioAberto(false);
  }

  function comentar(texto) {
    salvar({
      ...progresso,
      comentarios: { ...progresso.comentarios, [indiceAtual]: texto },
    });

    setComentarioAberto(false);
  }

  function cadastrarPedido(dados) {
    const novo = criarPedidoAdm(dados)[0];

    setNovoPedidoAberto(false);
    setPedido(novo);
    setProgresso(
      carregarProgressoAdm(novo.codigo, {
        etapaIndice: indiceDaEtapa(novo.etapaAtual),
        criadoEm: novo.criadoEm,
      })
    );
    setPodeVoltar(true);
    setComentarioAberto(false);
  }

  const criadoEm = formatarCriadoEm(pedido?.criadoEm);

  return (
    <Box
      sx={{
        position: "relative",
        // Fica acima do Header global: nesta tela a logo vive na barra lateral.
        zIndex: 1,
        minHeight: "100dvh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <SidebarEtapasAdm
        codigo={pedido?.codigo}
        onNovoPedido={() => setNovoPedidoAberto(true)}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          bgcolor: "background.default",
          px: { xs: 3, md: 12 },
          py: { xs: 4, md: 6 },
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
            <Label>etapas do pedido</Label>

            <Typography component="h1" sx={TITULO_CODIGO}>
              #—
            </Typography>

            <Typography
              sx={{
                mt: 2,
                fontSize: { xs: 14, md: 15 },
                fontWeight: 300,
                color: "primary.dark",
              }}
            >
              Nenhum pedido cadastrado para acompanhar as etapas.
            </Typography>
          </Box>
        )}

        {pedido && progresso && (
          <>
            <Typography component="h1" sx={TITULO_CODIGO}>
              #{pedido.codigo}
            </Typography>

            {criadoEm && (
              <Typography component="p" sx={SUBTITULO}>
                {criadoEm}
              </Typography>
            )}

            <Box sx={{ mt: { xs: 5, md: 7 } }}>
              <Label>atualize a etapa atual</Label>

              <Typography component="h2" sx={TITULO_SECAO}>
                Etapas
              </Typography>

              <Box
                ref={trilhaRef}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  overflowX: "auto",
                  overscrollBehaviorX: "contain",
                  pb: 1,
                }}
              >
                {ETAPAS.map((nome, indice) => {
                  const situacao =
                    indice < indiceAtual
                      ? "CONCLUIDA"
                      : indice === indiceAtual
                        ? "ATUAL"
                        : "PENDENTE";

                  return (
                    <EtapaCirculoAdm
                      key={nome}
                      numero={indice + 1}
                      nome={nome}
                      situacao={situacao}
                      data={textoDaData(situacao, progresso.datas[indice])}
                      comentario={progresso.comentarios[indice]}
                      onComentar={
                        situacao === "ATUAL"
                          ? () => setComentarioAberto((aberto) => !aberto)
                          : undefined
                      }
                      refAtual={
                        situacao === "ATUAL" ? etapaAtualRef : undefined
                      }
                    />
                  );
                })}
              </Box>

              {/* Fora do trilho horizontal: a barra não é recortada pela
                  rolagem das etapas. */}
              {comentarioAberto && (
                <ComentarioEtapa
                  valorInicial={progresso.comentarios[indiceAtual] ?? ""}
                  onSalvar={comentar}
                  onCancelar={() => setComentarioAberto(false)}
                />
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  mt: { xs: 6, md: 10 },
                }}
              >
                <Button
                  type="button"
                  onClick={voltar}
                  disabled={!podeVoltar || indiceAtual === 0}
                  startIcon={
                    <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
                  }
                  sx={{
                    ...BOTAO,
                    bgcolor: (theme) =>
                      alpha(theme.palette.text.primary, 0.06),
                    color: "primary.dark",
                    "&:hover": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.text.primary, 0.12),
                    },
                    "&.Mui-disabled": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.text.primary, 0.03),
                      color: (theme) =>
                        alpha(theme.palette.primary.dark, 0.35),
                    },
                  }}
                >
                  Voltar
                </Button>

                <Button
                  type="button"
                  onClick={avancar}
                  disabled={indiceAtual >= ETAPAS.length - 1}
                  variant="contained"
                  disableElevation
                  endIcon={
                    <ChevronRight
                      size={20}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  }
                  sx={{
                    ...BOTAO,
                    bgcolor: "primary.main",
                    color: "secondary.main",
                    "&:hover": { bgcolor: "primary.dark" },
                    "&.Mui-disabled": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.4),
                      color: "secondary.main",
                    },
                  }}
                >
                  Avançar
                </Button>
              </Box>
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
