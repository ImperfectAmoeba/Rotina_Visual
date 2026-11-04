import { FlatList, StyleSheet, Text, View } from 'react-native';
import Cabecalho from '../../components/Cabecalho';
import Rodape from '../../components/Rodape';
import RotinaItem from '../../components/RotinaItem';
import { useDados } from '../../contexts/DataContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';

// Lista de rotinas: tela inicial do app (RF005).
export default function Home({ navigation }) {
  const tema = useTheme();
  const { dados, atualizar, setRotinaTocadaId } = useDados();
  const { confirmar, mostrarMensagem } = useFeedback();

  const excluir = async (rotina) => {
    const sim = await confirmar({
      titulo: 'Excluir rotina',
      mensagem: `Tem certeza que deseja excluir "${rotina.nome}"?`,
    });
    if (!sim) return;
    const resultado = atualizar((d) => ({ ...d, rotinas: d.rotinas.filter((r) => r.id !== rotina.id) }));
    if (resultado.ok) mostrarMensagem('Rotina excluída.');
    else mostrarMensagem(resultado.mensagem, 'erro');
  };

  return (
    <View style={[estilos.tela, { backgroundColor: tema.fundo.fundo }]}>
      <Cabecalho />
      <FlatList
        data={dados.rotinas}
        keyExtractor={(rotina) => rotina.id}
        contentContainerStyle={estilos.lista}
        renderItem={({ item }) => (
          <RotinaItem
            rotina={item}
            onAbrir={() => {
              setRotinaTocadaId(item.id);
              navigation.navigate('Rotina', { rotinaId: item.id });
            }}
            onEditar={() => navigation.navigate('RotinaForm', { rotinaId: item.id })}
            onExcluir={() => excluir(item)}
          />
        )}
        ListEmptyComponent={
          <Text style={[estilos.vazio, { color: tema.fundo.texto }]}>
            Nenhuma rotina criada ainda. Toque no calendário abaixo para criar a primeira.
          </Text>
        }
      />
      <Rodape
        centro={{
          icone: 'calendar-plus',
          rotulo: 'Nova rotina',
          onPress: () => navigation.navigate('RotinaForm'),
        }}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  lista: { paddingTop: 12, flexGrow: 1 },
  vazio: { fontSize: 18, lineHeight: 26, textAlign: 'center', marginTop: 48, marginHorizontal: 32 },
});
