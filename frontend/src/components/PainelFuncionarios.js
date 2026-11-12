"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BotaoAcao from "./BotaoAcao";
import FormularioNovoPedido from "./FormularioNovoPedido";
import FormularioRedefinirSenha from "./FormularioRedefinirSenha";
import Label from "./Label";
import PopupConfirmacao from "./PopupConfirmacao";
import SectionTitle from "./SectionTitle";
import SidebarAdm from "./SidebarAdm";
import TabelaFuncionarios from "./TabelaFuncionarios";
import { useUsuario } from "./UsuarioProvider";
import { CAMPO } from "./EstilosCampo";
import { criarPedidoAdm, listarEtapas } from "../lib/pedidosAdm";
import {
  criarUsuario,
  listarUsuarios,
  redefinirSenhaUsuario,
  removerUsuario,
} from "../lib/usuariosAdm";

const DISTANCIA_SIDEBAR = 115;
const ESPACO_TOPO = 30;
const LARGURA_CONTEUDO = 709;
const ESPACO_BLOCOS = 32;
const ESPACO_CAMPOS = 16;

const CAMPO_FUNCIONARIO = { ...CAMPO, maxWidth: "none" };
const TEXTO_APOIO = {
  fontSize: { xs: 14, md: 15 },
  fontWeight: 300,
  color: "primary.dark",
};
const ERRO = { fontSize: 13, color: "error.main" };

export default function PainelFuncionarios() {
  const router = useRouter();
  const usuario = useUsuario();
  const ehAdministrador = usuario?.perfil === "ADMINISTRADOR";

  const [usuarios, setUsuarios] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [erroForm, setErroForm] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [redefinindo, setRedefinindo] = useState(null);
  const [exclusao, setExclusao] = useState(null);
  const [exclusaoOcupada, setExclusaoOcupada] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");
  const [novoPedidoAberto, setNovoPedidoAberto] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [lista, listaEtapas] = await Promise.all([
        listarUsuarios(),
        listarEtapas(),
      ]);
      setUsuarios(lista);
      setEtapas(listaEtapas);
      setErroLista("");
    } catch (falha) {
      setErroLista(falha.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (ehAdministrador) carregar();
    else setCarregando(false);
  }, [carregar, ehAdministrador]);

  function irParaFiltro(valor) {
    router.push(
      valor === "TODOS" ? "/dashboard" : `/dashboard?filtro=${valor}`,
    );
  }

  async function cadastrarPedido(dados) {
    await criarPedidoAdm(dados);
    setNovoPedidoAberto(false);
    router.push("/dashboard");
  }

  function atualizarCampo(campo) {
    return (event) => {
      setForm((atual) => ({ ...atual, [campo]: event.target.value }));
      if (erroForm) setErroForm("");
    };
  }

  async function adicionar(event) {
    event.preventDefault();
    if (enviando) return;

    const nome = form.nome.trim();
    const email = form.email.trim().toLowerCase();

    if (nome.length < 2) return setErroForm("Informe o nome do funcionário.");
    if (!email) return setErroForm("Informe o e-mail.");
    if (form.senha.length < 6)
      return setErroForm("A senha deve ter ao menos 6 caracteres.");

    setEnviando(true);
    setErroForm("");

    try {
      await criarUsuario({ nome, email, senha: form.senha });
      setForm({ nome: "", email: "", senha: "" });
      await carregar();
    } catch (falha) {
      setErroForm(falha.message);
    } finally {
      setEnviando(false);
    }
  }

  async function redefinirSenha(id, senha) {
    await redefinirSenhaUsuario(id, senha);
    setRedefinindo(null);
  }

  function pedirExclusao(alvo, ancora) {
    setErroExclusao("");
    setExclusao({ usuario: alvo, ancora });
  }

  async function confirmarExclusao() {
    if (!exclusao || exclusaoOcupada) return;

    setExclusaoOcupada(true);
    setErroExclusao("");
    try {
      await removerUsuario(exclusao.usuario.id);
      setExclusao(null);
      await carregar();
    } catch (falha) {
      setErroExclusao(falha.message);
    } finally {
      setExclusaoOcupada(false);
    }
  }

  function cancelarExclusao() {
    setExclusao(null);
    setErroExclusao("");
  }

  return (
    <>
      <SidebarAdm
        filtro={null}
        onFiltro={irParaFiltro}
        onNovoPedido={() => setNovoPedidoAberto(true)}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          pl: { xs: 3, md: `${DISTANCIA_SIDEBAR}px` },
          pr: 3,
          pt: { xs: 4, md: `${ESPACO_TOPO}px` },
          pb: 8,
        }}
      >
        <Label>área do admin</Label>
        <SectionTitle component="h1" sx={{ mb: `${ESPACO_BLOCOS}px` }}>
          Funcionários cadastrados
        </SectionTitle>

        {!ehAdministrador ? (
          <Typography sx={TEXTO_APOIO}>
            Esta área é restrita ao administrador.
          </Typography>
        ) : (
          <Box sx={{ width: "100%", maxWidth: LARGURA_CONTEUDO }}>
            <Label>adicionar funcionário</Label>

            <Box
              component="form"
              onSubmit={adicionar}
              noValidate
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: `${ESPACO_CAMPOS}px`,
              }}
            >
              <Box
                component="input"
                type="text"
                value={form.nome}
                onChange={atualizarCampo("nome")}
                placeholder="Nome"
                aria-label="Nome"
                maxLength={120}
                autoComplete="off"
                sx={CAMPO_FUNCIONARIO}
              />

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: `${ESPACO_CAMPOS}px`,
                }}
              >
                <Box
                  component="input"
                  type="email"
                  value={form.email}
                  onChange={atualizarCampo("email")}
                  placeholder="Email"
                  aria-label="Email"
                  maxLength={254}
                  autoComplete="off"
                  sx={{ ...CAMPO_FUNCIONARIO, flex: 1, minWidth: 200 }}
                />

                <Box
                  component="input"
                  type="password"
                  value={form.senha}
                  onChange={atualizarCampo("senha")}
                  placeholder="Senha"
                  aria-label="Senha"
                  maxLength={128}
                  autoComplete="new-password"
                  sx={{ ...CAMPO_FUNCIONARIO, flex: 1, minWidth: 200 }}
                />

                <BotaoAcao type="submit" disabled={enviando}>
                  {enviando ? "Adicionando..." : "Adicionar"}
                </BotaoAcao>
              </Box>

              {erroForm && (
                <Typography role="alert" sx={ERRO}>
                  {erroForm}
                </Typography>
              )}
            </Box>

            <Box sx={{ mt: `${ESPACO_CAMPOS}px` }}>
              {erroLista && (
                <Typography role="alert" sx={{ ...ERRO, mb: 2 }}>
                  {erroLista}
                </Typography>
              )}

              {carregando ? (
                <Typography sx={TEXTO_APOIO}>
                  Carregando funcionários...
                </Typography>
              ) : (
                <TabelaFuncionarios
                  usuarios={usuarios}
                  usuarioAtualId={usuario?.id}
                  onRedefinirSenha={setRedefinindo}
                  onRemover={pedirExclusao}
                />
              )}
            </Box>
          </Box>
        )}
      </Box>

      <FormularioRedefinirSenha
        usuario={redefinindo}
        onFechar={() => setRedefinindo(null)}
        onRedefinir={redefinirSenha}
      />

      <PopupConfirmacao
        ancora={exclusao?.ancora ?? null}
        titulo={`Excluir ${exclusao?.usuario.nome ?? ""}?`}
        descricao="O funcionário perderá o acesso à área administrativa. Esta ação não pode ser desfeita."
        textoConfirmar="Excluir"
        textoOcupado="Excluindo..."
        ocupado={exclusaoOcupada}
        erro={erroExclusao}
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
      />

      <FormularioNovoPedido
        aberto={novoPedidoAberto}
        etapas={etapas}
        onFechar={() => setNovoPedidoAberto(false)}
        onCadastrar={cadastrarPedido}
      />
    </>
  );
}
