import { encaminhar } from "../../../lib/apiAdm";

export function GET() {
  return encaminhar("/usuarios");
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  return encaminhar("/usuarios", { method: "POST", body });
}
