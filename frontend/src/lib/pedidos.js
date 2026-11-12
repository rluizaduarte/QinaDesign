import { API_URL } from "./api";

export { formatarDataHora, formatarCriadoEm } from "./datas";

/**
 * Busca um pedido pelo código.
 * Retorna { pedido } em caso de sucesso ou { erro } com um dos valores:
 * "naoEncontrado" | "servico" | "conexao".
 */
export async function buscarPedido(codigo) {
  const url = `${API_URL}/pedidos/${encodeURIComponent(codigo)}`;

  try {
    const resposta = await fetch(url, { cache: "no-store" });

    if (resposta.status === 404) return { erro: "naoEncontrado" };
    if (!resposta.ok) return { erro: "servico" };

    return { pedido: await resposta.json() };
  } catch {
    return { erro: "conexao" };
  }
}
