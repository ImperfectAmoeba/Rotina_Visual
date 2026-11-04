import { useFocusEffect } from '@react-navigation/native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { dataParaChave, minutosDoDia } from '../domain/datas';
import { atividadeAtual } from '../domain/rotinas';
import { useDados } from './DataContext';

const TimerContext = createContext(null);
const INTERVALO_MS = 5000;

const lerRelogio = () => {
  const agora = new Date();
  return { hoje: dataParaChave(agora), minutos: minutosDoDia(agora) };
};

// Controla a atividade em andamento e a exibição do timer visual (RF009): ele abre sozinho uma
// vez por atividade, pode ser minimizado e volta ao tocar na atividade atual. Formulários e
// janelas abertas suspendem a abertura automática para não interromper o que está sendo feito.
export const TimerProvider = ({ children }) => {
  const { dados } = useDados();
  const [relogio, setRelogio] = useState(lerRelogio);
  const [aberto, setAberto] = useState(false);
  const [suspensoes, setSuspensoes] = useState(0);
  const jaExibida = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setRelogio((anterior) => {
        const novo = lerRelogio();
        return novo.hoje === anterior.hoje && novo.minutos === anterior.minutos ? anterior : novo;
      });
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, []);

  const atual = useMemo(
    () => atividadeAtual(dados.rotinas, relogio.hoje, relogio.minutos),
    [dados.rotinas, relogio],
  );
  const chaveAtual = atual ? `${atual.id}@${relogio.hoje}` : null;

  useEffect(() => {
    if (!chaveAtual) {
      setAberto(false);
    } else if (suspensoes === 0 && jaExibida.current !== chaveAtual) {
      jaExibida.current = chaveAtual;
      setAberto(true);
    }
  }, [chaveAtual, suspensoes]);

  const suspender = useCallback(() => {
    setSuspensoes((n) => n + 1);
    return () => setSuspensoes((n) => n - 1);
  }, []);

  const valor = useMemo(
    () => ({
      hoje: relogio.hoje,
      atual,
      timerAberto: aberto,
      abrirTimer: () => setAberto(true),
      minimizarTimer: () => setAberto(false),
      suspender,
    }),
    [relogio.hoje, atual, aberto, suspender],
  );

  return <TimerContext.Provider value={valor}>{children}</TimerContext.Provider>;
};

export const useTimer = () => useContext(TimerContext);

// Suspende a abertura automática do timer enquanto a tela estiver em foco.
export const useSuspenderTimerNaTela = () => {
  const { suspender } = useTimer();
  useFocusEffect(useCallback(() => suspender(), [suspender]));
};
