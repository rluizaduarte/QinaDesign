import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Label from "../components/Label";
import SectionTitle from "../components/SectionTitle";
import SearchForm from "../components/SearchForm";
import GhostButton from "../components/GhostButton";

export default function Page() {
  return (
    <Box
      component="section"
      sx={{
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

        <SearchForm>
          <GhostButton href="#">Sou da equipe Qina</GhostButton>
        </SearchForm>
      </Container>
    </Box>
  );
}
