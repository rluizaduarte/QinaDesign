import { API_URL } from "./api";

export const NOME_COOKIE = "qina_token";

const DURACAO_PADRAO_SEGUNDOS = 8 * 60 * 60;

export function opcoesDoCookie(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/**
 * Lê a expiração ("exp") do JWT sem validá-lo — a validação é feita pela API.
 * Devolve a duração restante em segundos, ou a duração padrão.
 */
export function duracaoDoToken(token) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    );
    const restante = Number(payload.exp) - Math.floor(Date.now() / 1000);
    return restante > 0 ? restante : DURACAO_PADRAO_SEGUNDOS;
  } catch {
    return DURACAO_PADRAO_SEGUNDOS;
  }
}

/**
 * POST /auth/login. Devolve { token } ou { erro, status } com um dos erros:
 * "credenciais" (401) | "inativo" (403) | "servico" | "conexao".
 */
export async function autenticar({ email, senha }) {
  try {
    const resposta = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
      cache: "no-store",
    });

    if (resposta.status === 401) return { erro: "credenciais", status: 401 };
    if (resposta.status === 403) return { erro: "inativo", status: 403 };
    if (!resposta.ok) return { erro: "servico", status: 502 };

    const { accessToken } = await resposta.json();
    if (!accessToken) return { erro: "servico", status: 502 };

    return { token: accessToken };
  } catch {
    return { erro: "conexao", status: 503 };
  }
}

/** GET /auth/perfil. Devolve { id, nome, email, perfil } ou null. */
export async function buscarPerfil(token) {
  if (!token) return null;

  try {
    const resposta = await fetch(`${API_URL}/auth/perfil`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    return resposta.ok ? await resposta.json() : null;
  } catch {
    return null;
  }
}
