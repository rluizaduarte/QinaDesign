export async function chamar(caminho, { method = "GET", body } = {}) {
  const resposta = await fetch(`/api${caminho}`, {
    method,
    headers:
      body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const dados = await resposta.json().catch(() => null);

  if (resposta.status === 401) {
    window.location.assign("/login?sessao=expirada");
    throw new Error("Sessão expirada.");
  }

  if (!resposta.ok) {
    const erro = new Error(
      dados?.mensagem ?? "Não foi possível concluir a operação.",
    );
    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}
