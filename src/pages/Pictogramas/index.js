import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Cabecalho from '../../components/Cabecalho';
import ImagemSegura from '../../components/ImagemSegura';
import ModalPictograma from '../../components/ModalPictograma';
import Rodape from '../../components/Rodape';
import { useDados } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { listarCategorias } from '../../domain/pictogramas';

// Galeria: categorias de contexto para os pictogramas (RF010).
export default function Pictogramas({ navigation }) {
  const tema = useTheme();
  const { dados } = useDados();
  const [novo, setNovo] = useState(false);
  const categorias = useMemo(() => listarCategorias(dados.pictogramas), [dados.pictogramas]);

  return (
    <View style={[estilos.tela, { backgroundColor: tema.fundo.fundo }]}>
      <Cabecalho voltar />
      <FlatList
        data={categorias}
        numColumns={2}
        keyExtractor={(c) => c.nome}
        columnWrapperStyle={estilos.coluna}
        contentContainerStyle={estilos.lista}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.nome}
            onPress={() => navigation.navigate('Categoria', { categoria: item.nome })}
            style={({ pressed }) => [estilos.categoria, { opacity: pressed ? 0.75 : 1 }]}
          >
            <ImagemSegura imagem={item.imagem} tamanho={136} raio={22} />
            <Text numberOfLines={2} style={[estilos.nome, { color: tema.fundo.texto }]}>
              {item.nome}
            </Text>
          </Pressable>
        )}
      />
      <Rodape
        pictogramasDesativado
        centro={{ icone: 'image-plus', rotulo: 'Novo pictograma', onPress: () => setNovo(true) }}
      />
      {novo ? <ModalPictograma aoFechar={() => setNovo(false)} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  lista: { paddingVertical: 20, paddingHorizontal: 16, gap: 20 },
  coluna: { gap: 16 },
  categoria: { flex: 1, alignItems: 'center', maxWidth: '50%' },
  nome: { fontSize: 18, fontWeight: '700', marginTop: 6, textAlign: 'center' },
});
