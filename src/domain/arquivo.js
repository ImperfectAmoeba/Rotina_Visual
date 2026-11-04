// Formato do arquivo local e do arquivo compartilhado (RF016). Funções puras.
import { COR_PADRAO } from './cores.js';
import { dataValida, horaParaMinutos, horaValida } from './datas.js';
import { criarId } from './rotinas.js';

export const VERSAO_ARQUIVO = 1;
const TIPO_EXPORTACAO = 'rotina-visual';

export const configuracoesPadrao = () => ({
  notificacaoAtiva: false,
  notificacaoPerguntada: false,
  lembreteMinutos: 5,
  temaEscuro: false,
  corDestaque: COR_PADRAO,
});

export const dadosIniciais = (pictogramasPadrao) => ({
  versao: VERSAO_ARQUIVO,
  modo: 'edicao',
  configuracoes: configuracoesPadrao(),
  rotinas: [],
  pictogramas: pictogramasPadrao,
  concluidas: {},
});

// Garante que um arquivo salvo por outra versão tenha todos os campos esperados.
export const normalizarDados = (bruto, pictogramasPadrao) => ({
  ...dadosIniciais(pictogramasPadrao),
  ...bruto,
  configuracoes: { ...configuracoesPadrao(), ...bruto.configuracoes },
});

export const coletarImagens = (dados) => [
  ...dados.rotinas.flatMap((r) => r.atividades.map((a) => a.imagem)),
  ...dados.pictogramas.map((p) => p.imagem),
].filter((imagem) => imagem?.tipo === 'arquivo');

// Monta o conteúdo compartilhado. Configurações de tema e cor ficam de fora, e cada imagem
// do usuário vai dentro do arquivo para funcionar em outro aparelho.
export const montarExportacao = async (dados, lerBase64) => {
  const embutir = async (imagem) =>
    imagem?.tipo === 'arquivo'
      ? { tipo: 'embutida', extensao: imagem.nome.split('.').pop(), base64: await lerBase64(imagem.nome) }
      : imagem ?? null;

  const rotinas = await Promise.all(
    dados.rotinas.map(async (rotina) => ({
      ...rotina,
      atividades: await Promise.all(
        rotina.atividades.map(async (a) => ({ ...a, imagem: await embutir(a.imagem) })),
      ),
    })),
  );
  const pictogramas = await Promise.all(
    dados.pictogramas.map(async (p) => ({ ...p, imagem: await embutir(p.imagem) })),
  );
  return { tipo: TIPO_EXPORTACAO, versao: VERSAO_ARQUIVO, rotinas, pictogramas };
};

const texto = (valor) => typeof valor === 'string' && valor.trim().length > 0;

const imagemValida = (imagem) =>
  imagem === null ||
  imagem === undefined ||
  (imagem.tipo === 'padrao' && typeof imagem.ref === 'string') ||
  (imagem.tipo === 'embutida' &&
    typeof imagem.base64 === 'string' &&
    /^[a-zA-Z0-9]{1,5}$/.test(imagem.extensao ?? ''));

const atividadeValida = (a) =>
  a &&
  texto(a.id) &&
  texto(a.nome) &&
  horaValida(a.hrInicio) &&
  horaValida(a.hrTermino) &&
  horaParaMinutos(a.hrInicio) < horaParaMinutos(a.hrTermino) &&
  typeof a.atvInesperada === 'boolean' &&
  (!a.atvInesperada || dataValida(a.dataMudanca)) &&
  Array.isArray(a.substitui) &&
  imagemValida(a.imagem);

const rotinaValida = (r) =>
  r &&
  texto(r.id) &&
  texto(r.nome) &&
  Array.isArray(r.diasSemana) &&
  r.diasSemana.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) &&
  Array.isArray(r.atividades) &&
  r.atividades.every(atividadeValida);

const pictogramaValido = (p) =>
  p && texto(p.id) && texto(p.nome) && texto(p.categoria) && imagemValida(p.imagem) && p.imagem;

// Retorna os dados prontos para importar, ou null se o arquivo não for válido.
export const validarImportacao = (conteudo) => {
  let bruto;
  try {
    bruto = JSON.parse(conteudo);
  } catch {
    return null;
  }
  if (bruto?.tipo !== TIPO_EXPORTACAO || bruto.versao !== VERSAO_ARQUIVO) return null;
  if (!Array.isArray(bruto.rotinas) || !bruto.rotinas.every(rotinaValida)) return null;
  if (!Array.isArray(bruto.pictogramas) || !bruto.pictogramas.every(pictogramaValido)) return null;

  const dias = bruto.rotinas.flatMap((r) => [...new Set(r.diasSemana)]);
  if (new Set(dias).size !== dias.length) return null;

  return { rotinas: bruto.rotinas, pictogramas: bruto.pictogramas };
};

// Troca as imagens embutidas por arquivos locais; o nome é sempre gerado aqui, nunca lido do arquivo.
export const materializarImportacao = async (importado, gravarBase64) => {
  const materializar = async (imagem) => {
    if (imagem?.tipo !== 'embutida') return imagem ?? null;
    const nome = `${criarId()}.${imagem.extensao}`;
    await gravarBase64(nome, imagem.base64);
    return { tipo: 'arquivo', nome };
  };
  const rotinas = await Promise.all(
    importado.rotinas.map(async (r) => ({
      ...r,
      atividades: await Promise.all(
        r.atividades.map(async (a) => ({ ...a, imagem: await materializar(a.imagem) })),
      ),
    })),
  );
  const pictogramas = await Promise.all(
    importado.pictogramas.map(async (p) => ({ ...p, imagem: await materializar(p.imagem) })),
  );
  return { rotinas, pictogramas };
};
