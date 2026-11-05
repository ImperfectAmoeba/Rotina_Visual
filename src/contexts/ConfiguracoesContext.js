import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Configuracoes from '../pages/Configuracoes';

const ConfiguracoesContext = createContext(null);

// O painel é uma camada acima da navegação: abre igual em qualquer tela, sem depender da pilha.
export const ConfiguracoesProvider = ({ children }) => {
  const [aberto, setAberto] = useState(false);
  const abrirConfiguracoes = useCallback(() => setAberto(true), []);
  const fechar = useCallback(() => setAberto(false), []);
  const valor = useMemo(() => ({ abrirConfiguracoes }), [abrirConfiguracoes]);

  return (
    <ConfiguracoesContext.Provider value={valor}>
      {children}
      {aberto ? <Configuracoes aoFechar={fechar} /> : null}
    </ConfiguracoesContext.Provider>
  );
};

export const useConfiguracoes = () => useContext(ConfiguracoesContext);
