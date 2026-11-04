// Compartilhar e importar o arquivo de rotinas entre aparelhos (RF016).
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { materializarImportacao, montarExportacao, validarImportacao } from '../domain/arquivo';
import { dataParaChave } from '../domain/datas';
import { verificarEspaco } from './armazenamento';
import { gravarImagemBase64, lerImagemBase64 } from './imagens';

export const compartilharRotinas = async (dados) => {
  const conteudo = JSON.stringify(await montarExportacao(dados, lerImagemBase64));
  verificarEspaco(conteudo.length * 2);
  const arquivo = new File(Paths.cache, `rotina-visual-${dataParaChave(new Date())}.json`);
  arquivo.create({ overwrite: true });
  arquivo.write(conteudo);
  await Sharing.shareAsync(arquivo.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Compartilhar rotina',
    UTI: 'public.json',
  });
};

// Retorna { cancelado: true } ou { importado } com os dados já validados, ainda sem aplicá-los.
export const escolherArquivoImportacao = async () => {
  const resultado = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'application/octet-stream'],
    copyToCacheDirectory: true,
  });
  if (resultado.canceled) return { cancelado: true };
  const importado = validarImportacao(await new File(resultado.assets[0].uri).text());
  return { importado };
};

export const prepararImportacao = (importado) =>
  materializarImportacao(importado, gravarImagemBase64);
