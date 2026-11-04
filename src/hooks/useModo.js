import { useCallback } from 'react';
import { useDados } from '../contexts/DataContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { aparelhoTemSenha, autenticarComSenha } from '../services/autenticacao';

// Entrada e saída do modo de apenas visualização (RF008). O modo fica salvo: fechar e abrir o app
// não volta para a edição. Em aparelho sem senha não há como proteger a saída, então o responsável
// é avisado ao entrar, e a saída pede apenas uma confirmação, para ninguém ficar preso no modo.
export const useModo = () => {
  const { dados, atualizar } = useDados();
  const { confirmar, mostrarMensagem } = useFeedback();

  const definirModo = useCallback(
    (modo) => {
      const resultado = atualizar((d) => ({ ...d, modo }));
      if (!resultado.ok) mostrarMensagem(resultado.mensagem, 'erro');
    },
    [atualizar, mostrarMensagem],
  );

  const entrarVisualizacao = useCallback(async () => {
    if (!(await aparelhoTemSenha())) {
      const continuar = await confirmar({
        titulo: 'Aparelho sem senha',
        mensagem:
          'Este aparelho não tem senha configurada, então o modo de visualização não ficará protegido. Deseja continuar?',
      });
      if (!continuar) return;
    }
    definirModo('visualizacao');
  }, [confirmar, definirModo]);

  const sairVisualizacao = useCallback(async () => {
    const liberado = (await aparelhoTemSenha())
      ? await autenticarComSenha()
      : await confirmar({ titulo: 'Modo de edição', mensagem: 'Voltar ao modo de edição?' });
    if (liberado) definirModo('edicao');
    else mostrarMensagem('O modo de edição continua bloqueado.', 'erro');
  }, [confirmar, definirModo, mostrarMensagem]);

  return { modo: dados.modo, entrarVisualizacao, sairVisualizacao };
};
