import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Cartão de indicador exibido no topo do painel (total, em andamento e finalizados).
export default function CartaoResumo({ valor, rotulo }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        px: { xs: 2.5, md: 3 },
        py: { xs: 2, md: 2.5 },
        minHeight: { xs: 84, md: 98 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 0.5,
      }}
    >
      <Typography
        component="p"
        sx={{
          fontSize: { xs: "1.5rem", md: "1.75rem" },
          fontWeight: 400,
          lineHeight: 1.1,
          color: "text.primary",
        }}
      >
        {valor}
      </Typography>

      <Typography
        component="p"
        sx={{
          fontSize: { xs: "0.95rem", md: "1rem" },
          fontWeight: 300,
          color: "primary.dark",
        }}
      >
        {rotulo}
      </Typography>
    </Box>
  );
}
