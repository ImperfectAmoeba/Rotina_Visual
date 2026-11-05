import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useDados } from '../../contexts/DataContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import {
  configurarNotificacoes,
  ouvirLembretes,
  pedirPermissao,
  reagendarLembretes,
} from '../../services/notificacoes';

// Consentimento na primeira abertura e agenda de lembretes (RF015). Não desenha nada.
export default function Inicializacao() {
  const { dados, atualizar } = useDados();
  const { avisar, confirmar } = useFeedback();
  const { rotinas, configuracoes } = dados;
  const { notificacaoAtiva, notificacaoPerguntada, lembreteMinutos } = configuracoes;

  useEffect(() => {
    configurarNotificacoes().catch(() => {});
    return ouvirLembretes(avisar);
  }, [avisar]);

  useEffect(() => {
    if (notificacaoPerguntada) return;
    (async () => {
      const aceitou = await confirmar({
        titulo: 'Lembretes',
        mensagem: 'Deseja receber um aviso quando cada atividade começar e um lembrete 5 minutos antes do fim?',
      });
      const permitido = aceitou ? await pedirPermissao() : false;
      atualizar((d) => ({
        ...d,
        configuracoes: { ...d.configuracoes, notificacaoPerguntada: true, notificacaoAtiva: permitido },
      }));
    })();
  }, [notificacaoPerguntada, confirmar, atualizar]);

  useEffect(() => {
    const reagendar = () =>
      reagendarLembretes(rotinas, { notificacaoAtiva, lembreteMinutos }).catch(() => {});
    reagendar();
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') reagendar();
    });
    return () => assinatura.remove();
  }, [rotinas, notificacaoAtiva, lembreteMinutos]);

  return null;
}
