// Guarda os dados do app em um único arquivo JSON no aparelho (RNF007).
import { Directory, File, Paths } from 'expo-file-system';

const NOME_ARQUIVO = 'rotina_visual.json';
const NOME_TEMPORARIO = 'rotina_visual.tmp.json';
const MARGEM_SEGURANCA = 1024 * 1024;

export class ArmazenamentoCheioError extends Error {}

const arquivoPrincipal = () => new File(Paths.document, NOME_ARQUIVO);
const arquivoTemporario = () => new File(Paths.document, NOME_TEMPORARIO);

let pasta = null;

export const pastaImagens = () => {
  if (!pasta) {
    pasta = new Directory(Paths.document, 'imagens');
    pasta.create({ idempotent: true, intermediates: true });
  }
  return pasta;
};

export const verificarEspaco = (bytesNecessarios) => {
  if (Paths.availableDiskSpace < bytesNecessarios + MARGEM_SEGURANCA) {
    throw new ArmazenamentoCheioError();
  }
};

// Retorna null na primeira abertura. Um arquivo corrompido é preservado ao lado, e o app recomeça.
export const carregarDados = async () => {
  const principal = arquivoPrincipal();
  const temporario = arquivoTemporario();
  const origem = principal.exists ? principal : temporario.exists ? temporario : null;
  if (!origem) return null;
  try {
    return JSON.parse(await origem.text());
  } catch {
    const copia = new File(Paths.document, `rotina_visual.corrompido.${Date.now()}.json`);
    origem.move(copia);
    return null;
  }
};

// Grava em um arquivo temporário antes de trocar o principal, para uma falha não apagar os dados.
export const salvarDados = (dados) => {
  const conteudo = JSON.stringify(dados);
  verificarEspaco(conteudo.length * 2);
  const temporario = arquivoTemporario();
  temporario.create({ overwrite: true });
  temporario.write(conteudo);
  const principal = arquivoPrincipal();
  if (principal.exists) principal.delete();
  temporario.move(principal);
};
