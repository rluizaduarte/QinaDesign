import { NextResponse } from "next/server";
import { NOME_COOKIE } from "./lib/auth";

export function proxy(request) {
  if (request.cookies.has(NOME_COOKIE)) return NextResponse.next();

  const destino = new URL("/login", request.url);
  destino.searchParams.set("de", request.nextUrl.pathname);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
