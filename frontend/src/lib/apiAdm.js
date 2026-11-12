import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "./api";
import { NOME_COOKIE } from "./auth";

function mensagemDe(dados) {
  const mensagem = dados?.message ?? dados?.mensagem;
  if (Array.isArray(mensagem)) return mensagem.join(" ");
  return mensagem ?? "A API devolveu um erro inesperado.";
}

export async function encaminhar(
  caminho,
  { method = "GET", body, query } = {},
) {
  const token = (await cookies()).get(NOME_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ mensagem: "Sessão expirada." }, { status: 401 });
  }

  const url = new URL(`${API_URL}${caminho}`);
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== null && valor !== "") {
      url.searchParams.set(chave, valor);
    }
  }

  try {
    const resposta = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    const texto = await resposta.text();
    let dados = null;
    try {
      dados = texto ? JSON.parse(texto) : null;
    } catch {
      dados = { message: texto };
    }

    if (!resposta.ok) {
      return NextResponse.json(
        { mensagem: mensagemDe(dados) },
        { status: resposta.status },
      );
    }

    return NextResponse.json(dados, { status: resposta.status });
  } catch (erro) {
    console.error("[apiAdm] Falha ao chamar", url.toString(), erro);
    return NextResponse.json(
      {
        mensagem:
          "Não conseguimos falar com a API. Verifique se ela está no ar.",
      },
      { status: 503 },
    );
  }
}
