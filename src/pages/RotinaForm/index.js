import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePreventRemove } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import BotaoIcone from '../../components/BotaoIcone';
import Cabecalho from '../../components/Cabecalho';
import Marcador from '../../components/Marcador';
import ModalAtividade from '../../components/ModalAtividade';
import Rodape from '../../components/Rodape';
import { useDados } from '../../contexts/DataContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSuspenderTimerNaTela, useTimer } from '../../contexts/TimerContext';
import { useModo } from '../../hooks/useModo';
import {
  atividadesParaEdicao,
  criarId,
  DIAS_SEMANA,
  excluirAtividadeDaRotina,
  rotinasEmConflito,
  salvarAtividadeNaRotina,
  salvarRotinaEmLista,
  validarRotina,
} from '../../domain/rotinas';

const TODOS_OS_DIAS = DIAS_SEMANA.map((d) => d.valor);

// Criação (RF004, UC04) e edição (RF007) de rotina. Nada é salvo até tocar em "OK".
export default function RotinaForm({ navigation, route }) {
  const tema = useTheme();
  const { dados, atualizar } = useDados();
  const { confirmar, mostrarMensagem } = useFeedback();
  const { hoje } = useTimer();
  const { entrarVisualizacao } = useModo();
  useSuspenderTimerNaTela();

  const rotinaId = route.params?.rotinaId;
  const original = useMemo(
    () =>
      dados.rotinas.find((r) => r.id === rotinaId) ?? {
        id: criarId(),
        nome: '',
        diasSemana: [],
        atividades: [],
      },
    // O formulário trabalha sobre uma cópia feita ao abrir a tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rotinaId],
  );
  const [rotina, setRotina] = useState(original);
  const [formulario, setFormulario] = useState(null);
  const [erro, setErro] = useState(null);
  const [salvo, setSalvo] = useState(false);

  const alterado = JSON.stringify(rotina) !== JSON.stringify(original);

  usePreventRemove(alterado && !salvo, ({ data }) => {
    confirmar({
      titulo: 'Descartar alterações?',
      mensagem: 'As alterações nesta rotina ainda não foram salvas.',
    }).then((sim) => {
      if (sim) navigation.dispatch(data.action);
    });
  });

  useEffect(() => {
    if (salvo) navigation.goBack();
  }, [salvo, navigation]);

  const conflitos = useMemo(
    () => rotinasEmConflito(dados.rotinas, rotina.id, rotina.diasSemana),
    [dados.rotinas, rotina.id, rotina.diasSemana],
  );
  const atividades = useMemo(() => atividadesParaEdicao(rotina, hoje), [rotina, hoje]);

  const alternarDia = (dia) => {
    setErro(null);
    setRotina((r) => ({
      ...r,
      diasSemana: r.diasSemana.includes(dia)
        ? r.diasSemana.filter((d) => d !== dia)
        : [...r.diasSemana, dia],
    }));
  };

  const salvarAtividade = (atividade) => {
    setRotina((r) => salvarAtividadeNaRotina(r, atividade));
    setFormulario(null);
    return null;
  };

  const salvar = () => {
    const pronta = { ...rotina, nome: rotina.nome.trim() };
    const invalida = validarRotina(pronta);
    if (invalida) {
      setErro(invalida);
      return;
    }
    const resultado = atualizar((d) => ({ ...d, rotinas: salvarRotinaEmLista(d.rotinas, pronta) }));
    if (!resultado.ok) {
      setErro(resultado.mensagem);
      return;
    }
    mostrarMensagem(rotinaId ? 'Rotina atualizada.' : 'Rotina criada.');
    setSalvo(true);
  };

  const verRotina = async () => {
    if (alterado) {
      const sim = await confirmar({
        titulo: 'Descartar alterações?',
        mensagem: 'As alterações nesta rotina ainda não foram salvas.',
      });
      if (!sim) return;
    }
    entrarVisualizacao();
  };

  const cor = tema.fundo.texto;

  return (
    <View style={[estilos.tela, { backgroundColor: tema.fundo.fundo }]}>
      <Cabecalho voltar />
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={[estilos.instrucao, { color: cor }]}>
          Clique no botão de "mais" e crie uma atividade para a rotina do dia. Para alterar nome ou horário da
          atividade após a criação, clique nela.
        </Text>

        <View style={[estilos.cartao, { backgroundColor: tema.cartao.fundo, borderColor: tema.borda }]}>
          <TextInput
            accessibilityLabel="Nome da rotina"
            placeholder="NOME DA ROTINA"
            placeholderTextColor={tema.cabecalho.textoSuave}
            value={rotina.nome}
            onChangeText={(nome) => {
              setErro(null);
              setRotina((r) => ({ ...r, nome }));
            }}
            style={[estilos.nome, { backgroundColor: tema.cabecalho.fundo, color: tema.cabecalho.texto }]}
          />
          <View style={estilos.atividades}>
            {atividades.length === 0 ? (
              <Text style={[estilos.semAtividades, { color: tema.cartao.textoSuave }]}>Nenhuma atividade ainda.</Text>
            ) : null}
            {atividades.map((a) => {
              const superficie = a.atvInesperada ? tema.mudanca : tema.linha;
              return (
                <View key={a.id} style={[estilos.atividade, { backgroundColor: superficie.fundo }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${a.nome}`}
                    onPress={() => setFormulario({ atividade: rotina.atividades.find((x) => x.id === a.id) })}
                    style={estilos.atividadeToque}
                  >
                    <Text numberOfLines={2} style={[estilos.atividadeNome, { color: superficie.texto }]}>
                      {a.nome}
                    </Text>
                    <Text style={[estilos.atividadeHora, { color: superficie.texto }]}>
                      {a.hrInicio} - {a.hrTermino}
                    </Text>
                  </Pressable>
                  <BotaoIcone
                    icone="trash-can-outline"
                    rotulo={`Excluir ${a.nome}`}
                    superficie={tema.controle}
                    tamanho={44}
                    tamanhoIcone={24}
                    onPress={async () => {
                      const sim = await confirmar({
                        titulo: 'Excluir atividade',
                        mensagem: 'Tem certeza que deseja excluir essa atividade?',
                      });
                      if (sim) setRotina((r) => excluirAtividadeDaRotina(r, a.id));
                    }}
                  />
                </View>
              );
            })}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nova atividade"
              onPress={() => setFormulario({ atividade: null })}
              style={({ pressed }) => [
                estilos.adicionar,
                { backgroundColor: tema.pilula.fundo, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <MaterialCommunityIcons name="plus" size={30} color={tema.pilula.texto} />
            </Pressable>
          </View>
        </View>

        <Text style={[estilos.tituloDias, { color: cor }]}>Escolha os dias da semana em que essa rotina se repete:</Text>
        <View style={estilos.dias}>
          {DIAS_SEMANA.map((d) => (
            <View key={d.valor} style={estilos.dia}>
              <Text style={[estilos.rotuloDia, { color: cor }]}>{d.rotulo}</Text>
              <Marcador
                tamanho={42}
                rotulo={d.rotulo}
                marcado={rotina.diasSemana.includes(d.valor)}
                onPress={() => alternarDia(d.valor)}
              />
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setErro(null);
            setRotina((r) => ({ ...r, diasSemana: TODOS_OS_DIAS }));
          }}
          style={estilos.todos}
        >
          <Text style={[estilos.textoTodos, { color: cor }]}>Selecionar todos os dias</Text>
        </Pressable>

        {conflitos.map((c) => (
          <Text key={c.id} style={[estilos.aviso, { color: cor, borderColor: tema.borda }]}>
            A rotina atual está substituindo {c.nome}, troque o dia ou clique em 'Ok' para continuar
          </Text>
        ))}
        {erro ? (
          <Text accessibilityLiveRegion="assertive" style={[estilos.erro, { color: tema.perigo.fundo }]}>
            {erro}
          </Text>
        ) : null}
      </ScrollView>

      <Rodape centro={{ texto: 'OK', rotulo: 'Salvar rotina', onPress: salvar }} aoVerRotina={verRotina} />

      {formulario ? (
        <ModalAtividade
          atividade={formulario.atividade}
          atividades={rotina.atividades}
          aoSalvar={salvarAtividade}
          aoFechar={() => setFormulario(null)}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: { padding: 16, paddingBottom: 24 },
  instrucao: { fontSize: 15, lineHeight: 21 },
  cartao: { borderWidth: 1, borderRadius: 26, marginTop: 14, overflow: 'hidden' },
  nome: { fontSize: 21, fontWeight: '700', textAlign: 'center', paddingVertical: 14, paddingHorizontal: 12 },
  atividades: { padding: 14, gap: 10 },
  semAtividades: { fontSize: 16, textAlign: 'center', paddingVertical: 14 },
  atividade: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8 },
  atividadeToque: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  atividadeNome: { flex: 1, fontSize: 16, fontWeight: '500' },
  atividadeHora: { fontSize: 15 },
  adicionar: { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  tituloDias: { fontSize: 15, fontWeight: '600', marginTop: 18 },
  dias: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  dia: { alignItems: 'center', gap: 4 },
  rotuloDia: { fontSize: 12, fontWeight: '500' },
  todos: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', marginTop: 6 },
  textoTodos: { fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
  aviso: { fontSize: 15, borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 8 },
  erro: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 12 },
});
