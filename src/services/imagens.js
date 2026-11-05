// Imagens escolhidas pelo usuário ficam em uma pasta própria, e os dados guardam só o nome do
// arquivo: o caminho completo do app pode mudar entre instalações.
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { coletarImagens } from '../domain/arquivo';
import { criarId } from '../domain/rotinas';
import { pastaImagens, verificarEspaco } from './armazenamento';

export const fonteDaImagem = (imagem) => {
  if (imagem?.tipo === 'arquivo') return { uri: new File(pastaImagens(), imagem.nome).uri };
  return null;
};

export const escolherImagem = async () => {
  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (resultado.canceled) return null;
  const origem = new File(resultado.assets[0].uri);
  verificarEspaco(origem.size ?? 0);
  const extensao = origem.extension.replace('.', '').toLowerCase() || 'jpg';
  const nome = `${criarId()}.${extensao}`;
  origem.copy(new File(pastaImagens(), nome));
  return { tipo: 'arquivo', nome };
};

export const lerImagemBase64 = (nome) => new File(pastaImagens(), nome).base64();

export const gravarImagemBase64 = async (nome, base64) => {
  verificarEspaco(base64.length);
  const arquivo = new File(pastaImagens(), nome);
  arquivo.create({ overwrite: true });
  arquivo.write(base64, { encoding: 'base64' });
};

// Remove imagens que nenhuma atividade ou pictograma usa mais.
export const limparImagensSemUso = (dados) => {
  const emUso = new Set(coletarImagens(dados).map((imagem) => imagem.nome));
  for (const item of pastaImagens().list()) {
    if (item instanceof File && !emUso.has(item.name)) item.delete();
  }
};
