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
    criadoEm: "2026-09-24T22:11:00-03:00",
    observacao: "Cozinha + Área de Serviço",
  },
  {
    codigo: "12346",
    nomeCliente: "Marina Duarte",
    etapaAtual: "Aprovação/revisão do projeto executivo",
    situacao: "EM_ANDAMENTO",
    atualizadoEm: "24 set, 15:00",
    criadoEm: "2026-09-20T10:00:00-03:00",
  },
  {
    codigo: "12340",
    nomeCliente: "Beatriz Alves",
    etapaAtual: "Finalização",
    situacao: "FINALIZADO",
    atualizadoEm: "27 set, 22:50",
    criadoEm: "2026-09-22T09:30:00-03:00",
  },
  {
    codigo: "12350",
    nomeCliente: "Rafael Nunes",
    etapaAtual: "Recebimento de material",
    situacao: "EM_ANDAMENTO",
    atualizadoEm: "3 out, 17:00",
    criadoEm: "2026-09-28T14:00:00-03:00",
  },
  {
    codigo: "12351",
    nomeCliente: "Eduardo Fonte",
    etapaAtual: "Separação de peças",
    situacao: "EM_ANDAMENTO",
    atualizadoEm: "30 set, 09:15",
    criadoEm: "2026-09-25T11:00:00-03:00",
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

// Chave usada para manter as alterações da área administrativa no navegador.
// Quando o backend tiver os endpoints de pedido, esta camada pode ser trocada
// pela chamada à API sem mudar os componentes.
const CHAVE_PEDIDOS = "qina:pedidos-adm";

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

/** Texto de atualização exibido na tabela para um pedido recém-alterado. */
export function formatarAtualizacaoAgora() {
  const hora = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return `Hoje, ${hora}`;
}

// Pedidos antigos salvos sem data de criação ganham uma data a partir do
// campo "dataInicio", para a página de edição não ficar sem o "Feito em".
function normalizarPedido(pedido) {
  if (pedido.criadoEm) return pedido;

  if (pedido.dataInicio) {
    return { ...pedido, criadoEm: `${pedido.dataInicio}T12:00:00-03:00` };
  }

  return pedido;
}

/** Lê os pedidos da área administrativa (protótipo salvo no navegador). */
export function carregarPedidosAdm() {
  if (typeof window === "undefined") return PEDIDOS_ADM;

  try {
    const salvo = window.localStorage.getItem(CHAVE_PEDIDOS);
    if (!salvo) return PEDIDOS_ADM;

    const lista = JSON.parse(salvo);
    if (!Array.isArray(lista) || lista.length === 0) return PEDIDOS_ADM;

    return lista.map(normalizarPedido);
  } catch {
    return PEDIDOS_ADM;
  }
}

/** Salva a lista de pedidos da área administrativa. */
export function salvarPedidosAdm(pedidos) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
  } catch {
    // Armazenamento indisponível (modo privado/quota): mantém só em memória.
  }
}

/** Busca um pedido pelo código. */
export function buscarPedidoAdm(codigo) {
  return carregarPedidosAdm().find((pedido) => pedido.codigo === codigo) ?? null;
}

/** Cadastra um novo pedido e devolve a lista atualizada. */
export function criarPedidoAdm({ nomeCliente, etapaAtual, dataInicio, observacao }) {
  const pedidos = carregarPedidosAdm();

  const novoPedido = {
    codigo: proximoCodigo(pedidos),
    nomeCliente,
    etapaAtual,
    situacao: "EM_ANDAMENTO",
    atualizadoEm: formatarAtualizacaoAgora(),
    criadoEm: new Date().toISOString(),
    dataInicio,
    observacao: observacao || null,
  };

  const lista = [novoPedido, ...pedidos];
  salvarPedidosAdm(lista);

  return lista;
}

/** Atualiza um pedido existente e devolve a lista atualizada. */
export function atualizarPedidoAdm(codigo, dados) {
  const lista = carregarPedidosAdm().map((pedido) =>
    pedido.codigo === codigo
      ? { ...pedido, ...dados, atualizadoEm: formatarAtualizacaoAgora() }
      : pedido
  );

  salvarPedidosAdm(lista);

  return lista;
}
