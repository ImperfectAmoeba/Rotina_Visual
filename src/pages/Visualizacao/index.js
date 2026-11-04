import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import AtividadeItem from '../../components/AtividadeItem';
import Cabecalho from '../../components/Cabecalho';
import Marcador from '../../components/Marcador';
import Rodape from '../../components/Rodape';
import SeletorData from '../../components/SeletorData';
import { useDados } from '../../contexts/DataContext';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTimer } from '../../contexts/TimerContext';
import { atividadesDoDia } from '../../domain/rotinas';

// Modo de apenas visualização do dependente (RF008). Abre no dia atual; as setas mudam o dia.
export default function Visualizacao() {
  const tema = useTheme();
  const { dados, atualizar } = useDados();
  const { mostrarMensagem } = useFeedback();
  const { hoje, atual, abrirTimer } = useTimer();
  const [data, setData] = useState(hoje);

  // Se o app ficar aberto de um dia para o outro, acompanha a virada do dia.
  useEffect(() => setData(hoje), [hoje]);

  const atividades = useMemo(() => atividadesDoDia(dados.rotinas, data), [dados.rotinas, data]);
  const concluidas = dados.concluidas[data] ?? [];

  const alternarFeito = (id) => {
    const resultado = atualizar((d) => {
      const doDia = d.concluidas[data] ?? [];
      return {
        ...d,
        concluidas: {
          ...d.concluidas,
          [data]: doDia.includes(id) ? doDia.filter((x) => x !== id) : [...doDia, id],
        },
      };
    });
    if (!resultado.ok) mostrarMensagem(resultado.mensagem, 'erro');
  };

  return (
    <View style={[estilos.tela, { backgroundColor: tema.fundo.fundo }]}>
      <Cabecalho />
      <View style={estilos.data}>
        <SeletorData data={data} hoje={hoje} onMudar={setData} cor={tema.fundo.texto} />
      </View>
      <FlatList
        data={atividades}
        keyExtractor={(a) => a.id}
        contentContainerStyle={estilos.lista}
        renderItem={({ item }) => {
          const emAndamento = data === hoje && atual?.id === item.id;
          return (
            <AtividadeItem
              atividade={item}
              emAndamento={emAndamento}
              rotuloDireita="FEITO"
              onPress={emAndamento ? abrirTimer : undefined}
            >
              <Marcador
                rotulo={`Marcar ${item.nome} como feito`}
                marcado={concluidas.includes(item.id)}
                onPress={() => alternarFeito(item.id)}
              />
            </AtividadeItem>
          );
        }}
        ListEmptyComponent={
          <Text style={[estilos.vazio, { color: tema.fundo.texto }]}>
            {data === hoje ? 'Não há atividades para hoje' : 'Não há atividades para este dia'}
          </Text>
        }
      />
      <Rodape centro={{ icone: 'plus', rotulo: 'Nova atividade', desativado: true }} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1 },
  data: { paddingVertical: 8 },
  lista: { flexGrow: 1 },
  vazio: { fontSize: 20, lineHeight: 28, textAlign: 'center', marginTop: 48, marginHorizontal: 32 },
});
