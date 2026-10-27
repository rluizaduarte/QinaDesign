"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Step from "@mui/material/Step";
import StepContent from "@mui/material/StepContent";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";

// Dados fixos por enquanto; depois vêm do banco de dados
const pedido = {
  numero: "12345",
  criadoEm: "Feito em 25 set, às 22:11.",
  etapaAtual: 9, // número da etapa em andamento (começa em 1)
};

const etapas = [
  { nome: "Visita técnica", data: "27 set, 15:00" },
  { nome: "Elaboração do projeto executivo", data: "28 set, 10:00" },
  { nome: "Aprovação/revisão do projeto executivo", data: "29 set, 12:00" },
  { nome: "Revisão pré-efetivação", data: "30 set, 12:00" },
  { nome: "Efetivação do serviço", data: "5 out, 15:00" },
  { nome: "Compra de material", data: "5 out, 18:00" },
  { nome: "Recebimento de material", data: "15 out, 08:00" },
  { nome: "Fila de produção", data: "15 out, 15:00" },
  { nome: "Usinagem", data: "Atualizado hoje, 12:00" },
  { nome: "Separação de peças" },
  { nome: "Fitamento" },
  { nome: "Separação de peças" },
  { nome: "Fila de pré-montagem" },
  { nome: "Pré-montagem" },
];

export default function AcompanharPedido() {
  const [busca, setBusca] = useState("");

  function buscarPedido(e) {
    e.preventDefault();
    console.log("Buscar pedido:", busca); // depois liga no back-end
  }

  return (
    // min-height (e não height) deixa a página rolar quando o conteúdo passa da tela
    <Container maxWidth="sm" sx={{ minHeight: "100vh", py: 3 }}>
      {/* Barra de pesquisa */}
      <Box component="form" onSubmit={buscarPedido} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Número do pedido"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" edge="end" aria-label="Buscar pedido">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Cabeçalho do pedido */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline">PEDIDO</Typography>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 900 }}>
          #{pedido.numero}
        </Typography>
        <Typography variant="h5" sx={{ fontStyle: "italic", fontWeight: 300 }}>
          {pedido.criadoEm}
        </Typography>
      </Box>

      {/* Etapas */}
      <Stepper orientation="vertical" activeStep={pedido.etapaAtual - 1}>
        {etapas.map((etapa, index) => {
          const numero = index + 1;
          const pendente = numero > pedido.etapaAtual;

          return (
            <Step
              key={numero}
              // completed={false} mantém o NÚMERO no círculo (por padrão o MUI
              // troca por um check nas etapas já concluídas)
              completed={false}
              // expanded mostra o conteúdo (data e observações) nas etapas
              // concluídas e na atual; as pendentes ficam só com o nome
              expanded={!pendente}
              sx={pendente ? { opacity: 0.5 } : undefined}
            >
              <StepLabel>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {etapa.nome}
                </Typography>
              </StepLabel>

              <StepContent>
                <Typography variant="caption" display="block">
                  {etapa.data}
                </Typography>
                <Link
                href="#"
                variant="caption"
                underline="always"
                color="inherit"
                sx={{ display: "block", mt: 0.5 }}
>
                Observações sobre o andamento da etapa
                </Link>
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </Container>
  );
}