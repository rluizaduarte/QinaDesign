"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Link from "@mui/material/Link";
import Step from "@mui/material/Step";
import StepContent from "@mui/material/StepContent";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { Search } from "lucide-react";
import Label from "../../components/Label";
import SectionTitle from "../../components/SectionTitle";

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
    // Container do tema: já traz as margens laterais (alinhadas com a logo do Header).
    // pt: 12 deixa espaço para o Header, que fica por cima da página (position: absolute).
    // min-height (e não height) deixa a página rolar quando o conteúdo passa da tela
    <Container sx={{ minHeight: "100vh", pt: 12, pb: 6 }}>
      {/* Coluna estreita, alinhada à esquerda como a tela de entrada */}
      <Box sx={{ maxWidth: 600 }}>
        {/* Barra de pesquisa (mesmo visual do SearchForm da tela de entrada) */}
        <Box
          component="form"
          onSubmit={buscarPedido}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: 49,
            px: 2,
            mb: 4,
            bgcolor: "primary.dark",
            color: "secondary.main",
            borderRadius: "4px",
          }}
        >
          <InputBase
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o código do pedido"
            slotProps={{ input: { "aria-label": "Código do pedido" } }}
            sx={{
              flex: 1,
              color: "inherit",
              fontSize: "0.9rem",
              fontWeight: 500,
              letterSpacing: "0.02em",
              "& input::placeholder": { color: "secondary.main", opacity: 1 },
            }}
          />
          <IconButton
            type="submit"
            aria-label="Buscar pedido"
            disableRipple
            sx={{ p: 0, color: "inherit", "&:hover": { bgcolor: "transparent" } }}
          >
            <Search size={24} />
          </IconButton>
        </Box>

        {/* Cabeçalho do pedido */}
        <Box sx={{ mb: 4 }}>
          <Label>pedido</Label>
          {/* "& em" reduz só a linha em itálico (data), que no SectionTitle
              herda o tamanho grande do título */}
          <SectionTitle
            component="h1"
            italic={pedido.criadoEm}
            sx={{ mb: 0, "& em": { fontSize: "1.5rem" } }}
          >
            #{pedido.numero}
          </SectionTitle>
        </Box>

        {/* Etapas */}
        <Stepper orientation="vertical" activeStep={pedido.etapaAtual - 1}>
          {etapas.map((etapa, index) => {
            const numero = index + 1;
            const pendente = numero > pedido.etapaAtual;
            const atual = numero === pedido.etapaAtual;

            return (
              <Step
                key={numero}
                // completed={false} mantém o NÚMERO no círculo (por padrão o MUI
                // troca por um check nas etapas já concluídas)
                completed={false}
                // expanded mostra o conteúdo (data e observações) nas etapas
                // concluídas e na atual; as pendentes ficam só com o nome
                expanded={!pendente}
                // cores do círculo vindas do tema:
                // atual = primary.dark (forte), concluída = primary.light (suave),
                // pendente = cinza padrão do MUI com opacidade
                sx={
                  pendente
                    ? { opacity: 0.5 }
                    : {
                        "& .MuiStepIcon-root, & .MuiStepIcon-root.Mui-active": {
                          color: atual ? "primary.dark" : "primary.light",
                        },
                      }
                }
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
      </Box>
    </Container>
  );
}