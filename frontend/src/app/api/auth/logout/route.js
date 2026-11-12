import { NextResponse } from "next/server";
import { NOME_COOKIE, opcoesDoCookie } from "../../../../lib/auth";

// POST /api/auth/logout — apaga o cookie de sessão. A API não mantém estado
// de sessão (JWT), então descartar o token encerra o acesso.
export async function POST() {
  const resposta = NextResponse.json({ ok: true });
  resposta.cookies.set(NOME_COOKIE, "", opcoesDoCookie(0));
  return resposta;
}
