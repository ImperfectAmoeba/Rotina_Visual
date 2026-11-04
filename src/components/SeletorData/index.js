import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatarData, somarDias } from '../../domain/datas';

export default function SeletorData({ data, hoje, onMudar, minimo, cor, tamanhoTexto = 20 }) {
  const podeVoltar = !minimo || data > minimo;
  const rotulo = `${formatarData(data)}${data === hoje ? ' (Hoje)' : ''}`;

  return (
    <View style={estilos.seletor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dia anterior"
        accessibilityState={{ disabled: !podeVoltar }}
        disabled={!podeVoltar}
        hitSlop={8}
        onPress={() => onMudar(somarDias(data, -1))}
        style={[estilos.seta, !podeVoltar && estilos.oculta]}
      >
        <MaterialCommunityIcons name="chevron-left" size={36} color={cor} />
      </Pressable>
      <Text accessibilityLiveRegion="polite" style={[estilos.texto, { color: cor, fontSize: tamanhoTexto }]}>
        {rotulo}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Próximo dia"
        hitSlop={8}
        onPress={() => onMudar(somarDias(data, 1))}
        style={estilos.seta}
      >
        <MaterialCommunityIcons name="chevron-right" size={36} color={cor} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  seletor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  seta: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  oculta: { opacity: 0 },
  texto: { fontWeight: '500', textAlign: 'center', flexShrink: 1 },
});
