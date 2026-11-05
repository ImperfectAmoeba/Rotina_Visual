// Avisos de início e de proximidade do fim de uma atividade (RF015). Com o app aberto, a
// notificação não aparece na barra do sistema: vira um aviso com botão "OK" dentro do app.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { dataParaChave } from '../domain/datas';
import { proximosLembretes } from '../domain/rotinas';

const CANAL = 'lembretes';
const suportado = Platform.OS !== 'web';

export const configurarNotificacoes = async () => {
  if (!suportado) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Lembretes de atividades',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
};

export const pedirPermissao = async () => {
  if (!suportado) return false;
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
};

export const ouvirLembretes = (aoReceber) => {
  if (!suportado) return () => {};
  const assinatura = Notifications.addNotificationReceivedListener((notificacao) => {
    const { title, body } = notificacao.request.content;
    aoReceber({ titulo: title, mensagem: body });
  });
  return () => assinatura.remove();
};

// Refaz a agenda a partir dos dados atuais. Sem permissão ou desativado, só limpa.
export const reagendarLembretes = async (rotinas, { notificacaoAtiva, lembreteMinutos }) => {
  if (!suportado) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!notificacaoAtiva) return;
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  const agora = new Date();
  const lembretes = proximosLembretes(rotinas, dataParaChave(agora), agora, lembreteMinutos);
  const unidade = lembreteMinutos === 1 ? 'minuto' : 'minutos';
  await Promise.all(
    lembretes.map(({ tipo, quando, nome }) =>
      Notifications.scheduleNotificationAsync({
        content:
          tipo === 'inicio'
            ? { title: 'Nova atividade', body: `${nome} começa agora.` }
            : {
                title: 'Atividade perto do fim',
                body: `${nome} termina em ${lembreteMinutos} ${unidade}.`,
              },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: quando,
          channelId: CANAL,
        },
      }),
    ),
  );
};
