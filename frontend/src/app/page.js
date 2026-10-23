import Image from "next/image";
import styles from "./page.module.css";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <>
      <Typography variant="h1">Teste do tema</Typography>
      <Typography variant="h4">
        Se este texto estiver em Satoshi, a fonte está funcionando.
      </Typography>
      <Button variant="contained">Botão MUI</Button>
    </>
  );
}
