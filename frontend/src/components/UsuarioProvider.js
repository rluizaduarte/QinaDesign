"use client";

import { createContext, useContext } from "react";

const UsuarioContext = createContext(null);

export default function UsuarioProvider({ usuario, children }) {
  return (
    <UsuarioContext.Provider value={usuario}>
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuario() {
  return useContext(UsuarioContext);
}
