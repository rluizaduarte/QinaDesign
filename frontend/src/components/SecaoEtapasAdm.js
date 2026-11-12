"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
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
import { atualizarPedidoAdm } from "../lib/pedidosAdm";
import {
  ETAPAS,
  carregarProgressoAdm,
  formatarAtualizadoEtapa,
  formatarDataEtapa,
  indiceDaEtapa,
  salvarProgressoAdm,
} from "../lib/etapasAdm";

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

function textoDaData(situacao, valor) {
  if (situacao === "PENDENTE") return null;
  return situacao === "ATUAL"
    ? formatarAtualizadoEtapa(valor)
    : formatarDataEtapa(valor);
}

export default function SecaoEtapasAdm({ pedido, onAtualizar }) {
  const [progresso, setProgresso] = useState(null);
  const [podeVoltar, setPodeVoltar] = useState(true);
  const [comentando, setComentando] = useState(false);
  const trilhaRef = useRef(null);
  const etapaAtualRef = useRef(null);

  useEffect(() => {
    setProgresso(
      carregarProgressoAdm(pedido.codigo, {
        etapaIndice: indiceDaEtapa(pedido.etapaAtual),
        criadoEm: pedido.criadoEm,
      }),
    );
  }, [pedido.codigo]); // eslint-disable-line react-hooks/exhaustive-deps

  const indiceAtual = progresso?.etapaIndice ?? 0;

  // Mantém a etapa atual centralizada na trilha
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

  if (!progresso) return null;

  const ultimoIndice = ETAPAS.length - 1;
  const comentarioAtual = progresso.comentarios[indiceAtual] ?? "";

  function salvar(novoProgresso) {
    setProgresso(novoProgresso);
    salvarProgressoAdm(pedido.codigo, novoProgresso);
  }

  function mudarEtapa(novoIndice) {
    salvar({
      ...progresso,
      etapaIndice: novoIndice,
      datas: { ...progresso.datas, [novoIndice]: new Date().toISOString() },
    });

    const lista = atualizarPedidoAdm(pedido.codigo, {
      etapaAtual: ETAPAS[novoIndice],
      situacao: novoIndice === ultimoIndice ? "FINALIZADO" : "EM_ANDAMENTO",
    });
    onAtualizar?.(
      lista.find((item) => item.codigo === pedido.codigo) ?? pedido,
    );

    setComentando(false);
  }

  function avancar() {
    if (indiceAtual >= ultimoIndice) return;
    mudarEtapa(indiceAtual + 1);
    setPodeVoltar(true);
  }

  function voltar() {
    if (!podeVoltar || indiceAtual === 0) return;
    mudarEtapa(indiceAtual - 1);
    setPodeVoltar(false);
  }

  function comentar(texto) {
    salvar({
      ...progresso,
      comentarios: { ...progresso.comentarios, [indiceAtual]: texto },
    });
    setComentando(false);
  }

  return (
    <>
      <Label>atualize a etapa atual</Label>
      <SectionTitle component="h2" sx={{ mb: `${ESPACO_BLOCOS}px` }}>
        Etapas
      </SectionTitle>

      <Box sx={{ width: "100%", maxWidth: LARGURA_CONTEUDO }}>
        {comentando ? (
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <Box sx={{ ...LINHA, width: LINHA_ANTES }} />
            <CirculoEtapa numero={indiceAtual + 1} situacao="ATUAL" />
            <Box sx={{ ...LINHA, width: LINHA_DEPOIS }} />
            <ComentarioEtapa
              valorInicial={comentarioAtual}
              onSalvar={comentar}
              onCancelar={() => setComentando(false)}
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
                    acao={
                      situacao === "ATUAL"
                        ? {
                            rotulo: comentarioAtual
                              ? "Editar comentário"
                              : "Comentar",
                            onClick: () => setComentando(true),
                          }
                        : undefined
                    }
                    refAtual={situacao === "ATUAL" ? etapaAtualRef : undefined}
                  />
                );
              })}
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
                onClick={voltar}
                disabled={!podeVoltar || indiceAtual === 0}
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
                onClick={avancar}
                disabled={indiceAtual >= ultimoIndice}
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
      </Box>
    </>
  );
}
