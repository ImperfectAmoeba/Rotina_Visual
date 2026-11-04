import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { DIAS_SEMANA } from '../../domain/rotinas';
import BotaoIcone from '../BotaoIcone';

const descreverDias = (dias) => {
  if (dias.length === 0) return 'Sem dias definidos';
  if (dias.length === 7) return 'Todos os dias';
  return DIAS_SEMANA.filter((d) => dias.includes(d.valor))
    .map((d) => d.rotulo.replace('.', ''))
    .join(', ');
};

export default function RotinaItem({ rotina, onAbrir, onEditar, onExcluir }) {
  const tema = useTheme();

  return (
    <View style={[estilos.linha, { backgroundColor: tema.linha.fundo }]}>
      <Text style={[estilos.dias, { color: tema.linha.textoSuave }]}>{descreverDias(rotina.diasSemana)}</Text>
      <View style={estilos.conteudo}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${rotina.nome}`}
          onPress={onAbrir}
          style={({ pressed }) => [estilos.pilula, { backgroundColor: tema.pilula.fundo, opacity: pressed ? 0.75 : 1 }]}
        >
          <Text numberOfLines={2} style={[estilos.nome, { color: tema.pilula.texto }]}>
            {rotina.nome.toUpperCase()}
          </Text>
        </Pressable>
        <BotaoIcone icone="pencil" rotulo={`Editar ${rotina.nome}`} superficie={tema.pilula} onPress={onEditar} />
        <BotaoIcone icone="trash-can-outline" rotulo={`Excluir ${rotina.nome}`} superficie={tema.pilula} onPress={onExcluir} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { paddingTop: 10, paddingBottom: 18, marginBottom: 12 },
  dias: { fontSize: 15, fontWeight: '500', marginLeft: 20, marginBottom: 8 },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 12 },
  pilula: {
    flex: 1,
    minHeight: 60,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 16,
    paddingVertical: 8,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
  },
  nome: { fontSize: 17, fontWeight: '700' },
});
