import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Label from "../../../components/Label";
import SectionTitle from "../../../components/SectionTitle";
import SearchForm from "../../../components/SearchForm";
import EtapaConcluida from "../../../components/EtapaConcluida";
import EtapaAtual from "../../../components/EtapaAtual";
import EtapaPendente from "../../../components/EtapaPendente";

// Dados fixos por enquanto; depois vêm do banco de dados
const pedido = {
  numero: "12345",
  criadoEm: { data: "25 set", hora: "22:11" },
  etapaAtual: 9, // número da etapa em andamento (começa em 1)
};

const etapas = [
  { nome: "Visita técnica", data: "27 set, 15:00", comentario: "Teste" },
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
  { nome: "Embalagem" },
  { nome: "Expedição" },
  { nome: "Montagem" },
  { nome: "Finalização" },
];

export default function Page() {
  return (
    <Box component="section" sx={{ pt: 12, pb: 8 }}>
      <Container>
        <SearchForm />

        <Box sx={{ mt: 4 }}>
          <Label>pedido</Label>
          <SectionTitle
            italic={`Feito em ${pedido.criadoEm.data}, às ${pedido.criadoEm.hora}.`}
          >
            #{pedido.numero}
          </SectionTitle>
        </Box>

        <Box>
          {etapas.map((etapa, i) => {
            const numero = i + 1;
            const ultima = numero === etapas.length;

            if (numero < pedido.etapaAtual) {
              return <EtapaConcluida key={i} {...etapa} ultima={ultima} />;
            }
            if (numero === pedido.etapaAtual) {
              return <EtapaAtual key={i} {...etapa} ultima={ultima} />;
            }
            return <EtapaPendente key={i} nome={etapa.nome} ultima={ultima} />;
          })}
        </Box>
      </Container>
    </Box>
  );
}
