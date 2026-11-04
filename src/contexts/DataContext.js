import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { criarPictogramasPadrao } from '../data/pictogramasPadrao';
import { dadosIniciais, normalizarDados } from '../domain/arquivo';
import { ArmazenamentoCheioError, carregarDados, salvarDados } from '../services/armazenamento';
import { limparImagensSemUso } from '../services/imagens';

const DataContext = createContext(null);

export const mensagemDeErro = (erro) =>
  erro instanceof ArmazenamentoCheioError
    ? 'Armazenamento cheio, libere espaço e tente novamente.'
    : 'Não foi possível concluir. Tente novamente.';

export const DataProvider = ({ children }) => {
  const [dados, setDados] = useState(null);
  const [rotinaTocadaId, setRotinaTocadaId] = useState(null);
  const dadosRef = useRef(null);

  useEffect(() => {
    (async () => {
      const salvos = await carregarDados().catch(() => null);
      const iniciais = salvos
        ? normalizarDados(salvos, criarPictogramasPadrao())
        : dadosIniciais(criarPictogramasPadrao());
      dadosRef.current = iniciais;
      setDados(iniciais);
      try {
        limparImagensSemUso(iniciais);
      } catch {
        // A limpeza é só uma economia de espaço: uma falha não impede o uso do app.
      }
    })();
  }, []);

  // A tela só muda depois de gravar: se faltar espaço, o usuário continua onde estava (UC04, E1).
  const atualizar = useCallback((transformar) => {
    try {
      const proximos = transformar(dadosRef.current);
      salvarDados(proximos);
      dadosRef.current = proximos;
      setDados(proximos);
      return { ok: true };
    } catch (erro) {
      return { ok: false, mensagem: mensagemDeErro(erro) };
    }
  }, []);

  const valor = useMemo(
    () => ({ dados, atualizar, rotinaTocadaId, setRotinaTocadaId }),
    [dados, atualizar, rotinaTocadaId],
  );

  return <DataContext.Provider value={valor}>{children}</DataContext.Provider>;
};

export const useDados = () => useContext(DataContext);
