import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { mensagemDeErro, useDados } from '../../contexts/DataContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';
import { validarCategoria, validarPictograma } from '../../domain/pictogramas';
import { criarId } from '../../domain/rotinas';
import { escolherImagem } from '../../services/imagens';
import Botao from '../Botao';
import ImagemSegura from '../ImagemSegura';
import ModalBase from '../ModalBase';

// Criação (RF011) e edição (RF013) de pictograma. "pictograma" nulo significa criação.
export default function ModalPictograma({ pictograma, categoriaInicial, aoFechar }) {
  const tema = useTheme();
  const { dados, atualizar } = useDados();
  const { mostrarMensagem } = useFeedback();
  const cor = tema.cartao.texto;

  const [nome, setNome] = useState(pictograma?.nome ?? '');
  const [imagem, setImagem] = useState(pictograma?.imagem ?? null);
  const [frase, setFrase] = useState(pictograma?.frase ?? '');
  const [categoria, setCategoria] = useState(pictograma?.categoria ?? categoriaInicial ?? '');
  const [personalizado, setPersonalizado] = useState(false);
  const [capa, setCapa] = useState(null);
  const [erro, setErro] = useState(null);

  const importarPara = async (definir) => {
    try {
      const escolhida = await escolherImagem();
      if (escolhida) definir(escolhida);
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  };

  const salvar = () => {
    const novo = {
      id: pictograma?.id ?? criarId(),
      nome: nome.trim(),
      frase: frase.trim(),
      categoria: categoria.trim(),
      imagem,
    };
    const novaCategoria = personalizado ? { nome: novo.categoria, imagem: capa } : null;
    const invalido =
      validarPictograma(novo) ?? (novaCategoria && validarCategoria(novaCategoria, dados.categorias));
    if (invalido) {
      setErro(invalido);
      return;
    }
    const resultado = atualizar((d) => ({
      ...d,
      categorias: novaCategoria ? [...d.categorias, novaCategoria] : d.categorias,
      pictogramas: pictograma
        ? d.pictogramas.map((p) => (p.id === novo.id ? novo : p))
        : [...d.pictogramas, novo],
    }));
    if (!resultado.ok) {
      setErro(resultado.mensagem);
      return;
    }
    mostrarMensagem(pictograma ? 'Pictograma atualizado.' : 'Pictograma criado.');
    aoFechar();
  };

  return (
    <ModalBase titulo={pictograma ? 'Editar pictograma' : 'Novo pictograma'} aoFechar={aoFechar}>
      <TextInput
        accessibilityLabel="Palavra"
        placeholder="PALAVRA"
        placeholderTextColor={tema.cartao.textoSuave}
        value={nome}
        onChangeText={setNome}
        style={[estilos.campo, { color: cor, borderBottomColor: tema.borda }]}
      />

      <Pressable accessibilityRole="button" accessibilityLabel="Importar foto" onPress={() => importarPara(setImagem)} style={estilos.imagem}>
        <ImagemSegura imagem={imagem} tamanho={132} raio={18} />
        <Text style={[estilos.textoImagem, { color: cor }]}>{imagem ? 'TROCAR FOTO' : 'IMPORTAR FOTO'}</Text>
      </Pressable>

      <TextInput
        accessibilityLabel="Frase opcional"
        multiline
        placeholder={'(Opcional) Escreva aqui uma frase para complementar a palavra. "Eu quero", "Eu estou", etc.'}
        placeholderTextColor={tema.cartao.textoSuave}
        value={frase}
        onChangeText={setFrase}
        style={[estilos.frase, { color: cor, borderColor: tema.borda }]}
      />

      <Text style={[estilos.uso, { backgroundColor: tema.controle.fundo, color: tema.controle.texto }]}>USO</Text>
      {dados.categorias.map((c) => {
        const selecionada = !personalizado && categoria === c.nome;
        const fundo = selecionada ? tema.pilula : tema.cartao;
        return (
          <Pressable
            key={c.nome}
            accessibilityRole="radio"
            accessibilityState={{ selected: selecionada }}
            onPress={() => {
              setPersonalizado(false);
              setCategoria(c.nome);
            }}
            style={[estilos.opcao, { backgroundColor: fundo.fundo, borderColor: tema.borda }]}
          >
            <Text style={[estilos.textoOpcao, { color: fundo.texto }]}>{c.nome}</Text>
          </Pressable>
        );
      })}
      {personalizado ? (
        <>
          <TextInput
            accessibilityLabel="Nome do uso personalizado"
            autoFocus
            placeholder="Nome do uso personalizado"
            placeholderTextColor={tema.cartao.textoSuave}
            value={categoria}
            onChangeText={setCategoria}
            style={[estilos.opcao, estilos.textoOpcao, { color: cor, borderColor: tema.borda }]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Importar foto de capa do grupo"
            onPress={() => importarPara(setCapa)}
            style={estilos.imagem}
          >
            <ImagemSegura imagem={capa} tamanho={96} raio={14} />
            <Text style={[estilos.textoImagem, { color: cor }]}>
              {capa ? 'TROCAR FOTO DE CAPA' : 'IMPORTAR FOTO DE CAPA'}
            </Text>
          </Pressable>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setPersonalizado(true);
            setCategoria('');
          }}
          style={[estilos.opcao, estilos.opcaoNova, { borderColor: tema.borda }]}
        >
          <MaterialCommunityIcons name="plus" size={24} color={cor} />
          <Text style={[estilos.textoOpcao, { color: cor }]}>USO PERSONALIZADO</Text>
        </Pressable>
      )}

      {erro ? (
        <Text accessibilityLiveRegion="assertive" style={[estilos.erro, { color: tema.perigo.fundo }]}>
          {erro}
        </Text>
      ) : null}

      <Botao texto="OK" onPress={salvar} estilo={estilos.ok} />
    </ModalBase>
  );
}

const estilos = StyleSheet.create({
  campo: { fontSize: 18, borderBottomWidth: 1, paddingVertical: 8 },
  imagem: { alignItems: 'center', marginTop: 14, gap: 6 },
  textoImagem: { fontSize: 14, fontWeight: '700' },
  frase: { fontSize: 15, borderWidth: 1, padding: 10, marginTop: 14, minHeight: 72, textAlignVertical: 'top' },
  uso: { fontSize: 17, fontWeight: '600', padding: 10, marginTop: 14 },
  opcao: { minHeight: 46, justifyContent: 'center', borderWidth: 1, borderTopWidth: 0, paddingHorizontal: 12 },
  opcaoNova: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 8 },
  textoOpcao: { fontSize: 16 },
  erro: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 14 },
  ok: { marginTop: 18 },
});
