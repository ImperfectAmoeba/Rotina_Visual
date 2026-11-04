import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

// Caixa de seleção grande, usada em "Feito", dias da semana e substituições.
export default function Marcador({ marcado, onPress, rotulo, tamanho = 56 }) {
  const tema = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={rotulo}
      accessibilityState={{ checked: marcado }}
      hitSlop={4}
      onPress={onPress}
      style={[
        estilos.marcador,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 3.5,
          backgroundColor: marcado ? tema.pilula.fundo : tema.cartao.fundo,
          borderColor: tema.borda,
        },
      ]}
    >
      {marcado ? <MaterialCommunityIcons name="check-bold" size={tamanho * 0.65} color={tema.pilula.texto} /> : null}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  marcador: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
});
