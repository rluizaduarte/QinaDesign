"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { Calendar, ChevronDown } from "lucide-react";
import BotaoAcao from "./BotaoAcao";
import Label from "./Label";
import SectionTitle from "./SectionTitle";
import {
  BOTAO_NEUTRO,
  CAMPO,
  COR_PLACEHOLDER,
  ICONE_CAMPO,
  LARGURA_CAMPO,
  TEXTAREA,
  TITULO_CAMPO,
} from "./EstilosCampo";
import { ETAPAS_ADM } from "../lib/pedidosAdm";

const LARGURA_CAIXA = 550;
const ALTURA_CAIXA = 609;
const ESPACO_BLOCOS = 32;
const ESPACO_CAMPOS = 20;
const LARGURA_FAIXA_ICONE = 52;

export default function FormularioNovoPedido({
  aberto,
  onFechar,
  onCadastrar,
}) {
  const [nomeCliente, setNomeCliente] = useState("");
  const [etapaAtual, setEtapaAtual] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState("");
  const dataRef = useRef(null);

  function abrirCalendario() {
    const campo = dataRef.current;
    if (!campo) return;

    try {
      if (typeof campo.showPicker === "function") campo.showPicker();
      else campo.focus();
    } catch {
      campo.focus();
    }
  }

  function limpar() {
    setNomeCliente("");
    setEtapaAtual("");
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
      etapaAtual: etapaAtual || ETAPAS_ADM[0],
      dataInicio,
      observacao: observacao.trim(),
    });

    limpar();
  }

  return (
    <Dialog
      open={aberto}
      onClose={fechar}
      aria-labelledby="titulo-novo-pedido"
      slotProps={{
        paper: {
          sx: {
            width: LARGURA_CAIXA,
            maxWidth: "calc(100% - 32px)",
            minHeight: ALTURA_CAIXA,
            maxHeight: "calc(100% - 32px)",
            m: 2,
            borderRadius: "4px",
            bgcolor: "background.default",
            backgroundImage: "none",
          },
        },
        backdrop: {
          sx: { bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.55) },
        },
      }}
    >
      <DialogContent
        component="form"
        onSubmit={enviar}
        noValidate
        sx={{ p: { xs: 3, sm: "40px 48px" } }}
      >
        <Label>cadastrar novo pedido</Label>
        <SectionTitle
          component="h2"
          id="titulo-novo-pedido"
          sx={{ mb: `${ESPACO_BLOCOS}px` }}
        >
          Novo pedido
        </SectionTitle>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: `${ESPACO_CAMPOS}px`,
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Box component="label" htmlFor="novo-pedido-nome" sx={TITULO_CAMPO}>
              Nome do cliente
            </Box>
            <Box
              component="input"
              id="novo-pedido-nome"
              type="text"
              value={nomeCliente}
              maxLength={80}
              autoFocus
              onChange={(event) => {
                setNomeCliente(event.target.value);
                if (erro) setErro("");
              }}
              aria-invalid={Boolean(erro)}
              aria-describedby={erro ? "erro-novo-pedido-nome" : undefined}
              sx={{ ...CAMPO, ...(erro && { borderColor: "error.main" }) }}
            />
            {erro && (
              <Typography
                id="erro-novo-pedido-nome"
                role="alert"
                sx={{ mt: 1, fontSize: 13, color: "error.main" }}
              >
                {erro}
              </Typography>
            )}
          </Box>

          <Box sx={{ width: "100%" }}>
            <Box
              component="label"
              htmlFor="novo-pedido-etapa"
              sx={TITULO_CAMPO}
            >
              Etapa atual
            </Box>
            <Box sx={{ position: "relative", maxWidth: LARGURA_CAMPO }}>
              <Box
                component="select"
                id="novo-pedido-etapa"
                value={etapaAtual}
                onChange={(event) => setEtapaAtual(event.target.value)}
                sx={{
                  ...CAMPO,
                  pr: "44px",
                  appearance: "none",
                  cursor: "pointer",
                  color: etapaAtual ? "text.primary" : COR_PLACEHOLDER,
                }}
              >
                {/* Placeholder: a primeira etapa é a escolha padrão. */}
                <option value="" hidden>
                  1. {ETAPAS_ADM[0]}
                </option>
                {ETAPAS_ADM.map((nome, indice) => (
                  <option key={nome} value={nome}>
                    {indice + 1}. {nome}
                  </option>
                ))}
              </Box>
              <Box component="span" sx={ICONE_CAMPO}>
                <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
              </Box>
            </Box>
          </Box>

          <Box sx={{ width: "100%" }}>
            <Box component="label" htmlFor="novo-pedido-data" sx={TITULO_CAMPO}>
              Data de início
            </Box>

            <Box
              onClick={abrirCalendario}
              sx={{
                ...CAMPO,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                "&:focus-within": {
                  borderColor: "primary.main",
                },
              }}
            >
              {/* Data exibida visualmente */}
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: dataInicio ? "text.primary" : COR_PLACEHOLDER,
                }}
              >
                {dataInicio
                  ? new Date(`${dataInicio}T00:00:00`).toLocaleDateString(
                      "pt-BR",
                    )
                  : "dd/mm/aaaa"}
              </Typography>

              <Calendar size={20} strokeWidth={1.5} aria-hidden="true" />

              {/* Input nativo invisível */}
              <Box
                component="input"
                ref={dataRef}
                id="novo-pedido-data"
                type="date"
                value={dataInicio}
                onChange={(event) => setDataInicio(event.target.value)}
                sx={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
            </Box>
          </Box>

          <Box sx={{ width: "100%" }}>
            <Box
              component="label"
              htmlFor="novo-pedido-observacao"
              sx={TITULO_CAMPO}
            >
              Observação (opcional)
            </Box>
            <Box
              component="textarea"
              id="novo-pedido-observacao"
              value={observacao}
              onChange={(event) => setObservacao(event.target.value)}
              sx={TEXTAREA}
            />
          </Box>
        </Box>

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
          <BotaoAcao type="submit">Cadastrar</BotaoAcao>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
