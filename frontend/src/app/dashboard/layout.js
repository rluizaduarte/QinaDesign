import Box from "@mui/material/Box";

export const metadata = {
  title: "Qina Design - Área administrativa",
  description: "Gerenciamento dos pedidos da Qina Design.",
};

// estrutura comum das telas administrativas: sidebar à esquerda e conteúdo à direita
export default function DashboardLayout({ children }) {
  return (
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
  );
}
