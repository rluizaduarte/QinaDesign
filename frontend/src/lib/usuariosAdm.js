import { chamar } from "./clienteApi";

export function listarUsuarios() {
  return chamar("/usuarios");
}

export function criarUsuario(dados) {
  return chamar("/usuarios", { method: "POST", body: dados });
}

export function redefinirSenhaUsuario(id, senha) {
  return chamar(`/usuarios/${id}/senha`, { method: "PATCH", body: { senha } });
}

export function removerUsuario(id) {
  return chamar(`/usuarios/${id}`, { method: "DELETE" });
}
