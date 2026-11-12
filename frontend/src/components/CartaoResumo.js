import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

// card de indicadores da dashboard: 215 x 90, fundo primary.dark a 10%
export default function CartaoResumo({ valor, rotulo }) {
  return (
    <Box
      sx={{
        height: 90,
        px: "20px",
        borderRadius: "4px",
        bgcolor: (theme) => alpha(theme.palette.primary.dark, 0.1),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "10px",
      }}
    >
      <Typography
        component="p"
        sx={{
          fontSize: 22,
          fontWeight: 400,
          lineHeight: 1,
          color: "text.primary",
        }}
      >
        {valor}
      </Typography>

      <Typography
        component="p"
        sx={{
          fontSize: 14,
          fontWeight: 300,
          lineHeight: 1,
          color: "text.primary",
        }}
      >
        {rotulo}
      </Typography>
    </Box>
  );
}
