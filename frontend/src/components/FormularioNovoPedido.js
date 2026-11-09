"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { ChevronDown } from "lucide-react";
import { ETAPAS_ADM } from "../lib/pedidosAdm";

const CAMPO = {
  width: "100%",
  height: 50,
  px: 2,
  border: 0,
  borderRadius: "2px",
  bgcolor: "common.white",
  color: "text.primary",
  fontFamily: "inherit",
  fontSize: "1rem",
  fontWeight: 300,
  "&:focus": {
    outline: "2px solid",
    outlineColor: "primary.light",
    outlineOffset: 1,
  },
};

const ROTULO = {
  display: "block",
  mb: 1,
  fontSize: "1rem",
  fontWeight: 300,
  color: "primary.dark",
};

const BOTAO = {
  height: 48,
  px: 3.5,
  borderRadius: "4px",
  fontSize: "0.95rem",
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  "&:hover": { boxShadow: "none" },
};

// Modal de cadastro de um novo pedido na área administrativa.
export default function FormularioNovoPedido({ aberto, onFechar, onCadastrar }) {
  const [nomeCliente, setNomeCliente] = useState("");
  const [etapaAtual, setEtapaAtual] = useState(ETAPAS_ADM[0]);
  const [dataInicio, setDataInicio] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");

  function limpar() {
    setNomeCliente("");
    setEtapaAtual(ETAPAS_ADM[0]);
    setDataInicio("");
    setObservacao("");
    setErro("");
  }

  function fechar() {
    limpar();
    onFechar();
  }

  function enviar(event) {
    event.preventDefault();

    const nome = nomeCliente.trim();
    if (!nome) {
      setErro("Informe o nome do cliente.");
      return;
    }

    onCadastrar({
      nomeCliente: nome,
      etapaAtual,
      dataInicio,
      observacao: observacao.trim(),
    });

    limpar();
  }

  return (
    <Dialog
      open={aberto}
      onClose={fechar}
      fullWidth
      maxWidth={false}
      aria-labelledby="titulo-novo-pedido"
      slotProps={{
        paper: {
          sx: {
            width: { xs: "100%", sm: 660 },
            maxWidth: "100%",
            maxHeight: "calc(100% - 32px)",
            m: { xs: 1, sm: 2 },
            borderRadius: 0,
            bgcolor: "background.default",
            backgroundImage: "none",
          },
        },
        backdrop: {
          sx: {
            bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.55),
          },
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, md: 5 } }}>
        <Typography
          component="p"
          sx={{
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "primary.light",
            mb: 1.5,
          }}
        >
          Cadastrar novo pedido
        </Typography>

        <Typography
          component="h2"
          id="titulo-novo-pedido"
          sx={{
            fontSize: { xs: "2rem", md: "2.5rem" },
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "text.primary",
            mb: 4,
          }}
        >
          Novo pedido
        </Typography>

        <Box component="form" onSubmit={enviar}>
          <Box sx={{ mb: 2.5 }}>
            <Box component="label" htmlFor="novo-pedido-nome" sx={ROTULO}>
              Nome do cliente
            </Box>
            <Box
              component="input"
              id="novo-pedido-nome"
              type="text"
              value={nomeCliente}
              onChange={(event) => {
                setNomeCliente(event.target.value);
                if (erro) setErro("");
              }}
              autoFocus
              required
              aria-invalid={Boolean(erro)}
              aria-describedby={erro ? "erro-novo-pedido-nome" : undefined}
              sx={{
                ...CAMPO,
                borderColor: erro ? "error.main" : "transparent",
              }}
            />
            {erro && (
              <Typography
                id="erro-novo-pedido-nome"
                role="alert"
                sx={{ mt: 0.75, fontSize: "0.85rem", color: "error.main" }}
              >
                {erro}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 2.5, position: "relative" }}>
            <Box component="label" htmlFor="novo-pedido-etapa" sx={ROTULO}>
              Etapa atual
            </Box>
            <Box
              component="select"
              id="novo-pedido-etapa"
              value={etapaAtual}
              onChange={(event) => setEtapaAtual(event.target.value)}
              sx={{
                ...CAMPO,
                pr: 6,
                appearance: "none",
                cursor: "pointer",
              }}
            >
              {ETAPAS_ADM.map((nome, indice) => (
                <option key={nome} value={nome}>
                  {indice + 1}. {nome}
                </option>
              ))}
            </Box>
            <Box
              component="span"
              sx={{
                position: "absolute",
                right: 16,
                bottom: 15,
                display: "flex",
                pointerEvents: "none",
                color: "primary.dark",
              }}
            >
              <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
            </Box>
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <Box component="label" htmlFor="novo-pedido-data" sx={ROTULO}>
              Data de início
            </Box>
            <Box
              component="input"
              id="novo-pedido-data"
              type="date"
              value={dataInicio}
              onChange={(event) => setDataInicio(event.target.value)}
              required
              sx={{
                ...CAMPO,
                "&::-webkit-calendar-picker-indicator": { cursor: "pointer" },
              }}
            />
          </Box>

          <Box>
            <Box
              component="label"
              htmlFor="novo-pedido-observacao"
              sx={ROTULO}
            >
              Observação (opcional)
            </Box>
            <Box
              component="textarea"
              id="novo-pedido-observacao"
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              rows={4}
              sx={{
                ...CAMPO,
                height: "auto",
                minHeight: 110,
                py: 1.5,
                resize: "vertical",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: 1.5,
              mt: 4,
            }}
          >
            <Button
              type="button"
              onClick={fechar}
              sx={{
                ...BOTAO,
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.06),
                color: "primary.dark",
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.12),
                },
              }}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              disableElevation
              sx={{
                ...BOTAO,
                bgcolor: "primary.main",
                color: "secondary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Cadastrar
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
