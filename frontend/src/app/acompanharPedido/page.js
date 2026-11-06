import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Label from "../../components/Label";
import SectionTitle from "../../components/SectionTitle";
import SearchForm from "../../components/SearchForm";

export default function AcompanharPedido() {
  return (
    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        // py reserva espaço para o Header, que fica por cima da página
        py: { xs: 14, md: 10 },
      }}
    >
      <Container>
        <Label>acompanhar pedido</Label>

        <SectionTitle
          component="h1"
          italic="do pedido."
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          Digite o número
        </SectionTitle>

        <Box sx={{ maxWidth: 600 }}>
          <SearchForm />
        </Box>
      </Container>
    </Box>
  );
}
