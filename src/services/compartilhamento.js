// Compartilhar, baixar e importar o arquivo de rotinas entre aparelhos (RF016).
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { materializarImportacao, montarExportacao, validarImportacao } from '../domain/arquivo';
import { dataParaChave } from '../domain/datas';
import { verificarEspaco } from './armazenamento';
import { gravarImagemBase64, lerImagemBase64 } from './imagens';

// Pasta em que os seletores do Android abrem. O iOS não oferece uma pasta Downloads equivalente
// e abre no último local usado.
const PASTA_INICIAL = Platform.OS === 'android'
  ? 'content://com.android.externalstorage.documents/document/primary%3ADownload'
  : undefined;

const TIPO_ARQUIVO = 'application/json';

const nomeDoArquivo = () => `rotina-visual-${dataParaChave(new Date())}.json`;

const gerarConteudo = async (dados) => {
  const conteudo = JSON.stringify(await montarExportacao(dados, lerImagemBase64));
  verificarEspaco(conteudo.length * 2);
  return conteudo;
};

const abrirFolhaDeCompartilhamento = async (conteudo, titulo) => {
  const arquivo = new File(Paths.cache, nomeDoArquivo());
  arquivo.create({ overwrite: true });
  arquivo.write(conteudo);
  await Sharing.shareAsync(arquivo.uri, {
    mimeType: TIPO_ARQUIVO,
    dialogTitle: titulo,
    UTI: 'public.json',
  });
};

// Os seletores nativos rejeitam a promessa quando o usuário cancela.
const foiCancelado = (erro) => /cancel/i.test(`${erro?.code} ${erro?.message}`);

export const compartilharRotinas = async (dados) => {
  await abrirFolhaDeCompartilhamento(await gerarConteudo(dados), 'Compartilhar rotina');
};

// Retorna true quando o app gravou o arquivo. No iOS o salvamento é feito pela opção
// "Salvar em Arquivos" da folha do sistema, e o app não recebe a confirmação.
export const baixarRotinas = async (dados) => {
  const conteudo = await gerarConteudo(dados);
  if (Platform.OS !== 'android') {
    await abrirFolhaDeCompartilhamento(conteudo, 'Baixar rotina');
    return false;
  }
  let pasta;
  try {
    pasta = await Directory.pickDirectoryAsync(PASTA_INICIAL);
  } catch (erro) {
    if (foiCancelado(erro)) return false;
    throw erro;
  }
  pasta.createFile(nomeDoArquivo(), TIPO_ARQUIVO).write(conteudo);
  return true;
};

// Retorna { cancelado: true } ou { importado } com os dados já validados, ainda sem aplicá-los.
export const escolherArquivoImportacao = async () => {
  let arquivo;
  try {
    arquivo = await File.pickFileAsync(PASTA_INICIAL);
  } catch (erro) {
    if (foiCancelado(erro)) return { cancelado: true };
    throw erro;
  }
  return { importado: validarImportacao(await arquivo.text()) };
};

export const prepararImportacao = (importado) =>
  materializarImportacao(importado, gravarImagemBase64);
