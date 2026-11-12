import { encaminhar } from "../../../../../lib/apiAdm";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  return encaminhar(`/usuarios/${encodeURIComponent(id)}/senha`, {
    method: "PATCH",
    body,
  });
}
