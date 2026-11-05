import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModalCor from '../../components/ModalCor';
import { mensagemDeErro, useDados } from '../../contexts/DataContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTimer } from '../../contexts/TimerContext';
import { CORES_SUGERIDAS } from '../../domain/cores';
import {
  baixarRotinas,
  compartilharRotinas,
  escolherArquivoImportacao,
  prepararImportacao,
} from '../../services/compartilhamento';
import { pedirPermissao } from '../../services/notificacoes';

const MINUTOS_MIN = 1;
const MINUTOS_MAX = 60;
const DURACAO_ANIMACAO_MS = 220;

// Painel lateral de configurações, aberto sobre qualquer tela. No modo de visualização, lembretes
// ficam bloqueados e dados não aparecem; tema e cor continuam disponíveis para o dependente.
export default function Configuracoes({ aoFechar }) {
  const tema = useTheme();
  const insets = useSafeAreaInsets();
  const { width: larguraTela } = useWindowDimensions();
  const { dados, atualizar } = useDados();
  const { confirmar, mostrarMensagem } = useFeedback();
  const { suspender } = useTimer();
  const progresso = useRef(new Animated.Value(0)).current;

  const animar = useCallback(
    (destino, aoTerminar) =>
      Animated.timing(progresso, {
        toValue: destino,
        duration: DURACAO_ANIMACAO_MS,
        useNativeDriver: true,
      }).start(aoTerminar),
    [progresso],
  );
  const fechar = useCallback(() => animar(0, aoFechar), [animar, aoFechar]);

  useEffect(() => suspender(), [suspender]);
  useEffect(() => animar(1), [animar]);

  useEffect(() => {
    const assinatura = BackHandler.addEventListener('hardwareBackPress', () => {
      fechar();
      return true;
    });
    return () => assinatura.remove();
  }, [fechar]);

  const { configuracoes, modo } = dados;
  const edicao = modo === 'edicao';
  const painel = tema.cabecalho;
  const [minutos, setMinutos] = useState(String(configuracoes.lembreteMinutos));
  const [seletorAberto, setSeletorAberto] = useState(false);

  const alterar = (campos) => {
    const resultado = atualizar((d) => ({ ...d, configuracoes: { ...d.configuracoes, ...campos } }));
    if (!resultado.ok) mostrarMensagem(resultado.mensagem, 'erro');
    return resultado.ok;
  };

  const alternarLembrete = async (ligar) => {
    if (!ligar) {
      alterar({ notificacaoAtiva: false });
      return;
    }
    if (await pedirPermissao()) alterar({ notificacaoAtiva: true, notificacaoPerguntada: true });
    else mostrarMensagem('Permita as notificações nas configurações do aparelho.', 'erro');
  };

  const minutosValidos = (texto) => {
    const valor = Number(texto);
    return texto !== '' && valor >= MINUTOS_MIN && valor <= MINUTOS_MAX;
  };

  // Salva ao digitar: o painel pode ser fechado sem o campo perder o foco antes.
  const digitarMinutos = (texto) => {
    const digitos = texto.replace(/\D/g, '');
    setMinutos(digitos);
    if (minutosValidos(digitos)) alterar({ lembreteMinutos: Number(digitos) });
  };

  const conferirMinutos = () => {
    if (minutosValidos(minutos)) return;
    setMinutos(String(configuracoes.lembreteMinutos));
    mostrarMensagem(`Escolha de ${MINUTOS_MIN} a ${MINUTOS_MAX} minutos.`, 'erro');
  };

  const compartilhar = async () => {
    try {
      await compartilharRotinas(dados);
    } catch (erro) {
      mostrarMensagem(mensagemDeErro(erro), 'erro');
    }
  };

  const baixar = async () => {
    try {
      if (await baixarRotinas(dados)) mostrarMensagem('Rotina salva no aparelho.');
    } catch (erro) {
      mostrarMensagem(mensagemDeErro(erro), 'erro');
    }
  };

  const importar = async () => {
    try {
      const { cancelado, importado } = await escolherArquivoImportacao();
      if (cancelado) return;
      if (!importado) {
        mostrarMensagem('Este arquivo não é uma rotina válida.', 'erro');
        return;
      }
      const sim = await confirmar({
        titulo: 'Importar rotina',
        mensagem: 'As rotinas e os pictogramas deste aparelho serão substituídos pelos do arquivo. Deseja continuar?',
      });
      if (!sim) return;
      const preparado = await prepararImportacao(importado);
      const resultado = atualizar((d) => ({ ...d, ...preparado, concluidas: {} }));
      if (resultado.ok) mostrarMensagem('Rotina importada.');
      else mostrarMensagem(resultado.mensagem, 'erro');
    } catch (erro) {
      mostrarMensagem(mensagemDeErro(erro), 'erro');
    }
  };

  const textoInterruptor = { true: tema.mudanca.fundo, false: tema.controle.fundo };
  const separador = <View style={[estilos.separador, { backgroundColor: painel.textoSuave }]} />;

  return (
    <View accessibilityViewIsModal style={estilos.camada}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: tema.veu, opacity: progresso }]}
      />
      <Animated.View
        style={[
          estilos.painel,
          {
            backgroundColor: painel.fundo,
            transform: [
              {
                translateX: progresso.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-larguraTela, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[estilos.conteudo, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}
        >
          <View style={estilos.topo}>
            <Text accessibilityRole="header" style={[estilos.titulo, { color: painel.texto }]}>
              Configurações
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12} onPress={fechar}>
              <MaterialCommunityIcons name="close" size={30} color={painel.texto} />
            </Pressable>
          </View>

          {separador}
          <Text style={[estilos.secao, { color: painel.texto }]}>Lembrete</Text>
          {edicao ? (
            <>
              <View style={estilos.linha}>
                <Switch
                  accessibilityLabel="Ativar lembrete"
                  value={configuracoes.notificacaoAtiva}
                  onValueChange={alternarLembrete}
                  trackColor={textoInterruptor}
                  thumbColor={tema.cartao.fundo}
                />
                <TextInput
                  accessibilityLabel="Minutos antes de terminar"
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                  value={minutos}
                  onChangeText={digitarMinutos}
                  onBlur={conferirMinutos}
                  style={[estilos.minutos, { backgroundColor: tema.cartao.fundo, color: tema.cartao.texto }]}
                />
                <Text style={[estilos.descricao, { color: painel.texto }]}>minutos antes de terminar</Text>
              </View>
              <Text style={[estilos.descricao, estilos.notaLembrete, { color: painel.texto }]}>
                Com o lembrete ligado, você também recebe um aviso quando cada atividade começa.
              </Text>
            </>
          ) : (
            <Text style={[estilos.descricao, { color: painel.texto }]}>
              Disponível apenas no modo de edição.
            </Text>
          )}

          {separador}
          <Text style={[estilos.secao, { color: painel.texto }]}>Tema escuro</Text>
          <View style={estilos.linha}>
            <Switch
              accessibilityLabel="Ativar tema escuro"
              value={configuracoes.temaEscuro}
              onValueChange={(temaEscuro) => alterar({ temaEscuro })}
              trackColor={textoInterruptor}
              thumbColor={tema.cartao.fundo}
            />
            <Text style={[estilos.descricao, { color: painel.texto }]}>Cores do aplicativo mais escuras</Text>
          </View>

          {separador}
          <Text style={[estilos.secao, { color: painel.texto }]}>Tema</Text>
          <Text style={[estilos.descricao, { color: painel.texto }]}>Selecione a cor principal do aplicativo</Text>
          <View style={estilos.cores}>
            {CORES_SUGERIDAS.map((cor) => {
              const ativa = cor === configuracoes.corDestaque;
              return (
                <Pressable
                  key={cor}
                  accessibilityRole="radio"
                  accessibilityLabel={`Cor ${cor}`}
                  accessibilityState={{ selected: ativa }}
                  onPress={() => alterar({ corDestaque: cor })}
                  style={[estilos.cor, { backgroundColor: cor, borderColor: ativa ? painel.texto : 'transparent' }]}
                />
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Escolher outra cor"
              onPress={() => setSeletorAberto(true)}
              style={[estilos.cor, { backgroundColor: tema.cartao.fundo, borderColor: 'transparent' }]}
            >
              <MaterialCommunityIcons name="format-color-fill" size={30} color={tema.cartao.texto} />
            </Pressable>
          </View>

          {edicao ? (
            <>
              {separador}
              <Text style={[estilos.secao, { color: painel.texto }]}>Dados</Text>
              <Pressable
                accessibilityRole="button"
                onPress={compartilhar}
                style={[estilos.acao, { backgroundColor: tema.cartao.fundo }]}
              >
                <Text style={[estilos.textoAcao, { color: tema.cartao.texto }]}>Compartilhar rotina</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={baixar}
                style={[estilos.acao, { backgroundColor: tema.cartao.fundo }]}
              >
                <Text style={[estilos.textoAcao, { color: tema.cartao.texto }]}>Baixar rotina</Text>
              </Pressable>
              {Platform.OS === 'android' ? (
                <Text style={[estilos.descricao, estilos.dica, { color: painel.texto }]}>
                  Ao baixar, crie ou escolha uma pasta dentro de Downloads. O Android não permite salvar direto na pasta principal.
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={importar}
                style={[estilos.acao, { backgroundColor: tema.cartao.fundo }]}
              >
                <Text style={[estilos.textoAcao, { color: tema.cartao.texto }]}>Importar rotina</Text>
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </Animated.View>
      <Pressable accessibilityLabel="Fechar configurações" style={estilos.fora} onPress={fechar} />

      {seletorAberto ? (
        <ModalCor
          corInicial={configuracoes.corDestaque}
          aoFechar={() => setSeletorAberto(false)}
          aoSalvar={(corDestaque) => {
            if (alterar({ corDestaque })) setSeletorAberto(false);
          }}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  // Acima do timer (zIndex 100) e abaixo das confirmações e mensagens do FeedbackProvider.
  camada: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 150,
    elevation: 36,
  },
  painel: { width: '86%', maxWidth: 420 },
  fora: { flex: 1 },
  conteudo: { paddingHorizontal: 20 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titulo: { fontSize: 24, fontWeight: '700' },
  separador: { height: 1, marginVertical: 14 },
  secao: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  minutos: { width: 50, height: 46, borderRadius: 10, textAlign: 'center', fontSize: 20 },
  descricao: { flexShrink: 1, fontSize: 16, lineHeight: 22 },
  dica: { marginBottom: 10 },
  notaLembrete: { marginTop: 10 },
  cores: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  cor: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acao: { minHeight: 56, justifyContent: 'center', padding: 12, borderRadius: 10, marginBottom: 10 },
  textoAcao: { fontSize: 17, fontWeight: '600' },
});
