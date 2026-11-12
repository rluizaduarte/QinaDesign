import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Label from "../../../../components/Label";
import SectionTitle from "../../../../components/SectionTitle";
import SearchForm from "../../../../components/SearchForm";
import EtapaConcluida from "../../../../components/EtapaConcluida";
import EtapaAtual from "../../../../components/EtapaAtual";
import EtapaPendente from "../../../../components/EtapaPendente";
import {
  buscarPedido,
  formatarCriadoEm,
  formatarDataHora,
} from "../../../../lib/pedidos";

const MENSAGENS = {
  naoEncontrado:
    "Não encontramos nenhum pedido com esse código. Confira os números e tente novamente.",
  servico:
    "Não foi possível carregar o pedido agora. Tente novamente em instantes.",
  conexao:
    "Não conseguimos falar com o servidor do pedido. Verifique a conexão e tente novamente.",
};

export default async function Page({ params }) {
  const { codigo } = await params;
  const { pedido, erro } = await buscarPedido(codigo);

  if (!pedido) {
    return (
      <Box
        component="section"
        sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 8 } }}
      >
        <Container>
          <SearchForm defaultValue={codigo} />

          <Box sx={{ mt: { xs: 4, md: 6 }, maxWidth: 600 }}>
            <Label>pedido</Label>
            <SectionTitle component="h1" sx={{ mb: 2 }}>
              #{codigo}
            </SectionTitle>
            <Typography
              sx={{
                fontSize: { xs: 14, md: 15 },
                fontWeight: 300,
                color: "primary.dark",
              }}
            >
              {MENSAGENS[erro] ?? MENSAGENS.servico}
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  const criadoEm = formatarCriadoEm(pedido.criadoEm);

  return (
    <Box
      component="section"
      sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 6, md: 8 } }}
    >
      <Container>
        <Box sx={{ maxWidth: 600 }}>
          <SearchForm defaultValue={pedido.codigo} />
        </Box>

        <Box sx={{ mt: { xs: 4, md: 5 }, maxWidth: 720 }}>
          <Label>pedido</Label>
          <SectionTitle
            component="h1"
            italic={criadoEm}
            sx={{
              mb: { xs: 4, md: 6 },
              "& em": { fontSize: { xs: "1.1rem", md: "1.5rem" } },
            }}
          >
            #{pedido.codigo}
          </SectionTitle>

          <Typography
            sx={{
              mb: 4,
              fontSize: { xs: 14, md: 15 },
              fontWeight: 300,
              color: "primary.dark",
            }}
          >
            {pedido.titulo} — {pedido.nomeCliente}
          </Typography>

          <Box>
            {pedido.etapas.map((etapa) => {
              const ultima = etapa.ordem === pedido.etapas.length;
              const props = {
                nome: etapa.nome,
                data: formatarDataHora(etapa.dataHora),
                comentario: etapa.observacao,
                ultima,
              };

              if (etapa.status === "CONCLUIDA") {
                return <EtapaConcluida key={etapa.ordem} {...props} />;
              }
              if (etapa.status === "ATUAL") {
                return <EtapaAtual key={etapa.ordem} {...props} />;
              }
              return (
                <EtapaPendente
                  key={etapa.ordem}
                  nome={etapa.nome}
                  ultima={ultima}
                />
              );
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
