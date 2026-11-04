import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import AtividadeItem from '../../components/AtividadeItem';
import BotaoIcone from '../../components/BotaoIcone';
import Cabecalho from '../../components/Cabecalho';
import ModalAtividade from '../../components/ModalAtividade';
import Rodape from '../../components/Rodape';
import { useDados } from '../../contexts/DataContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTimer } from '../../contexts/TimerContext';
import {
  atividadesParaEdicao,
  excluirAtividadeDaRotina,
  salvarAtividadeNaRotina,
} from '../../domain/rotinas';

// Atividades de uma rotina, com criação, edição e exclusão (RF001-RF003).
export default function Rotina({ route }) {
  const tema = useTheme();
  const { dados, atualizar } = useDados();
  const { confirmar, mostrarMensagem } = useFeedback();
  const { hoje, atual, abrirTimer } = useTimer();
  const [formulario, setFormulario] = useState(null);

  const rotina = dados.rotinas.find((r) => r.id === route.params.rotinaId);
  const atividades = useMemo(
    () => (rotina ? atividadesParaEdicao(rotina, hoje) : []),
    [rotina, hoje],
  );

  if (!rotina) return null;

  const alterarRotina = (transformar) =>
    atualizar((d) => ({
      ...d,
      rotinas: d.rotinas.map((r) => (r.id === rotina.id ? transformar(r) : r)),
    }));

  const salvar = (atividade) => {
    const editando = !!formulario.atividade;
    const resultado = alterarRotina((r) => salvarAtividadeNaRotina(r, atividade));
    if (!resultado.ok) return resultado.mensagem;
    setFormulario(null);
    mostrarMensagem(editando ? 'Atividade atualizada.' : 'Atividade criada.');
    return null;
  };

  const excluir = async (atividade) => {
    const sim = await confirmar({
      titulo: 'Excluir atividade',
      mensagem: 'Tem certeza que deseja excluir essa atividade?',
    });
    if (!sim) return;
    const resultado = alterarRotina((r) => excluirAtividadeDaRotina(r, atividade.id));
    if (resultado.ok) mostrarMensagem('Atividade excluída.');
    else mostrarMensagem(resultado.mensagem, 'erro');
  };

  return (
    <View style={[estilos.tela, { backgroundColor: tema.fundo.fundo }]}>
      <Cabecalho voltar />
      <Text numberOfLines={2} style={[estilos.nome, { color: tema.fundo.texto }]}>
        {rotina.nome}
      </Text>
      <FlatList
        data={atividades}
        keyExtractor={(a) => a.id}
        contentContainerStyle={estilos.lista}
        renderItem={({ item }) => {
          const superficie = item.atvInesperada ? tema.pilulaMudanca : tema.pilula;
          const emAndamento = atual?.id === item.id;
          return (
            <AtividadeItem
              atividade={item}
              emAndamento={emAndamento}
              mostrarData
              onPress={emAndamento ? abrirTimer : undefined}
            >
              <BotaoIcone
                icone="pencil"
                rotulo={`Editar ${item.nome}`}
                superficie={superficie}
                onPress={() => setFormulario({ atividade: item })}
              />
              <BotaoIcone
                icone="trash-can-outline"
                rotulo={`Excluir ${item.nome}`}
                superficie={superficie}
                onPress={() => excluir(item)}
              />
            </AtividadeItem>
          );
        }}
        ListEmptyComponent={
          <Text style={[estilos.vazio, { color: tema.fundo.texto }]}>
            Esta rotina ainda não tem atividades. Toque em + para criar.
          </Text>
        }
      />
      <Rodape
        centro={{
          icone: 'plus',
          rotulo: 'Nova atividade',
          onPress: () => setFormulario({ atividade: null }),
        }}
      />
      {formulario ? (
        <ModalAtividade
          atividade={
            formulario.atividade
              ? rotina.atividades.find((a) => a.id === formulario.atividade.id)
              : null
          }
          atividades={rotina.atividades}
          aoSalvar={salvar}
          aoFechar={() => setFormulario(null)}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  nome: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 12, marginBottom: 8, marginHorizontal: 16 },
  lista: { flexGrow: 1 },
  vazio: { fontSize: 18, lineHeight: 26, textAlign: 'center', marginTop: 48, marginHorizontal: 32 },
});
