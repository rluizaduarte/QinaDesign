import { NextResponse } from "next/server";
import {
  NOME_COOKIE,
  autenticar,
  buscarPerfil,
  duracaoDoToken,
  opcoesDoCookie,
} from "../../../../lib/auth";

const MENSAGENS = {
  credenciais: "E-mail ou senha incorretos.",
  inativo: "Este usuário está inativo. Fale com o administrador.",
  servico: "Não foi possível entrar agora. Tente novamente em instantes.",
  conexao: "Não conseguimos falar com o servidor. Verifique a conexão.",
};

// POST /api/auth/login — recebe { email, senha }, autentica na API e grava o
// token em um cookie httpOnly. Devolve o usuário autenticado.
export async function POST(request) {
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json(
      { mensagem: "Requisição inválida." },
      { status: 400 },
    );
  }

  const email = String(corpo?.email ?? "").trim();
  const senha = String(corpo?.senha ?? "");

  if (!email || !senha) {
    return NextResponse.json(
      { mensagem: "Informe o e-mail e a senha." },
      { status: 400 },
    );
  }

  const resultado = await autenticar({ email, senha });

  if (resultado.erro) {
    return NextResponse.json(
      { mensagem: MENSAGENS[resultado.erro] ?? MENSAGENS.servico },
      { status: resultado.status },
    );
  }

  const usuario = await buscarPerfil(resultado.token);

  const resposta = NextResponse.json({ usuario });
  resposta.cookies.set(
    NOME_COOKIE,
    resultado.token,
    opcoesDoCookie(duracaoDoToken(resultado.token)),
  );

  return resposta;
}
