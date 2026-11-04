import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { useTimer } from '../../contexts/TimerContext';
import { formatarTempoRestante, instante } from '../../domain/datas';
import Botao from '../Botao';
import ModalBase from '../ModalBase';

const TAMANHO = 240;
const RAIO = TAMANHO / 2;

// Fatia que representa o tempo restante, começando às 12 horas, como no protótipo.
const caminhoDaFatia = (fracao) => {
  const angulo = fracao * 2 * Math.PI;
  const x = RAIO + RAIO * Math.sin(-angulo);
  const y = RAIO - RAIO * Math.cos(-angulo);
  const arcoGrande = fracao > 0.5 ? 1 : 0;
  return `M ${RAIO} ${RAIO} L ${RAIO} 0 A ${RAIO} ${RAIO} 0 ${arcoGrande} 0 ${x} ${y} Z`;
};

// Timer circular da atividade atual (RF009).
export default function TimerVisual() {
  const { atual, hoje, timerAberto, minimizarTimer } = useTimer();
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (!timerAberto) return undefined;
    setAgora(Date.now());
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timerAberto]);

  if (!timerAberto || !atual) return null;
  return <Conteudo atividade={atual} hoje={hoje} agora={agora} aoFechar={minimizarTimer} />;
}

function Conteudo({ atividade, hoje, agora, aoFechar }) {
  const tema = useTheme();
  const inicio = instante(hoje, atividade.hrInicio).getTime();
  const termino = instante(hoje, atividade.hrTermino).getTime();
  const restante = Math.max(0, termino - agora);
  const fracao = Math.min(1, restante / (termino - inicio));
  const cor = tema.cartao.texto;

  return (
    <ModalBase titulo={atividade.nome} aoFechar={aoFechar}>
      <Svg
        width={TAMANHO}
        height={TAMANHO}
        style={estilos.circulo}
        accessibilityLabel={`Faltam ${formatarTempoRestante(restante / 1000)}`}
      >
        <Circle cx={RAIO} cy={RAIO} r={RAIO - 1} fill={tema.linha.fundo} stroke={tema.borda} strokeWidth={1} />
        {fracao >= 0.9999 ? (
          <Circle cx={RAIO} cy={RAIO} r={RAIO} fill={tema.forte.fundo} />
        ) : (
          <Path d={caminhoDaFatia(fracao)} fill={tema.forte.fundo} />
        )}
      </Svg>
      <Text style={[estilos.tempo, { color: cor }]}>{formatarTempoRestante(restante / 1000)}</Text>
      <Text style={[estilos.legenda, { color: cor }]}>PARA TERMINAR</Text>
      <Botao texto="OK" onPress={aoFechar} estilo={estilos.ok} />
    </ModalBase>
  );
}

const estilos = StyleSheet.create({
  circulo: { alignSelf: 'center', marginVertical: 12 },
  tempo: { fontSize: 22, fontWeight: '500', textAlign: 'center', marginTop: 8 },
  legenda: { fontSize: 17, textAlign: 'center', marginTop: 2 },
  ok: { marginTop: 18 },
});
