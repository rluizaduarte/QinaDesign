const FUSO = "America/Sao_Paulo";

const diaMes = (data) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: FUSO,
  })
    .format(data)
    .replace(".", "");

/** Formata uma data como "27 set, 15:00". */
export function formatarDataHora(valor) {
  if (!valor) return null;

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;

  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: FUSO,
  }).format(data);

  return `${diaMes(data)}, ${hora}`;
}

/** Formata a data de criação como "Feito em 25 set, às 22:11.". */
export function formatarCriadoEm(valor) {
  const texto = formatarDataHora(valor);
  return texto ? `Feito em ${texto.replace(", ", ", às ")}.` : null;
}

/** "Hoje, 12:00" para datas de hoje; caso contrário "24 set, 15:00". */
export function formatarAtualizadoEm(valor) {
  const texto = formatarDataHora(valor);
  if (!texto) return null;

  const [dia, hora] = texto.split(", ");
  return dia === diaMes(new Date()) ? `Hoje, ${hora}` : texto;
}

/** Data de uma etapa já concluída, no formato "24 set, 22:11". */
export function formatarDataEtapa(valor) {
  return formatarDataHora(valor);
}

/** Data da etapa atual, no formato "Atualizado hoje, 12:00". */
export function formatarAtualizadoEtapa(valor) {
  const texto = formatarAtualizadoEm(valor);
  if (!texto) return null;
  return texto.startsWith("Hoje")
    ? `Atualizado hoje, ${texto.slice(6)}`
    : `Atualizado ${texto}`;
}
