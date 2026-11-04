import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function Botao({ texto, onPress, variante = 'principal', estilo, desativado }) {
  const tema = useTheme();
  const superficie = variante === 'principal' ? tema.pilula : tema.controle;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!desativado }}
      disabled={desativado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.botao,
        { backgroundColor: superficie.fundo, opacity: desativado ? 0.5 : pressed ? 0.75 : 1 },
        estilo,
      ]}
    >
      <Text style={[estilos.texto, { color: superficie.texto }]}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
  },
  texto: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
});
