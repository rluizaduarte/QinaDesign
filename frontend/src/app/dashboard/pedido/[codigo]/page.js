import EditarPedido from "../../../../components/EditarPedido";

export const metadata = {
  title: "Qina Design - Editar pedido",
  description: "Alteração dos dados de um pedido da Qina Design.",
};

export default async function EditarPedidoPage({ params }) {
  const { codigo } = await params;

  return <EditarPedido codigo={codigo} />;
}
