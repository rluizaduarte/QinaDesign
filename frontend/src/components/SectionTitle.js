import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function SectionTitle({ children, italic, sx = [], ...props }) {
  return (
    <Typography
      variant="h2"
      sx={[
        {
          fontSize: "clamp(2rem, 4vw, 3.5rem)",
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "text.primary",
          mb: 6,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
      {italic && (
        <Box
          component="em"
          sx={{
            display: "block",
            fontStyle: "italic",
            fontWeight: 300,
            color: "primary.dark",
          }}
        >
          {italic}
        </Box>
      )}
    </Typography>
  );
}
