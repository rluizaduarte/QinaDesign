import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Label from "../components/Label";
import SectionTitle from "../components/SectionTitle";

export default function Page() {
  return (
    <Box
      component="section"
      sx={{
        bgcolor: "#E4E3E0",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container>
        <Label>acompanhe seu pedido</Label>
        <SectionTitle italic="seu pedido.">
          Entenda em qual <br /> etapa está o
        </SectionTitle>
      </Container>
    </Box>
  );
}
