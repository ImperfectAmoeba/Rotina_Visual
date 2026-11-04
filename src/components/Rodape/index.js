import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDados } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useModo } from '../../hooks/useModo';

function BotaoLateral({ rotulo, onPress, desativado, children }) {
  const tema = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: !!desativado }}
      disabled={desativado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.lateral,
        { backgroundColor: tema.controle.fundo, opacity: desativado ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      {children}
      <Text numberOfLines={1} adjustsFontSizeToFit style={[estilos.rotulo, { color: tema.controle.texto }]}>
        {rotulo}
      </Text>
    </Pressable>
  );
}

// Rodapé fixo das telas. "centro" recebe { icone | texto, rotulo, onPress, desativado }.
export default function Rodape({ centro, pictogramasDesativado, aoVerRotina }) {
  const tema = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { dados, rotinaTocadaId } = useDados();
  const { modo, entrarVisualizacao, sairVisualizacao } = useModo();
  const corIcone = tema.controle.texto;
  const rotinaTocada = dados.rotinas.some((r) => r.id === rotinaTocadaId);
  const superficieCentro = tema.pilula;

  return (
    <View style={[estilos.rodape, { backgroundColor: tema.fundo.fundo, paddingBottom: insets.bottom + 12 }]}>
      {modo === 'edicao' ? (
        <BotaoLateral
          rotulo="VER ROTINA"
          desativado={!rotinaTocada}
          onPress={aoVerRotina ?? entrarVisualizacao}
        >
          <View style={estilos.iconeDuplo}>
            <MaterialCommunityIcons name="account" size={34} color={corIcone} style={estilos.pessoa} />
            <MaterialCommunityIcons name="puzzle" size={22} color={corIcone} style={estilos.peca} />
          </View>
        </BotaoLateral>
      ) : (
        <BotaoLateral rotulo="MODO EDIÇÃO" onPress={sairVisualizacao}>
          <MaterialCommunityIcons name="pencil" size={34} color={corIcone} />
        </BotaoLateral>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={centro.rotulo}
        accessibilityState={{ disabled: !!centro.desativado }}
        disabled={centro.desativado}
        onPress={centro.onPress}
        style={({ pressed }) => [
          estilos.centro,
          {
            backgroundColor: superficieCentro.fundo,
            opacity: centro.desativado ? 0.35 : pressed ? 0.75 : 1,
          },
        ]}
      >
        {centro.icone ? (
          <MaterialCommunityIcons name={centro.icone} size={32} color={superficieCentro.texto} />
        ) : (
          <Text style={[estilos.textoCentro, { color: superficieCentro.texto }]}>{centro.texto}</Text>
        )}
      </Pressable>

      <BotaoLateral
        rotulo="PICTOGRAMAS"
        desativado={pictogramasDesativado}
        onPress={() => navigation.navigate('Pictogramas')}
      >
        <MaterialCommunityIcons name="image-outline" size={34} color={corIcone} />
      </BotaoLateral>
    </View>
  );
}

const estilos = StyleSheet.create({
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  lateral: {
    flex: 1,
    minHeight: 76,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
    elevation: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
  },
  rotulo: { fontSize: 13, fontWeight: '800', marginTop: 2 },
  iconeDuplo: { width: 48, height: 36 },
  pessoa: { position: 'absolute', right: 2, top: 0 },
  peca: { position: 'absolute', left: 4, bottom: 0 },
  centro: {
    width: 78,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
  },
  textoCentro: { fontSize: 20, fontWeight: '800' },
});
