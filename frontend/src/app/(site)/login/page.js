import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import Label from "../../../components/Label";
import SectionTitle from "../../../components/SectionTitle";

const campos = [
  {
    id: "email",
    rotulo: "E-mail",
    tipo: "email",
    placeholder: "nome@qinadesign.com.br",
    autoComplete: "username",
  },
  {
    id: "senha",
    rotulo: "Senha",
    tipo: "password",
    placeholder: "••••••••",
    autoComplete: "current-password",
  },
];

export default function Page() {
  return (
    <Box
      component="section"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: 12,
      }}
    >
      <Container>
        <Label>área restrita</Label>
        <SectionTitle italic="administrativo">Acesse o painel</SectionTitle>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {campos.map((campo) => (
            <Box key={campo.id}>
              <Typography
                component="label"
                htmlFor={campo.id}
                sx={{
                  display: "block",
                  mb: "10px",
                  fontSize: 15,
                  color: "primary.dark",
                }}
              >
                {campo.rotulo}
              </Typography>

              <InputBase
                id={campo.id}
                type={campo.tipo}
                placeholder={campo.placeholder}
                autoComplete={campo.autoComplete}
                sx={{
                  display: "flex",
                  width: 455,
                  height: 49,
                  px: 2,
                  mb: "20px",
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                  border: "1px solid rgba(26, 26, 26, 0.15)",
                  borderRadius: "4px",
                  fontSize: "0.9rem",
                  "&.Mui-focused": { borderColor: "primary.main" },
                  "& input::placeholder": {
                    color: "rgba(26, 26, 26, 0.5)",
                    opacity: 1,
                  },
                }}
              />
            </Box>
          ))}

          <Box
            component="button"
            type="button"
            sx={{
              mt: "20px",
              width: 455,
              height: 49,
              border: 0,
              borderRadius: "4px",
              bgcolor: "primary.dark",
              color: "secondary.main",
              fontFamily: "inherit",
              fontSize: "0.9rem",
              fontWeight: 500,
              letterSpacing: "0.02em",
              cursor: "pointer",
            }}
          >
            Entrar
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
