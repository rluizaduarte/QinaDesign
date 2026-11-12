import { encaminhar } from "../../../lib/apiAdm";

export function GET(request) {
  const params = request.nextUrl.searchParams;
  return encaminhar("/pedidos", {
    query: {
      search: params.get("search"),
      situacao: params.get("situacao"),
      etapaId: params.get("etapaId"),
    },
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  return encaminhar("/pedidos", { method: "POST", body });
}
