"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BotaoAcao from "./BotaoAcao";
import Label from "./Label";
import ModalAdm from "./ModalAdm";
import SectionTitle from "./SectionTitle";
import { BOTAO_NEUTRO, CAMPO, TITULO_CAMPO } from "./EstilosCampo";

const ESPACO_BLOCOS = 32;
const ESPACO_CAMPOS = 20;
const ERRO = { mt: 1, fontSize: 13, color: "error.main" };

export default function FormularioRedefinirSenha({
  usuario,
  onFechar,
  onRedefinir,
}) {
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState({});
  const [enviando, setEnviando] = useState(false);

  function limpar() {
    setSenha("");
    setConfirmacao("");
    setErro({});
    setEnviando(false);
  }

  function fechar() {
    limpar();
    onFechar();
  }

  async function enviar(event) {
    event.preventDefault();
    if (enviando) return;

    const erros = {};
    if (senha.length < 6)
      erros.senha = "A senha deve ter ao menos 6 caracteres.";
    if (confirmacao !== senha) erros.confirmacao = "As senhas não coincidem.";
    if (Object.keys(erros).length > 0) {
      setErro(erros);
      return;
    }

    setEnviando(true);
    setErro({});

    try {
      await onRedefinir(usuario.id, senha);
      limpar();
    } catch (falha) {
      setErro({ geral: falha.message });
      setEnviando(false);
    }
  }

  return (
    <ModalAdm
      aberto={Boolean(usuario)}
      onFechar={fechar}
      ariaLabelledBy="titulo-redefinir-senha"
    >
      <Box component="form" onSubmit={enviar} noValidate>
        <Label>redefinir senha</Label>
        <SectionTitle component="h2" id="titulo-redefinir-senha" sx={{ mb: 1 }}>
          Nova senha
        </SectionTitle>
        <Typography
          sx={{
            mb: `${ESPACO_BLOCOS}px`,
            fontSize: 15,
            fontWeight: 300,
            color: "primary.dark",
          }}
        >
          {usuario?.nome} ({usuario?.email})
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: `${ESPACO_CAMPOS}px`,
          }}
        >
          <Box>
            <Box component="label" htmlFor="redefinir-senha" sx={TITULO_CAMPO}>
              Senha
            </Box>
            <Box
              component="input"
              id="redefinir-senha"
              type="password"
              value={senha}
              autoFocus
              autoComplete="new-password"
              maxLength={128}
              onChange={(event) => {
                setSenha(event.target.value);
                if (erro.senha) setErro((atual) => ({ ...atual, senha: "" }));
              }}
              aria-invalid={Boolean(erro.senha)}
              sx={{
                ...CAMPO,
                ...(erro.senha && { borderColor: "error.main" }),
              }}
            />
            {erro.senha && (
              <Typography role="alert" sx={ERRO}>
                {erro.senha}
              </Typography>
            )}
          </Box>

          <Box>
            <Box
              component="label"
              htmlFor="redefinir-confirmacao"
              sx={TITULO_CAMPO}
            >
              Confirmar senha
            </Box>
            <Box
              component="input"
              id="redefinir-confirmacao"
              type="password"
              value={confirmacao}
              autoComplete="new-password"
              maxLength={128}
              onChange={(event) => {
                setConfirmacao(event.target.value);
                if (erro.confirmacao)
                  setErro((atual) => ({ ...atual, confirmacao: "" }));
              }}
              aria-invalid={Boolean(erro.confirmacao)}
              sx={{
                ...CAMPO,
                ...(erro.confirmacao && { borderColor: "error.main" }),
              }}
            />
            {erro.confirmacao && (
              <Typography role="alert" sx={ERRO}>
                {erro.confirmacao}
              </Typography>
            )}
          </Box>
        </Box>

        {erro.geral && (
          <Typography role="alert" sx={{ ...ERRO, mt: `${ESPACO_CAMPOS}px` }}>
            {erro.geral}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px",
            mt: `${ESPACO_BLOCOS}px`,
          }}
        >
          <BotaoAcao type="button" onClick={fechar} sx={BOTAO_NEUTRO}>
            Cancelar
          </BotaoAcao>
          <BotaoAcao type="submit" disabled={enviando}>
            {enviando ? "Salvando..." : "Salvar"}
          </BotaoAcao>
        </Box>
      </Box>
    </ModalAdm>
  );
}
