import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const Digitos = ({ valor, onChange, rotulo, cor, corBorda }) => (
  <TextInput
    accessibilityLabel={rotulo}
    keyboardType="number-pad"
    maxLength={2}
    selectTextOnFocus
    value={valor}
    onChangeText={(texto) => onChange(texto.replace(/\D/g, ''))}
    onBlur={() => onChange(valor.padStart(2, '0'))}
    style={[estilos.digitos, { color: cor, borderBottomColor: corBorda }]}
  />
);

// Horário em números grandes, como no protótipo. "valor" é { hora, minuto }, ambos em texto.
export default function CampoHora({ rotulo, valor, onChange }) {
  const tema = useTheme();
  const cor = tema.cartao.texto;

  return (
    <View style={estilos.campo}>
      <Text style={[estilos.rotulo, { color: cor }]}>{rotulo}</Text>
      <View style={estilos.linha}>
        <Digitos
          rotulo={`${rotulo}: horas`}
          valor={valor.hora}
          cor={cor}
          corBorda={tema.borda}
          onChange={(hora) => onChange({ ...valor, hora })}
        />
        <Text style={[estilos.separador, { color: cor }]}>:</Text>
        <Digitos
          rotulo={`${rotulo}: minutos`}
          valor={valor.minuto}
          cor={cor}
          corBorda={tema.borda}
          onChange={(minuto) => onChange({ ...valor, minuto })}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { alignItems: 'center', marginTop: 14 },
  rotulo: { fontSize: 16, fontWeight: '500', textTransform: 'uppercase' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  digitos: {
    width: 76,
    fontSize: 42,
    fontWeight: '400',
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingVertical: 2,
  },
  separador: { fontSize: 38, fontWeight: '500' },
});
