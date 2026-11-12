import { encaminhar } from "../../../../lib/apiAdm";

export async function DELETE(_request, { params }) {
  const { id } = await params;
  return encaminhar(`/usuarios/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
