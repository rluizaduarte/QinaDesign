// Progresso das etapas no painel administrativo: etapa atual, data de cada
// etapa e comentário por etapa. O protótipo guarda tudo no navegador; quando a
// API expuser o histórico de etapas, basta trocar estas funções mantendo o
// mesmo formato dos objetos.

import { formatarDataHora } from "./pedidos";
import { ETAPAS_ADM } from "./pedidosAdm";

const CHAVE = "qina:etapas-adm";
const FUSO = "America/Sao_Paulo";

/** Etapas do fluxo de produção, na ordem usada no acompanhamento. */
export const ETAPAS = ETAPAS_ADM;

/** Índice (base 0) de uma etapa pelo nome; 0 quando não encontra. */
export function indiceDaEtapa(nome) {
  const indice = ETAPAS_ADM.indexOf(nome);
  return indice === -1 ? 0 : indice;
}

function lerHistorico() {
  if (typeof window === "undefined") return {};

  try {
    const salvo = JSON.parse(window.localStorage.getItem(CHAVE));
    return salvo && typeof salvo === "object" ? salvo : {};
  } catch {
    return {};
  }
}

function gravarHistorico(historico) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(historico));
  } catch {
    // Armazenamento indisponível (modo privado/quota): mantém só em memória.
  }
}

/**
 * Progresso de um pedido: índice da etapa atual, data de cada etapa e
 * comentários por etapa. Na primeira visita, as etapas anteriores ficam com a
 * data de criação do pedido e a etapa atual com a data de hoje.
 */
export function carregarProgressoAdm(codigo, { etapaIndice, criadoEm } = {}) {
  const salvo = lerHistorico()[codigo];

  if (salvo) {
    return {
      etapaIndice: Number(salvo.etapaIndice) || 0,
      datas: salvo.datas ?? {},
      comentarios: salvo.comentarios ?? {},
    };
  }

  const atual = Number(etapaIndice) || 0;
  const datas = {};

  for (let indice = 0; indice <= atual; indice += 1) {
    datas[indice] = indice === atual ? new Date().toISOString() : criadoEm ?? null;
  }

  return { etapaIndice: atual, datas, comentarios: {} };
}

/** Salva o progresso de um pedido. */
export function salvarProgressoAdm(codigo, progresso) {
  const historico = lerHistorico();
  historico[codigo] = progresso;
  gravarHistorico(historico);
}

/** Data de uma etapa já concluída, no formato "24 set, 22:11". */
export function formatarDataEtapa(valor) {
  return formatarDataHora(valor);
}

/** Data da etapa atual, no formato "Atualizado hoje, 12:00". */
export function formatarAtualizadoEtapa(valor) {
  const texto = formatarDataHora(valor);
  if (!texto) return null;

  const [, hora] = texto.split(", ");
  const diaMes = (data) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      timeZone: FUSO,
    })
      .format(data)
      .replace(".", "");

  return diaMes(new Date(valor)) === diaMes(new Date())
    ? `Atualizado hoje, ${hora}`
    : `Atualizado ${texto}`;
}
