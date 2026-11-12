"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";

const LARGURA = 455;

const CAMPOS = [
  {
    id: "email",
    rotulo: "E-mail",
    tipo: "email",
    placeholder: "nome@qinadesign.com.br",
    autoComplete: "username",
  },
  {
    id: "senha",
    rotulo: "Senha",
    tipo: "password",
    placeholder: "••••••••",
    autoComplete: "current-password",
  },
];

export default function FormularioLogin() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [valores, setValores] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState(
    parametros.get("sessao") === "expirada"
      ? "Sua sessão expirou. Entre novamente."
      : "",
  );
  const [enviando, setEnviando] = useState(false);

  const destino = parametros.get("de")?.startsWith("/dashboard")
    ? parametros.get("de")
    : "/dashboard";

  async function enviar(event) {
    event.preventDefault();
    if (enviando) return;

    const email = valores.email.trim();
    if (!email || !valores.senha) {
      setErro("Informe o e-mail e a senha.");
      return;
    }

    setEnviando(true);
    setErro("");

    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: valores.senha }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => ({}));
        setErro(dados.mensagem ?? "Não foi possível entrar agora.");
        setEnviando(false);
        return;
      }

      router.replace(destino);
      router.refresh();
    } catch {
      setErro("Não conseguimos falar com o servidor. Verifique a conexão.");
      setEnviando(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={enviar}
      noValidate
      sx={{ display: "flex", flexDirection: "column", maxWidth: LARGURA }}
    >
      {CAMPOS.map((campo) => (
        <Box key={campo.id}>
          <Typography
            component="label"
            htmlFor={campo.id}
            sx={{
              display: "block",
              mb: "10px",
              fontSize: 15,
              color: "primary.dark",
            }}
          >
            {campo.rotulo}
          </Typography>

          <InputBase
            id={campo.id}
            name={campo.id}
            type={campo.tipo}
            placeholder={campo.placeholder}
            autoComplete={campo.autoComplete}
            value={valores[campo.id]}
            onChange={(event) => {
              setValores((atual) => ({
                ...atual,
                [campo.id]: event.target.value,
              }));
              if (erro) setErro("");
            }}
            required
            sx={{
              display: "flex",
              width: "100%",
              height: 49,
              px: 2,
              mb: "20px",
              bgcolor: "rgba(255, 255, 255, 0.3)",
              border: "1px solid rgba(26, 26, 26, 0.15)",
              borderRadius: "4px",
              fontSize: "0.9rem",
              "&.Mui-focused": { borderColor: "primary.main" },
              "& input::placeholder": {
                color: "rgba(26, 26, 26, 0.5)",
                opacity: 1,
              },
            }}
          />
        </Box>
      ))}

      {erro && (
        <Typography
          role="alert"
          sx={{ mb: "20px", fontSize: 13, color: "error.main" }}
        >
          {erro}
        </Typography>
      )}

      <Box
        component="button"
        type="submit"
        disabled={enviando}
        sx={{
          mt: erro ? 0 : "20px",
          width: "100%",
          height: 49,
          border: 0,
          borderRadius: "4px",
          bgcolor: "primary.dark",
          color: "secondary.main",
          fontFamily: "inherit",
          fontSize: "0.9rem",
          fontWeight: 500,
          letterSpacing: "0.02em",
          cursor: "pointer",
          "&:disabled": { opacity: 0.6, cursor: "default" },
        }}
      >
        {enviando ? "Entrando..." : "Entrar"}
      </Box>
    </Box>
  );
}
