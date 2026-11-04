import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Botao from '../components/Botao';
import ModalBase from '../components/ModalBase';
import { useTheme } from './ThemeContext';

const FeedbackContext = createContext(null);
const DURACAO_MENSAGEM_MS = 3000;

// Confirmação visual de sucesso ou falha (RNF003) e janelas de confirmação.
export const FeedbackProvider = ({ children }) => {
  const tema = useTheme();
  const insets = useSafeAreaInsets();
  const [mensagem, setMensagem] = useState(null);
  const [janelas, setJanelas] = useState([]);
  const temporizador = useRef(null);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const mostrarMensagem = useCallback((texto, tipo = 'sucesso') => {
    clearTimeout(temporizador.current);
    setMensagem({ texto, tipo });
    temporizador.current = setTimeout(() => setMensagem(null), DURACAO_MENSAGEM_MS);
  }, []);

  const abrirJanela = useCallback(
    (janela) =>
      new Promise((resolver) => {
        setJanelas((atuais) => [...atuais, { ...janela, resolver }]);
      }),
    [],
  );

  const confirmar = useCallback(
    ({ titulo, mensagem: texto, sim = 'Sim', nao = 'Não' }) => abrirJanela({ titulo, texto, sim, nao }),
    [abrirJanela],
  );

  const avisar = useCallback(
    ({ titulo, mensagem: texto }) => abrirJanela({ titulo, texto, sim: 'OK', nao: null }),
    [abrirJanela],
  );

  const responder = (resposta) => {
    janelas[0].resolver(resposta);
    setJanelas((atuais) => atuais.slice(1));
  };

  const valor = useMemo(
    () => ({ mostrarMensagem, confirmar, avisar }),
    [mostrarMensagem, confirmar, avisar],
  );
  const janela = janelas[0];
  const superficieMensagem = mensagem?.tipo === 'erro' ? tema.perigo : tema.mudanca;

  return (
    <FeedbackContext.Provider value={valor}>
      {children}
      {janela ? (
        <ModalBase titulo={janela.titulo} aoFechar={() => responder(false)} acimaDeTudo>
          <Text style={[estilos.texto, { color: tema.cartao.texto }]}>{janela.texto}</Text>
          <View style={estilos.botoes}>
            {janela.nao ? (
              <Botao texto={janela.nao} variante="secundario" onPress={() => responder(false)} estilo={estilos.botao} />
            ) : null}
            <Botao texto={janela.sim} onPress={() => responder(true)} estilo={estilos.botao} />
          </View>
        </ModalBase>
      ) : null}
      {mensagem ? (
        <View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[estilos.mensagem, { bottom: insets.bottom + 112, backgroundColor: superficieMensagem.fundo }]}
        >
          <Text style={[estilos.textoMensagem, { color: superficieMensagem.texto }]}>{mensagem.texto}</Text>
        </View>
      ) : null}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => useContext(FeedbackContext);

const estilos = StyleSheet.create({
  texto: { fontSize: 17, lineHeight: 24, textAlign: 'center', marginVertical: 8 },
  botoes: { flexDirection: 'row', gap: 12, marginTop: 16 },
  botao: { flex: 1 },
  mensagem: {
    position: 'absolute',
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 14,
    zIndex: 300,
    elevation: 60,
  },
  textoMensagem: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
