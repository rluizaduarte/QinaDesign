import { encaminhar } from "../../../../../lib/apiAdm";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  return encaminhar(`/pedidos/${encodeURIComponent(id)}/etapa`, {
    method: "PATCH",
    body,
  });
}
