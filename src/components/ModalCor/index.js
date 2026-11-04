import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { hexParaHsl, hslParaHex, textoSobre } from '../../domain/cores';
import Botao from '../Botao';
import ModalBase from '../ModalBase';

const ALTURA_TRILHA = 40;

function Controle({ id, rotulo, valor, maximo, paradas, onChange, corTexto }) {
  const largura = useRef(1);
  const inicio = useRef(0);
  const aoMudar = useRef(onChange);
  aoMudar.current = onChange;

  const aplicar = (x) => {
    const razao = Math.min(1, Math.max(0, x / largura.current));
    aoMudar.current(razao * maximo);
  };

  const gestos = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evento) => {
        inicio.current = evento.nativeEvent.locationX;
        aplicar(inicio.current);
      },
      onPanResponderMove: (_, gesto) => aplicar(inicio.current + gesto.dx),
    }),
  ).current;

  return (
    <View style={estilos.controle}>
      <Text style={[estilos.rotulo, { color: corTexto }]}>{rotulo}</Text>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={rotulo}
        accessibilityValue={{ now: Math.round(valor), min: 0, max: maximo }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={({ nativeEvent }) => {
          const passo = maximo / 20;
          const novo = valor + (nativeEvent.actionName === 'increment' ? passo : -passo);
          onChange(Math.min(maximo, Math.max(0, novo)));
        }}
        onLayout={(e) => {
          largura.current = e.nativeEvent.layout.width;
        }}
        style={estilos.trilha}
        {...gestos.panHandlers}
      >
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width="100%" height={ALTURA_TRILHA}>
            <Defs>
              <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
                {paradas.map((cor, i) => (
                  <Stop key={i} offset={i / (paradas.length - 1)} stopColor={cor} />
                ))}
              </LinearGradient>
            </Defs>
            <Rect width="100%" height={ALTURA_TRILHA} rx={12} fill={`url(#${id})`} />
          </Svg>
        </View>
        <View pointerEvents="none" style={[estilos.cursor, { left: `${(valor / maximo) * 100}%`, borderColor: corTexto }]} />
      </View>
    </View>
  );
}

// Seletor de cor de destaque (RF018). A cor só é aplicada ao confirmar com "OK".
export default function ModalCor({ corInicial, aoSalvar, aoFechar }) {
  const tema = useTheme();
  const [hsl, setHsl] = useState(() => hexParaHsl(corInicial));
  const { h, s, l } = hsl;
  const corAtual = hslParaHex(hsl);
  const corTexto = tema.cartao.texto;

  const matizes = useMemo(
    () => [0, 60, 120, 180, 240, 300, 360].map((m) => hslParaHex({ h: m % 360, s: 100, l: 50 })),
    [],
  );

  return (
    <ModalBase titulo="Escolher cor" aoFechar={aoFechar}>
      <View style={[estilos.amostra, { backgroundColor: corAtual }]}>
        <Text style={[estilos.textoAmostra, { color: textoSobre(corAtual) }]}>{corAtual}</Text>
      </View>
      <Controle id="matiz" rotulo="Cor" valor={h} maximo={359} paradas={matizes} corTexto={corTexto}
        onChange={(v) => setHsl((a) => ({ ...a, h: v }))} />
      <Controle id="saturacao" rotulo="Intensidade" valor={s} maximo={100} corTexto={corTexto}
        paradas={[hslParaHex({ h, s: 0, l }), hslParaHex({ h, s: 100, l })]}
        onChange={(v) => setHsl((a) => ({ ...a, s: v }))} />
      <Controle id="luz" rotulo="Claridade" valor={l} maximo={100} corTexto={corTexto}
        paradas={[hslParaHex({ h, s, l: 0 }), hslParaHex({ h, s, l: 50 }), hslParaHex({ h, s, l: 100 })]}
        onChange={(v) => setHsl((a) => ({ ...a, l: v }))} />
      <Botao texto="OK" onPress={() => aoSalvar(corAtual)} estilo={estilos.ok} />
    </ModalBase>
  );
}

const estilos = StyleSheet.create({
  amostra: { height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  textoAmostra: { fontSize: 18, fontWeight: '700' },
  controle: { marginTop: 16 },
  rotulo: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  trilha: { height: ALTURA_TRILHA, justifyContent: 'center' },
  cursor: {
    position: 'absolute',
    width: 14,
    height: ALTURA_TRILHA + 6,
    marginLeft: -7,
    borderRadius: 7,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
  },
  ok: { marginTop: 20 },
});
