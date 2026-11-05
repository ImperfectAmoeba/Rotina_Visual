import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import BotaoIcone from '../BotaoIcone';

// Toma o lugar do rodapé enquanto um item está selecionado (tocar e segurar).
export default function BarraAcoes({ nome, aoEditar, aoExcluir }) {
  const tema = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[estilos.barra, { backgroundColor: tema.mudanca.fundo, paddingBottom: insets.bottom + 12 }]}>
      <BotaoIcone icone="pencil" rotulo={`Editar ${nome}`} superficie={tema.pilulaMudanca} onPress={aoEditar} />
      <BotaoIcone
        icone="trash-can-outline"
        rotulo={`Excluir ${nome}`}
        superficie={tema.pilulaMudanca}
        onPress={aoExcluir}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
});
