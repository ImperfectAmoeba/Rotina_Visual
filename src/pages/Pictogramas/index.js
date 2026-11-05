import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import BarraAcoes from '../../components/BarraAcoes';
import Cabecalho from '../../components/Cabecalho';
import ImagemSegura from '../../components/ImagemSegura';
import ModalCategoria from '../../components/ModalCategoria';
import ModalPictograma from '../../components/ModalPictograma';
import Rodape from '../../components/Rodape';
import { useDados } from '../../contexts/DataContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';
import { excluirCategoria } from '../../domain/pictogramas';

// Galeria: grupos de contexto para os pictogramas (RF010). Tocar abre o grupo; tocar e segurar
// seleciona o grupo para editar ou excluir.
export default function Pictogramas({ navigation }) {
  const tema = useTheme();
  const { dados, atualizar } = useDados();
  const { confirmar, mostrarMensagem } = useFeedback();
  const [novo, setNovo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [selecionadaNome, setSelecionadaNome] = useState(null);

  const selecionada = dados.categorias.find((c) => c.nome === selecionadaNome);

  const excluir = async () => {
    const { nome } = selecionada;
    const quantidade = dados.pictogramas.filter((p) => p.categoria === nome).length;
    const conteudo = {
      0: 'O grupo está vazio.',
      1: 'O único pictograma do grupo também será excluído.',
    }[quantidade] ?? `Os ${quantidade} pictogramas do grupo também serão excluídos.`;
    const sim = await confirmar({
      titulo: 'Excluir grupo',
      mensagem: `Tem certeza que deseja excluir "${nome}"? ${conteudo}`,
    });
    if (!sim) return;
    const resultado = atualizar((d) => excluirCategoria(d, nome));
    if (resultado.ok) {
      setSelecionadaNome(null);
      mostrarMensagem('Grupo excluído.');
    } else {
      mostrarMensagem(resultado.mensagem, 'erro');
    }
  };

  return (
    <View style={[estilos.tela, { backgroundColor: tema.fundo.fundo }]}>
      <Cabecalho voltar />
      <FlatList
        data={dados.categorias}
        extraData={selecionadaNome}
        numColumns={2}
        keyExtractor={(c) => c.nome}
        columnWrapperStyle={estilos.coluna}
        contentContainerStyle={estilos.lista}
        renderItem={({ item }) => {
          const superficie = item.nome === selecionadaNome ? tema.mudanca : tema.fundo;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.nome}
              accessibilityHint="Toque para abrir. Toque e segure para editar ou excluir."
              onPress={() =>
                selecionadaNome
                  ? setSelecionadaNome(null)
                  : navigation.navigate('Categoria', { categoria: item.nome })
              }
              onLongPress={() => setSelecionadaNome(item.nome)}
              style={({ pressed }) => [
                estilos.categoria,
                { backgroundColor: superficie.fundo, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <ImagemSegura imagem={item.imagem} tamanho={136} raio={22} />
              <Text numberOfLines={2} style={[estilos.nome, { color: superficie.texto }]}>
                {item.nome}
              </Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={[estilos.vazio, { color: tema.fundo.texto }]}>
            Nenhum grupo de pictogramas. Crie um novo pictograma para começar.
          </Text>
        }
      />
      {selecionada ? (
        <BarraAcoes nome={selecionada.nome} aoEditar={() => setEditando(true)} aoExcluir={excluir} />
      ) : (
        <Rodape
          pictogramasDesativado
          verRotinaLiberado
          centro={{ icone: 'image-plus', rotulo: 'Novo pictograma', onPress: () => setNovo(true) }}
        />
      )}
      {novo ? <ModalPictograma aoFechar={() => setNovo(false)} /> : null}
      {editando && selecionada ? (
        <ModalCategoria
          categoria={selecionada}
          aoFechar={() => {
            setEditando(false);
            setSelecionadaNome(null);
          }}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  lista: { paddingVertical: 20, paddingHorizontal: 16, gap: 20 },
  coluna: { gap: 16 },
  categoria: { flex: 1, alignItems: 'center', maxWidth: '50%', borderRadius: 22, paddingVertical: 8 },
  nome: { fontSize: 18, fontWeight: '700', marginTop: 6, textAlign: 'center' },
  vazio: { fontSize: 17, lineHeight: 24, textAlign: 'center', margin: 20 },
});
