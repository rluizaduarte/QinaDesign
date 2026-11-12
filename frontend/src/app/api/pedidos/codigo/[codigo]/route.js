import { encaminhar } from "../../../../../lib/apiAdm";

export async function GET(_request, { params }) {
  const { codigo } = await params;
  return encaminhar(`/pedidos/${encodeURIComponent(codigo)}`);
}
