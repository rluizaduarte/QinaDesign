import { API_URL } from "./api";

const FUSO = "America/Sao_Paulo";

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
