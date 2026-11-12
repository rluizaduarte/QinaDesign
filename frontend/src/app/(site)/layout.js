import Header from "../../components/Header";

// gp de rotas públicas (home, login e consulta de pedido pelo cliente)
export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
