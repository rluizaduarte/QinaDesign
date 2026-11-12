"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { Trash2 } from "lucide-react";
import BotaoAcao from "./BotaoAcao";

const COLUNAS = [
  { titulo: "Nome", largura: 220 },
  { titulo: "Email", largura: 280 },
];
const LARGURA_ACOES = 209;

const BORDA = (theme) => `1px solid ${theme.palette.primary.light}`;

const CELULA_TRUNCADA = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export default function TabelaFuncionarios({
  usuarios,
  usuarioAtualId,
  onRedefinirSenha,
  onRemover,
}) {
  if (usuarios.length === 0) {
    return (
      <Typography sx={{ fontSize: 13, fontWeight: 300, color: "primary.dark" }}>
        Nenhum funcionário cadastrado.
      </Typography>
    );
  }

  return (
    <Box
      component="table"
      sx={{
        width: "100%",
        tableLayout: "fixed",
        borderCollapse: "collapse",
        textAlign: "left",
        fontSize: 13,
        color: "primary.dark",
        "& th, & td": { borderBottom: BORDA, pr: 2 },
        "& th": { py: "12px", fontWeight: 300, whiteSpace: "nowrap" },
        "& td": { height: 59, fontWeight: 400, verticalAlign: "middle" },
        "& th:last-of-type, & td:last-of-type": { pr: 0 },
      }}
    >
      <colgroup>
        {COLUNAS.map(({ titulo, largura }) => (
          <col key={titulo} style={{ width: largura }} />
        ))}
        <col style={{ width: LARGURA_ACOES }} />
      </colgroup>

      <Box component="thead">
        <Box component="tr">
          {COLUNAS.map(({ titulo }) => (
            <Box component="th" key={titulo} scope="col">
              {titulo}
            </Box>
          ))}
          <Box component="th" scope="col" aria-label="Ações" />
        </Box>
      </Box>

      <Box component="tbody">
        {usuarios.map((usuario) => {
          const editavel =
            usuario.perfil !== "ADMINISTRADOR" && usuario.id !== usuarioAtualId;

          return (
            <Box component="tr" key={usuario.id}>
              <Box
                component="td"
                title={usuario.nome}
                sx={{
                  ...CELULA_TRUNCADA,
                  fontWeight: 700,
                  color: "text.primary",
                }}
              >
                {usuario.nome}
              </Box>

              <Box component="td" title={usuario.email} sx={CELULA_TRUNCADA}>
                {usuario.email}
              </Box>

              <Box component="td">
                {editavel && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <BotaoAcao
                      type="button"
                      onClick={() => onRedefinirSenha(usuario)}
                    >
                      Redefinir senha
                    </BotaoAcao>

                    <ButtonBase
                      type="button"
                      onClick={(event) =>
                        onRemover(usuario, event.currentTarget)
                      }
                      aria-label={`Excluir ${usuario.nome}`}
                      sx={{
                        p: "4px",
                        borderRadius: "4px",
                        color: "primary.dark",
                      }}
                    >
                      <Trash2 size={20} strokeWidth={1.5} aria-hidden="true" />
                    </ButtonBase>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
