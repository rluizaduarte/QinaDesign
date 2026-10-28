import Image from "next/image";
import Container from "@mui/material/Container";

export default function Header() {
  return (
    <Container sx={{ position: "absolute", top: 0, left: 0, right: 0, pt: 1 }}>
      <Image
        src="/logo_horizontal-verde.svg"
        alt="Qina Design"
        width={165}
        height={48}
      />
    </Container>
  );
}
