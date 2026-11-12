"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BotaoAcao from "./BotaoAcao";
import ComentarioEtapa from "./ComentarioEtapa";
import EtapaCirculoAdm, {
  CirculoEtapa,
  TAMANHO_CIRCULO,
} from "./EtapaCirculoAdm";
import Label from "./Label";
import SectionTitle from "./SectionTitle";
import { BOTAO_NEUTRO } from "./EstilosCampo";
import {
  buscarPedidoAdm,
  comentarEtapaPedido,
  mudarEtapaPedido,
} from "../lib/pedidosAdm";
import { formatarAtualizadoEtapa, formatarDataEtapa } from "../lib/datas";

const LARGURA_CONTEUDO = 645;
const ESPACO_BLOCOS = 32;
const LINHA_ANTES = 55; // linha que chega ao círculo no modo de comentário
const LINHA_DEPOIS = 65; // linha entre o círculo e a caixa de comentário

const LINHA = {
  flexShrink: 0,
  mt: `${TAMANHO_CIRCULO.atual / 2}px`,
  borderTop: "1px solid",
  borderColor: (theme) => alpha(theme.palette.text.primary, 0.2),
};

function textoDaData(etapa) {
  if (etapa.status === "PENDENTE") return null;
  return etapa.status === "ATUAL"
    ? formatarAtualizadoEtapa(etapa.dataHora)
    : formatarDataEtapa(etapa.dataHora);
}

export default function SecaoEtapasAdm({ pedido, onAtualizar }) {
  const [comentando, setComentando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const trilhaRef = useRef(null);
  const etapaAtualRef = useRef(null);

  const etapas = pedido.etapas ?? [];
  const indiceAtual = etapas.findIndex((etapa) => etapa.status === "ATUAL");
  const ultimoIndice = etapas.length - 1;
  const etapaAtual = indiceAtual === -1 ? null : etapas[indiceAtual];
  const comentarioAtual = etapaAtual?.observacao ?? "";

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
  }, [indiceAtual, comentando]);

  async function recarregar() {
    onAtualizar?.(await buscarPedidoAdm(pedido.codigo));
  }

  async function mudarEtapa(novoIndice) {
    if (ocupado || novoIndice < 0 || novoIndice > ultimoIndice) return;

    setOcupado(true);
    setErro("");
    try {
      await mudarEtapaPedido(pedido.id, etapas[novoIndice].id);
      await recarregar();
      setComentando(false);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setOcupado(false);
    }
  }

  async function comentar(texto) {
    if (!texto) {
      setErro("Escreva um comentário antes de salvar.");
      return;
    }

    setOcupado(true);
    setErro("");
    try {
      await comentarEtapaPedido(pedido.id, texto);
      await recarregar();
      setComentando(false);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <Label>atualize a etapa atual</Label>
      <SectionTitle component="h2" sx={{ mb: `${ESPACO_BLOCOS}px` }}>
        Etapas
      </SectionTitle>

      <Box sx={{ width: "100%", maxWidth: LARGURA_CONTEUDO }}>
        {comentando && etapaAtual ? (
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <Box sx={{ ...LINHA, width: LINHA_ANTES }} />
            <CirculoEtapa numero={etapaAtual.ordem} situacao="ATUAL" />
            <Box sx={{ ...LINHA, width: LINHA_DEPOIS }} />
            <ComentarioEtapa
              valorInicial={comentarioAtual}
              onSalvar={comentar}
              onCancelar={() => {
                setErro("");
                setComentando(false);
              }}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        ) : (
          <>
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
              {etapas.map((etapa) => (
                <EtapaCirculoAdm
                  key={etapa.id}
                  numero={etapa.ordem}
                  nome={etapa.nome}
                  situacao={etapa.status}
                  data={textoDaData(etapa)}
                  acao={
                    etapa.status === "ATUAL"
                      ? {
                          rotulo: comentarioAtual
                            ? "Editar comentário"
                            : "Comentar",
                          onClick: () => setComentando(true),
                        }
                      : undefined
                  }
                  refAtual={
                    etapa.status === "ATUAL" ? etapaAtualRef : undefined
                  }
                />
              ))}
            </Box>

            <Box
              sx={{
                mt: `${ESPACO_BLOCOS}px`,
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <BotaoAcao
                type="button"
                onClick={() => mudarEtapa(indiceAtual - 1)}
                disabled={ocupado || indiceAtual <= 0}
                startIcon={
                  <ChevronLeft
                    size={16}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                }
                sx={BOTAO_NEUTRO}
              >
                Voltar
              </BotaoAcao>

              <BotaoAcao
                type="button"
                onClick={() => mudarEtapa(indiceAtual + 1)}
                disabled={
                  ocupado || indiceAtual === -1 || indiceAtual >= ultimoIndice
                }
                endIcon={
                  <ChevronRight
                    size={16}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                }
              >
                Avançar
              </BotaoAcao>
            </Box>
          </>
        )}

        {erro && (
          <Typography
            role="alert"
            sx={{ mt: 2, fontSize: 13, color: "error.main" }}
          >
            {erro}
          </Typography>
        )}
      </Box>
    </>
  );
}
