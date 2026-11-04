import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

export default function Cabecalho({ voltar }) {
  const tema = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const cor = tema.cabecalho.texto;

  return (
    <View style={[estilos.cabecalho, { backgroundColor: tema.cabecalho.fundo, paddingTop: insets.top + 12 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Configurações"
        onPress={() => navigation.navigate('Configuracoes')}
        hitSlop={8}
        style={estilos.acao}
      >
        <MaterialCommunityIcons name="cog" size={34} color={cor} />
      </Pressable>
      <Text accessibilityRole="header" style={[estilos.titulo, { color: cor }]}>
        ROTINA VISUAL
      </Text>
      {voltar ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={estilos.acao}
        >
          <MaterialCommunityIcons name="arrow-left" size={32} color={cor} />
        </Pressable>
      ) : (
        <View style={estilos.acao} />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  acao: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  titulo: { flex: 1, fontSize: 24, fontWeight: '800', textAlign: 'center' },
});
