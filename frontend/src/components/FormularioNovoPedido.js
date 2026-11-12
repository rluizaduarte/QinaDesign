"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
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
import { rotuloDaEtapa } from "../lib/pedidosAdm";

const LARGURA_CAIXA = 550;
const ALTURA_CAIXA = 609;
const ESPACO_BLOCOS = 32;
const ESPACO_CAMPOS = 20;

const ERRO = { mt: 1, fontSize: 13, color: "error.main" };

export default function FormularioNovoPedido({
  aberto,
  etapas = [],
  onFechar,
  onCadastrar,
}) {
  const [nomeCliente, setNomeCliente] = useState("");
  const [etapaInicialId, setEtapaInicialId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState({});
  const [enviando, setEnviando] = useState(false);
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
    setEtapaInicialId("");
    setDataInicio("");
    setObservacao("");
    setErro({});
    setEnviando(false);
  }

  function fechar() {
    limpar();
    onFechar();
  }

  async function enviar(event) {
    console.log("enviar chamada", { nomeCliente, dataInicio, enviando });
    event.preventDefault();
    if (enviando) return;

    const nome = nomeCliente.trim();
    const erros = {};
    if (nome.length < 2) erros.nome = "Informe o nome do cliente.";
    if (!dataInicio) erros.data = "Informe a data de início.";
    if (Object.keys(erros).length > 0) {
      setErro(erros);
      return;
    }

    setEnviando(true);
    setErro({});

    try {
      await onCadastrar({
        nomeCliente: nome,
        ...(etapaInicialId && { etapaInicialId: Number(etapaInicialId) }),
        dataInicio,
        observacao: observacao.trim(),
      });
      limpar();
    } catch (falha) {
      setErro({ geral: falha.message });
      setEnviando(false);
    }
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
      <DialogContent sx={{ p: { xs: 3, sm: "40px 48px" } }}>
        <Box component="form" onSubmit={enviar} noValidate>
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
              <Box
                component="label"
                htmlFor="novo-pedido-nome"
                sx={TITULO_CAMPO}
              >
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
                  if (erro.nome) setErro((atual) => ({ ...atual, nome: "" }));
                }}
                aria-invalid={Boolean(erro.nome)}
                aria-describedby={
                  erro.nome ? "erro-novo-pedido-nome" : undefined
                }
                sx={{
                  ...CAMPO,
                  ...(erro.nome && { borderColor: "error.main" }),
                }}
              />
              {erro.nome && (
                <Typography id="erro-novo-pedido-nome" role="alert" sx={ERRO}>
                  {erro.nome}
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
                  value={etapaInicialId}
                  onChange={(event) => setEtapaInicialId(event.target.value)}
                  sx={{
                    ...CAMPO,
                    pr: "44px",
                    appearance: "none",
                    cursor: "pointer",
                    color: etapaInicialId ? "text.primary" : COR_PLACEHOLDER,
                  }}
                >
                  {/* Placeholder: a primeira etapa é a escolha padrão. */}
                  <option value="" hidden>
                    {rotuloDaEtapa(etapas[0])}
                  </option>
                  {etapas.map((etapa) => (
                    <option key={etapa.id} value={etapa.id}>
                      {rotuloDaEtapa(etapa)}
                    </option>
                  ))}
                </Box>
                <Box component="span" sx={ICONE_CAMPO}>
                  <ChevronDown size={20} strokeWidth={1.5} aria-hidden="true" />
                </Box>
              </Box>
            </Box>

            <Box sx={{ width: "100%" }}>
              <Box
                component="label"
                htmlFor="novo-pedido-data"
                sx={TITULO_CAMPO}
              >
                Data de início
              </Box>

              {/* A data é exibida por um texto próprio; o input nativo fica
                invisível e só é acionado pelo clique na caixa (showPicker). */}
              <Box
                onClick={abrirCalendario}
                sx={{
                  ...CAMPO,
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  "&:focus-within": { borderColor: "primary.main" },
                  ...(erro.data && { borderColor: "error.main" }),
                }}
              >
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

                <Box
                  component="input"
                  ref={dataRef}
                  id="novo-pedido-data"
                  type="date"
                  value={dataInicio}
                  onChange={(event) => {
                    setDataInicio(event.target.value);
                    if (erro.data) setErro((atual) => ({ ...atual, data: "" }));
                  }}
                  aria-invalid={Boolean(erro.data)}
                  aria-describedby={
                    erro.data ? "erro-novo-pedido-data" : undefined
                  }
                  sx={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
              </Box>
              {erro.data && (
                <Typography id="erro-novo-pedido-data" role="alert" sx={ERRO}>
                  {erro.data}
                </Typography>
              )}
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
              {enviando ? "Cadastrando..." : "Cadastrar"}
            </BotaoAcao>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
