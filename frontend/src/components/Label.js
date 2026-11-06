import Typography from "@mui/material/Typography";

export default function Label({ children, ...props }) {
  return (
    <Typography
      component="span"
      sx={{
        display: "block",
        fontSize: "0.75rem",
        fontWeight: 500,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: "primary.light",
        mb: 2,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
}
