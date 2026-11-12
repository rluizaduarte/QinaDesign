import { chamar } from "./clienteApi";

export { formatarAtualizadoEm } from "./datas";

/** Etapas do fluxo, em ordem: [{ id, nome, ordem }]. */
export function listarEtapas() {
  return chamar("/etapas");
}

/** Lista completa de pedidos: { itens, total, totais }. */
export function listarPedidosAdm() {
  return chamar("/pedidos");
}

/** Cadastra um pedido: { nomeCliente, etapaInicialId?, dataInicio, observacao? }. */
export function criarPedidoAdm(dados) {
  return chamar("/pedidos", { method: "POST", body: dados });
}

/** Pedido completo pelo código, com id e a lista de etapas com status. */
export function buscarPedidoAdm(codigo) {
  return chamar(`/pedidos/codigo/${encodeURIComponent(codigo)}`);
}

/** Atualiza dados do pedido: { nomeCliente?, observacao?, dataInicio? }. */
export function atualizarPedidoAdm(id, dados) {
  return chamar(`/pedidos/${id}`, { method: "PATCH", body: dados });
}

/** Avança ou retrocede uma etapa (a API só aceita ±1). */
export function mudarEtapaPedido(id, novaEtapaId) {
  return chamar(`/pedidos/${id}/etapa`, {
    method: "PATCH",
    body: { novaEtapaId },
  });
}

/** Grava o comentário da etapa atual. */
export function comentarEtapaPedido(id, observacao) {
  return chamar(`/pedidos/${id}/observacao`, {
    method: "PATCH",
    body: { observacao },
  });
}

/** Rótulo "n. nome" de uma etapa (os nomes se repetem; o número distingue). */
export function rotuloDaEtapa(etapa) {
  return etapa ? `${etapa.ordem}. ${etapa.nome}` : "";
}
