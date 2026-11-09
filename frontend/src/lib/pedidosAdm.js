// Dados de exemplo da área administrativa, seguindo o protótipo do Figma.
// Quando a API expuser a listagem de pedidos, basta trocar PEDIDOS_ADM pela
// chamada ao servidor mantendo o mesmo formato dos objetos abaixo.
export const PEDIDOS_ADM = [
  {
    codigo: "12345",
    nomeCliente: "João Silva",
    etapaAtual: "Usinagem",
    situacao: "EM_ANDAMENTO",
    atualizadoEm: "Hoje, 12:00",
  },
  {
    codigo: "12346",
    nomeCliente: "Marina Duarte",
    etapaAtual: "Aprovação/revisão do projeto executivo",
    situacao: "EM_ANDAMENTO",
    atualizadoEm: "24 set, 15:00",
  },
  {
    codigo: "12340",
    nomeCliente: "Beatriz Alves",
    etapaAtual: "Finalização",
    situacao: "FINALIZADO",
    atualizadoEm: "27 set, 22:50",
  },
  {
    codigo: "12350",
    nomeCliente: "Rafael Nunes",
    etapaAtual: "Recebimento de material",
    situacao: "EM_ANDAMENTO",
    atualizadoEm: "3 out, 17:00",
  },
  {
    codigo: "12351",
    nomeCliente: "Eduardo Fonte",
    etapaAtual: "Separação de peças",
    situacao: "EM_ANDAMENTO",
    atualizadoEm: "30 set, 09:15",
  },
];

// Etapas do fluxo de produção, na ordem usada no cadastro (mesma lista do seed).
export const ETAPAS_ADM = [
  "Visita técnica",
  "Elaboração do projeto executivo",
  "Aprovação/revisão do projeto executivo",
  "Revisão pré-efetivação",
  "Efetivação do serviço",
  "Compra de material",
  "Recebimento de material",
  "Fila de produção",
  "Usinagem",
  "Separação de peças",
  "Fitamento",
  "Fila de pré-montagem",
  "Pré-montagem",
  "Embalagem",
  "Expedição",
  "Montagem",
  "Finalização",
];

/** Etapas presentes na lista, sem repetições e em ordem alfabética. */
export function etapasDe(pedidos) {
  return [...new Set(pedidos.map((pedido) => pedido.etapaAtual))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}

/** Próximo código numérico livre, a partir do maior código da lista. */
export function proximoCodigo(pedidos) {
  const maior = pedidos.reduce((atual, pedido) => {
    const numero = Number.parseInt(pedido.codigo, 10);
    return Number.isNaN(numero) ? atual : Math.max(atual, numero);
  }, 0);

  return String(maior + 1);
}

/** Texto de atualização exibido na tabela para um pedido recém-cadastrado. */
export function formatarAtualizacaoAgora() {
  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return `Hoje, ${hora}`;
}
