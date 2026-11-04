import { useMemo } from 'react';
import { criarTema } from '../domain/cores';
import { useDados } from './DataContext';

// O tema é derivado da cor de destaque e do modo escuro salvos nas configurações (RF017, RF018).
export const useTheme = () => {
  const { dados } = useDados();
  const { corDestaque, temaEscuro } = dados.configuracoes;
  return useMemo(() => criarTema(corDestaque, temaEscuro), [corDestaque, temaEscuro]);
};
