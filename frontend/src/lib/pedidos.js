// Acesso à API NestJS e formatação das datas exibidas na linha do tempo.
// A URL é lida no servidor (API_URL) e não é exposta ao navegador.
const API_URL = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001"
).replace(/\/+$/, "");

const FUSO = "America/Sao_Paulo";

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

/** Formata uma data como "27 set, 15:00". */
export function formatarDataHora(valor) {
  if (!valor) return null;

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;

  const dia = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    timeZone: FUSO,
  }).format(data);

  const mes = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    timeZone: FUSO,
  })
    .format(data)
    .replace(".", "");

  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: FUSO,
  }).format(data);

  return `${dia} ${mes}, ${hora}`;
}

/** Formata a data de criação como "Feito em 25 set, às 22:11.". */
export function formatarCriadoEm(valor) {
  const texto = formatarDataHora(valor);
  return texto ? `Feito em ${texto.replace(", ", ", às ")}.` : null;
}
