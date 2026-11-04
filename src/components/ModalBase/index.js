import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useTimer } from '../../contexts/TimerContext';

// Janela sobreposta. Tocar fora ou usar o "voltar" do aparelho fecha sem salvar (UC01 A2, UC02 A2).
export default function ModalBase({ titulo, aoFechar, children, acimaDeTudo }) {
  const tema = useTheme();
  const insets = useSafeAreaInsets();
  const { suspender } = useTimer();

  useEffect(() => suspender(), [suspender]);

  useEffect(() => {
    const assinatura = BackHandler.addEventListener('hardwareBackPress', () => {
      aoFechar();
      return true;
    });
    return () => assinatura.remove();
  }, [aoFechar]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[estilos.camada, acimaDeTudo && estilos.acimaDeTudo]}
    >
      <Pressable
        accessibilityLabel="Fechar janela"
        onPress={aoFechar}
        style={[StyleSheet.absoluteFill, { backgroundColor: tema.veu }]}
      />
      <View
        accessibilityViewIsModal
        style={[
          estilos.janela,
          { backgroundColor: tema.cartao.fundo, marginTop: insets.top + 16, marginBottom: insets.bottom + 16 },
        ]}
      >
        <View style={estilos.topo}>
          <View style={estilos.lateral} />
          <Text accessibilityRole="header" style={[estilos.titulo, { color: tema.cartao.texto }]}>
            {titulo}
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={aoFechar} hitSlop={12} style={estilos.lateral}>
            <MaterialCommunityIcons name="close" size={28} color={tema.cartao.texto} />
          </Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={estilos.conteudo}>
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  camada: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
    elevation: 24,
  },
  acimaDeTudo: { zIndex: 200, elevation: 48 },
  janela: { borderRadius: 28, maxHeight: '100%', overflow: 'hidden' },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  lateral: { width: 36, alignItems: 'flex-end' },
  titulo: { flex: 1, fontSize: 19, fontWeight: '700', textAlign: 'center', textTransform: 'uppercase' },
  conteudo: { paddingHorizontal: 20, paddingBottom: 20 },
});
