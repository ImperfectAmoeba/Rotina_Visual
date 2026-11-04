import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { mensagemDeErro } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useTimer } from '../../contexts/TimerContext';
import { atividadesSubstituiveis, criarId, validarAtividade } from '../../domain/rotinas';
import { escolherImagem } from '../../services/imagens';
import Botao from '../Botao';
import CampoHora from '../CampoHora';
import ImagemSegura from '../ImagemSegura';
import Marcador from '../Marcador';
import ModalBase from '../ModalBase';
import SeletorData from '../SeletorData';

const separarHora = (hora) => {
  const [h, m] = hora.split(':');
  return { hora: h, minuto: m };
};

const juntarHora = ({ hora, minuto }) => `${hora.padStart(2, '0')}:${minuto.padStart(2, '0')}`;

// Criação (RF001, RF014) e edição (RF002) de atividade. "atividade" nula significa criação.
export default function ModalAtividade({ atividade, atividades, aoSalvar, aoFechar }) {
  const tema = useTheme();
  const { hoje } = useTimer();
  const cor = tema.cartao.texto;

  const [nome, setNome] = useState(atividade?.nome ?? '');
  const [inicio, setInicio] = useState(separarHora(atividade?.hrInicio ?? '10:00'));
  const [termino, setTermino] = useState(separarHora(atividade?.hrTermino ?? '11:00'));
  const [imagem, setImagem] = useState(atividade?.imagem ?? null);
  const [mudanca, setMudanca] = useState(atividade?.atvInesperada ?? false);
  const [dataMudanca, setDataMudanca] = useState(atividade?.dataMudanca ?? hoje);
  const [naoSubstituir, setNaoSubstituir] = useState(() => {
    if (!atividade?.atvInesperada) return [];
    return atividadesSubstituiveis(atividade, atividades)
      .filter((a) => !atividade.substitui.includes(a.id))
      .map((a) => a.id);
  });
  const [erro, setErro] = useState(null);

  const id = useMemo(() => atividade?.id ?? criarId(), [atividade]);
  const hrInicio = juntarHora(inicio);
  const hrTermino = juntarHora(termino);

  const substituiveis = useMemo(() => {
    return mudanca ? atividadesSubstituiveis({ id, hrInicio, hrTermino }, atividades) : [];
  }, [mudanca, id, hrInicio, hrTermino, atividades]);

  const alternarSubstituicao = (alvoId) =>
    setNaoSubstituir((atual) =>
      atual.includes(alvoId) ? atual.filter((x) => x !== alvoId) : [...atual, alvoId],
    );

  const importarImagem = async () => {
    try {
      const escolhida = await escolherImagem();
      if (escolhida) setImagem(escolhida);
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  };

  const salvar = () => {
    const dados = {
      id,
      nome: nome.trim(),
      hrInicio,
      hrTermino,
      imagem,
      atvInesperada: mudanca,
      dataMudanca: mudanca ? dataMudanca : null,
      substitui: substituiveis.filter((a) => !naoSubstituir.includes(a.id)).map((a) => a.id),
    };
    const invalido = validarAtividade(dados, atividades, atividade);
    if (invalido) {
      setErro(invalido);
      return;
    }
    const mensagem = aoSalvar(dados);
    if (mensagem) setErro(mensagem);
  };

  return (
    <ModalBase titulo={atividade ? 'Editar atividade' : 'Nova atividade'} aoFechar={aoFechar}>
      <TextInput
        accessibilityLabel="Nome da atividade"
        placeholder="Nome da atividade"
        placeholderTextColor={tema.cartao.textoSuave}
        value={nome}
        onChangeText={(texto) => {
          setNome(texto);
          setErro(null);
        }}
        style={[estilos.nome, { color: cor, borderBottomColor: tema.borda }]}
      />

      <CampoHora rotulo="Hora que começa" valor={inicio} onChange={setInicio} />
      <CampoHora rotulo="Hora que acaba" valor={termino} onChange={setTermino} />

      <Pressable accessibilityRole="button" onPress={importarImagem} style={estilos.imagem}>
        <ImagemSegura imagem={imagem} tamanho={64} raio={14} />
        <Text style={[estilos.textoImagem, { color: cor }]}>
          {imagem ? 'Trocar imagem' : 'Adicionar imagem (opcional)'}
        </Text>
      </Pressable>

      {atividade && !atividade.atvInesperada ? null : (
        <View style={[estilos.secao, { borderTopColor: tema.borda }]}>
          {atividade ? (
            <Text style={[estilos.tituloMudanca, { color: cor }]}>Mudança inesperada</Text>
          ) : (
            <View style={estilos.linhaMudanca}>
              <Switch
                accessibilityLabel="Mudança inesperada"
                value={mudanca}
                onValueChange={setMudanca}
                trackColor={{ true: tema.mudanca.fundo, false: tema.controle.fundo }}
                thumbColor={mudanca ? tema.pilula.fundo : tema.cartao.fundo}
              />
              <Text style={[estilos.tituloMudanca, { color: cor }]}>Mudança inesperada</Text>
            </View>
          )}

          {mudanca ? (
            <>
              <Text style={[estilos.ajuda, { color: tema.cartao.textoSuave }]}>
                Esta atividade aparece somente no dia escolhido:
              </Text>
              <SeletorData data={dataMudanca} hoje={hoje} minimo={hoje} onMudar={setDataMudanca} cor={cor} tamanhoTexto={18} />
              {substituiveis.length > 0 ? (
                <>
                  <Text style={[estilos.ajuda, { color: tema.cartao.textoSuave }]}>
                    Atividades no mesmo horário. Marque as que serão substituídas:
                  </Text>
                  {substituiveis.map((a) => (
                    <View key={a.id} style={estilos.substituicao}>
                      <Marcador
                        tamanho={40}
                        rotulo={`Substituir ${a.nome}`}
                        marcado={!naoSubstituir.includes(a.id)}
                        onPress={() => alternarSubstituicao(a.id)}
                      />
                      <Text style={[estilos.textoSubstituicao, { color: cor }]}>
                        {a.nome} ({a.hrInicio} - {a.hrTermino})
                      </Text>
                    </View>
                  ))}
                </>
              ) : null}
            </>
          ) : null}
        </View>
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
  nome: { fontSize: 18, borderBottomWidth: 1, paddingVertical: 8, marginTop: 8 },
  imagem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  textoImagem: { flex: 1, fontSize: 16, fontWeight: '500' },
  secao: { borderTopWidth: 1, marginTop: 18, paddingTop: 14 },
  linhaMudanca: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tituloMudanca: { fontSize: 18, fontWeight: '600' },
  ajuda: { fontSize: 15, marginTop: 10, marginBottom: 6 },
  substituicao: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  textoSubstituicao: { flex: 1, fontSize: 16 },
  erro: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 14 },
  ok: { marginTop: 18 },
});
