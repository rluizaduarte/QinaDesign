import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import UsuarioProvider from "../../components/UsuarioProvider";
import { NOME_COOKIE, buscarPerfil } from "../../lib/auth";

export const metadata = {
  title: "Qina Design - Área administrativa",
  description: "Gerenciamento dos pedidos da Qina Design.",
};

// estrutura comum das telas administrativas: sidebar à esquerda e conteúdo à direita
export default async function DashboardLayout({ children }) {
  const token = (await cookies()).get(NOME_COOKIE)?.value;
  const usuario = await buscarPerfil(token);

  if (!usuario) redirect("/login?sessao=expirada");

  return (
    <UsuarioProvider usuario={usuario}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          bgcolor: "background.default",
        }}
      >
        {children}
      </Box>
    </UsuarioProvider>
  );
}
