import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { formatarData } from '../../domain/datas';
import ImagemSegura from '../ImagemSegura';

// Linha de atividade usada na edição e na visualização. A mudança na rotina se destaca com
// cores invertidas e informa o que está substituindo (RF014).
export default function AtividadeItem({ atividade, emAndamento, mostrarData, onPress, rotuloDireita, children }) {
  const tema = useTheme();
  const mudanca = atividade.atvInesperada;
  const linha = mudanca ? tema.mudanca : tema.linha;
  const pilula = mudanca ? tema.pilulaMudanca : tema.pilula;

  return (
    <View
      style={[
        estilos.linha,
        { backgroundColor: linha.fundo },
        emAndamento && { borderLeftWidth: 8, borderLeftColor: linha.texto },
      ]}
    >
      <View style={estilos.topo}>
        <Text style={[estilos.horario, { color: linha.texto }]}>
          {atividade.hrInicio} - {atividade.hrTermino}
        </Text>
        {emAndamento ? <Text style={[estilos.agora, { color: linha.texto }]}>AGORA</Text> : null}
        <View style={estilos.espaco} />
        {rotuloDireita ? (
          <Text style={[estilos.rotulo, { color: linha.textoSuave }]}>{rotuloDireita}</Text>
        ) : mudanca ? (
          <Text style={[estilos.rotulo, { color: linha.texto }]}>Mudança na rotina</Text>
        ) : null}
      </View>

      <View style={estilos.conteudo}>
        <Pressable
          accessibilityRole={onPress ? 'button' : 'text'}
          accessibilityHint={onPress ? 'Abre o timer da atividade' : undefined}
          disabled={!onPress}
          onPress={onPress}
          style={[estilos.pilula, { backgroundColor: pilula.fundo }]}
        >
          {atividade.imagem ? <ImagemSegura imagem={atividade.imagem} tamanho={42} raio={10} /> : null}
          <Text numberOfLines={2} style={[estilos.nome, { color: pilula.texto }]}>
            {atividade.nome}
          </Text>
        </Pressable>
        {children}
      </View>

      {mudanca ? (
        <View style={estilos.detalhes}>
          {rotuloDireita ? (
            <Text style={[estilos.detalhe, { color: linha.texto }]}>Mudança na rotina</Text>
          ) : null}
          {mostrarData ? (
            <Text style={[estilos.detalhe, { color: linha.texto }]}>Somente em {formatarData(atividade.dataMudanca)}</Text>
          ) : null}
          {atividade.substituidas?.length > 0 ? (
            <Text style={[estilos.detalhe, { color: linha.texto }]}>
              Substitui: {atividade.substituidas.join(', ')}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { paddingTop: 10, paddingBottom: 14, marginBottom: 10 },
  topo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8, gap: 10 },
  horario: { fontSize: 20, fontWeight: '500' },
  agora: { fontSize: 13, fontWeight: '800' },
  espaco: { flex: 1 },
  rotulo: { fontSize: 14, fontWeight: '700' },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 12 },
  pilula: {
    flex: 1,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 20,
    paddingRight: 14,
    paddingVertical: 8,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
  },
  nome: { flex: 1, fontSize: 17, fontWeight: '700' },
  detalhes: { paddingHorizontal: 20, marginTop: 8, gap: 2 },
  detalhe: { fontSize: 15, fontWeight: '500' },
});
