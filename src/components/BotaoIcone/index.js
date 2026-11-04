import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

export default function BotaoIcone({ icone, rotulo, onPress, superficie, tamanho = 56, tamanhoIcone = 28 }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        estilos.botao,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 3.5,
          backgroundColor: superficie.fundo,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <MaterialCommunityIcons name={icone} size={tamanhoIcone} color={superficie.texto} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
  },
});
