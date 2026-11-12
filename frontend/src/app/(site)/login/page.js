import { Suspense } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Label from "../../../components/Label";
import SectionTitle from "../../../components/SectionTitle";
import FormularioLogin from "../../../components/FormularioLogin";

export const metadata = {
  title: "Qina Design - Acesso administrativo",
};

export default function Page() {
  return (
    <Box
      component="section"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center", py: 12 }}
    >
      <Container>
        <Label>área restrita</Label>
        <SectionTitle italic="administrativo">Acesse o painel</SectionTitle>

        {/* Suspense é exigido pelo useSearchParams em páginas estáticas. */}
        <Suspense>
          <FormularioLogin />
        </Suspense>
      </Container>
    </Box>
  );
}
