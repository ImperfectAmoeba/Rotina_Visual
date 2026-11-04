import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { fonteDaImagem } from '../../services/imagens';

// Mostra um ícone neutro quando não há imagem ou o arquivo não pode ser aberto.
export default function ImagemSegura({ imagem, tamanho, raio = 16 }) {
  const tema = useTheme();
  const [falhou, setFalhou] = useState(false);
  const fonte = fonteDaImagem(imagem);
  const dimensoes = { width: tamanho, height: tamanho, borderRadius: raio };

  if (!fonte || falhou) {
    return (
      <View style={[estilos.vazio, dimensoes, { backgroundColor: tema.controle.fundo }]}>
        <MaterialCommunityIcons name="image-outline" size={tamanho * 0.6} color={tema.controle.texto} />
      </View>
    );
  }
  return <Image source={fonte} style={dimensoes} resizeMode="cover" onError={() => setFalhou(true)} />;
}

const estilos = StyleSheet.create({
  vazio: { alignItems: 'center', justifyContent: 'center' },
});
