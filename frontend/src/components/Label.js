import Typography from "@mui/material/Typography";

export default function Label({ children, sx = [], ...props }) {
  return (
    <Typography
      component="span"
      sx={[
        {
          display: "block",
          fontSize: "0.75rem",
          fontWeight: 500,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "primary.light",
          mb: 2,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Typography>
  );
}
