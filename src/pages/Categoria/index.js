import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BotaoIcone from '../../components/BotaoIcone';
import Cabecalho from '../../components/Cabecalho';
import ImagemSegura from '../../components/ImagemSegura';
import ModalPictograma from '../../components/ModalPictograma';
import Rodape from '../../components/Rodape';
import { useDados } from '../../contexts/DataContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';
import { fraseCompleta, listarCategorias } from '../../domain/pictogramas';
import { falar } from '../../services/voz';

function Fala({ texto, cor }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvir: ${texto}`}
      onPress={() => falar(texto)}
      style={estilos.fala}
    >
      <Text style={[estilos.textoFala, { color: cor }]}>{texto.toUpperCase()}</Text>
      <MaterialCommunityIcons name="volume-high" size={24} color={cor} />
    </Pressable>
  );
}

// Pictogramas de uma categoria. Tocar fala a frase completa (RF010); tocar e segurar
// seleciona o pictograma para editar ou excluir (RF012, RF013).
export default function Categoria({ navigation, route }) {
  const tema = useTheme();
  const insets = useSafeAreaInsets();
  const { dados, atualizar } = useDados();
  const { confirmar, mostrarMensagem } = useFeedback();
  const [selecionadoId, setSelecionadoId] = useState(null);
  const [formulario, setFormulario] = useState(null);

  const { categoria } = route.params;
  const categorias = useMemo(() => listarCategorias(dados.pictogramas), [dados.pictogramas]);
  const pictogramas = useMemo(
    () => dados.pictogramas.filter((p) => p.categoria === categoria),
    [dados.pictogramas, categoria],
  );
  const selecionado = pictogramas.find((p) => p.id === selecionadoId);

  const excluir = async () => {
    const sim = await confirmar({
      titulo: 'Excluir pictograma',
      mensagem: `Tem certeza que deseja excluir "${selecionado.nome}"?`,
    });
    if (!sim) return;
    const resultado = atualizar((d) => ({
      ...d,
      pictogramas: d.pictogramas.filter((p) => p.id !== selecionado.id),
    }));
    if (resultado.ok) {
      setSelecionadoId(null);
      mostrarMensagem('Pictograma excluído.');
    } else {
      mostrarMensagem(resultado.mensagem, 'erro');
    }
  };

  return (
    <View style={[estilos.tela, { backgroundColor: tema.fundo.fundo }]}>
      <Cabecalho voltar />
      <View style={estilos.corpo}>
        <ScrollView
          style={[estilos.trilhoRolagem, { backgroundColor: tema.cabecalho.fundo }]}
          contentContainerStyle={estilos.trilho}
        >
          {categorias.map((c) => {
            const ativa = c.nome === categoria;
            return (
              <Pressable
                key={c.nome}
                accessibilityRole="button"
                accessibilityLabel={c.nome}
                accessibilityState={{ selected: ativa }}
                onPress={() => {
                  setSelecionadoId(null);
                  navigation.setParams({ categoria: c.nome });
                }}
                style={estilos.itemTrilho}
              >
                <View style={[estilos.molduraTrilho, ativa && { borderColor: tema.cabecalho.texto }]}>
                  <ImagemSegura imagem={c.imagem} tamanho={78} raio={14} />
                </View>
                <Text numberOfLines={2} style={[estilos.nomeTrilho, { color: tema.cabecalho.texto }]}>
                  {c.nome.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={estilos.conteudo}>
          <View style={[estilos.titulo, { backgroundColor: tema.cabecalho.fundo }]}>
            <Text numberOfLines={2} accessibilityRole="header" style={[estilos.textoTitulo, { color: tema.cabecalho.texto }]}>
              {categoria.toUpperCase()}
            </Text>
          </View>
          <FlatList
            data={pictogramas}
            keyExtractor={(p) => p.id}
            contentContainerStyle={estilos.lista}
            renderItem={({ item }) => {
              const frase = fraseCompleta(item);
              const ativo = item.id === selecionadoId;
              const superficie = ativo ? tema.mudanca : tema.fundo;
              return (
                <View style={[estilos.pictograma, { backgroundColor: superficie.fundo }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={frase ?? item.nome}
                    accessibilityHint="Toque para ouvir. Toque e segure para editar ou excluir."
                    onPress={() => (selecionadoId ? setSelecionadoId(null) : falar(frase ?? item.nome))}
                    onLongPress={() => setSelecionadoId(item.id)}
                  >
                    <ImagemSegura imagem={item.imagem} tamanho={136} raio={20} />
                  </Pressable>
                  <Fala texto={item.nome} cor={superficie.texto} />
                  {frase ? <Fala texto={frase} cor={superficie.texto} /> : null}
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={[estilos.vazio, { color: tema.fundo.texto }]}>
                Nenhum pictograma nesta categoria.
              </Text>
            }
          />
        </View>
      </View>

      {selecionado ? (
        <View style={[estilos.barraAcoes, { backgroundColor: tema.mudanca.fundo, paddingBottom: insets.bottom + 12 }]}>
          <BotaoIcone
            icone="pencil"
            rotulo={`Editar ${selecionado.nome}`}
            superficie={tema.pilulaMudanca}
            onPress={() => setFormulario({ pictograma: selecionado })}
          />
          <BotaoIcone
            icone="trash-can-outline"
            rotulo={`Excluir ${selecionado.nome}`}
            superficie={tema.pilulaMudanca}
            onPress={excluir}
          />
        </View>
      ) : (
        <Rodape
          pictogramasDesativado
          centro={{
            icone: 'image-plus',
            rotulo: 'Novo pictograma',
            onPress: () => setFormulario({ pictograma: null }),
          }}
        />
      )}

      {formulario ? (
        <ModalPictograma
          pictograma={formulario.pictograma}
          categoriaInicial={categoria}
          aoFechar={() => {
            setFormulario(null);
            setSelecionadoId(null);
          }}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  corpo: { flex: 1, flexDirection: 'row' },
  trilhoRolagem: { flexGrow: 0, width: 116 },
  trilho: { paddingVertical: 12, alignItems: 'center', gap: 12 },
  itemTrilho: { width: 112, alignItems: 'center' },
  molduraTrilho: { borderWidth: 3, borderColor: 'transparent', borderRadius: 18 },
  nomeTrilho: { fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 2, paddingHorizontal: 4 },
  conteudo: { flex: 1 },
  titulo: {
    marginTop: 12,
    marginRight: 16,
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderTopRightRadius: 27,
    borderBottomRightRadius: 27,
  },
  textoTitulo: { fontSize: 20, fontWeight: '700' },
  lista: { paddingVertical: 8, flexGrow: 1 },
  pictograma: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6 },
  fala: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  textoFala: { flexShrink: 1, fontSize: 17, textAlign: 'center' },
  vazio: { fontSize: 17, lineHeight: 24, textAlign: 'center', margin: 20 },
  barraAcoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
});
