import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { mensagemDeErro, useDados } from '../../contexts/DataContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';
import { editarCategoria, validarCategoria } from '../../domain/pictogramas';
import { escolherImagem } from '../../services/imagens';
import Botao from '../Botao';
import ImagemSegura from '../ImagemSegura';
import ModalBase from '../ModalBase';

// Edição do nome e da foto de capa de um grupo de pictogramas.
export default function ModalCategoria({ categoria, aoFechar }) {
  const tema = useTheme();
  const { dados, atualizar } = useDados();
  const { mostrarMensagem } = useFeedback();
  const cor = tema.cartao.texto;

  const [nome, setNome] = useState(categoria.nome);
  const [imagem, setImagem] = useState(categoria.imagem);
  const [erro, setErro] = useState(null);

  const importarImagem = async () => {
    try {
      const escolhida = await escolherImagem();
      if (escolhida) setImagem(escolhida);
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  };

  const salvar = () => {
    const nova = { nome: nome.trim(), imagem };
    const invalido = validarCategoria(nova, dados.categorias, categoria.nome);
    if (invalido) {
      setErro(invalido);
      return;
    }
    const resultado = atualizar((d) => editarCategoria(d, categoria.nome, nova));
    if (!resultado.ok) {
      setErro(resultado.mensagem);
      return;
    }
    mostrarMensagem('Grupo atualizado.');
    aoFechar();
  };

  return (
    <ModalBase titulo="Editar grupo" aoFechar={aoFechar}>
      <TextInput
        accessibilityLabel="Nome do grupo"
        placeholder="NOME DO GRUPO"
        placeholderTextColor={tema.cartao.textoSuave}
        value={nome}
        onChangeText={setNome}
        style={[estilos.campo, { color: cor, borderBottomColor: tema.borda }]}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Trocar foto de capa"
        onPress={importarImagem}
        style={estilos.imagem}
      >
        <ImagemSegura imagem={imagem} tamanho={132} raio={18} />
        <Text style={[estilos.textoImagem, { color: cor }]}>TROCAR FOTO DE CAPA</Text>
      </Pressable>

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
  erro: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 14 },
  ok: { marginTop: 18 },
});
