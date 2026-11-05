// Testes das regras de negócio. Executar com: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { contraste, criarTema, hslParaHex, hexParaHsl } from '../src/domain/cores.js';
import { formatarTempoRestante } from '../src/domain/datas.js';
import {
  atividadeAtual,
  atividadesDoDia,
  atividadesParaEdicao,
  excluirAtividadeDaRotina,
  proximosLembretes,
  salvarRotinaEmLista,
  validarAtividade,
  validarRotina,
} from '../src/domain/rotinas.js';
import {
  coletarImagens,
  materializarImportacao,
  montarExportacao,
  normalizarDados,
  precisaDoConteudoInicial,
  validarImportacao,
} from '../src/domain/arquivo.js';
import { editarCategoria, excluirCategoria, validarCategoria } from '../src/domain/pictogramas.js';

const atividade = (id, nome, hrInicio, hrTermino, extra = {}) => ({
  id, nome, hrInicio, hrTermino, atvInesperada: false, dataMudanca: null, substitui: [], imagem: null, ...extra,
});

// 2026-09-14 é uma segunda-feira.
const SEGUNDA = '2026-09-14';
const TERCA = '2026-09-15';

test('UC01: exige nome e horário coerente', () => {
  assert.equal(validarAtividade(atividade('a', ' ', '10:00', '11:00'), []), 'Insira o nome da atividade');
  assert.match(validarAtividade(atividade('a', 'X', '11:00', '10:00'), []), /^Horário inconsistente/);
  assert.match(validarAtividade(atividade('a', 'X', '25:00', '26:00'), []), /^Horário inválido/);
  assert.equal(validarAtividade(atividade('a', 'X', '10:00', '11:00'), []), null);
});

test('UC02 A1: edição sem alterações é recusada', () => {
  const original = atividade('a', 'X', '10:00', '11:00');
  assert.equal(validarAtividade({ ...original }, [], original), 'Não há mudanças a serem salvas');
});

test('atividades comuns não podem se sobrepor; horários vizinhos podem', () => {
  const outra = atividade('b', 'Almoço', '12:00', '13:00');
  assert.match(validarAtividade(atividade('a', 'X', '12:30', '14:00'), [outra]), /coincide com "Almoço"/);
  assert.equal(validarAtividade(atividade('a', 'X', '13:00', '14:00'), [outra]), null);
});

test('mudança pode sobrepor comum, mas não outra mudança na mesma data', () => {
  const comum = atividade('b', 'Almoço', '12:00', '13:00');
  const dados = { atvInesperada: true, dataMudanca: SEGUNDA };
  const outraMudanca = atividade('c', 'Médico', '12:00', '13:00', dados);
  assert.equal(validarAtividade(atividade('a', 'X', '12:00', '13:00', dados), [comum]), null);
  assert.match(validarAtividade(atividade('a', 'X', '12:00', '13:00', dados), [outraMudanca]), /coincide/);
  assert.equal(
    validarAtividade(atividade('a', 'X', '12:00', '13:00', { ...dados, dataMudanca: TERCA }), [outraMudanca]),
    null,
  );
});

test('UC04: nome e ao menos um dia são obrigatórios', () => {
  assert.equal(validarRotina({ nome: '', diasSemana: [1] }), 'Insira o nome da rotina');
  assert.equal(validarRotina({ nome: 'A', diasSemana: [] }), 'Defina ao menos um dia da semana para esta rotina');
});

test('UC04 A2: salvar remove o dia da outra rotina, que permanece salva mesmo sem dias', () => {
  const antiga = { id: 'r1', nome: 'Antiga', diasSemana: [1], atividades: [] };
  const nova = { id: 'r2', nome: 'Nova', diasSemana: [1, 2], atividades: [] };
  const resultado = salvarRotinaEmLista([antiga], nova);
  assert.equal(resultado.length, 2);
  assert.deepEqual(resultado[0].diasSemana, []);
  assert.deepEqual(resultado[1].diasSemana, [1, 2]);
});

const rotinaComMudanca = () => ({
  id: 'r',
  nome: 'R',
  diasSemana: [1, 2],
  atividades: [
    atividade('cafe', 'Café', '08:00', '08:30'),
    atividade('almoco', 'Almoço', '12:00', '13:00'),
    atividade('medico', 'Médico', '12:00', '14:00', {
      atvInesperada: true, dataMudanca: SEGUNDA, substitui: ['almoco'],
    }),
  ],
});

test('RF014: mudança vale só na data, substitui atividades e informa quais', () => {
  const dia = atividadesDoDia([rotinaComMudanca()], SEGUNDA);
  assert.deepEqual(dia.map((a) => a.id), ['cafe', 'medico']);
  assert.deepEqual(dia[1].substituidas, ['Almoço']);
  const seguinte = atividadesDoDia([rotinaComMudanca()], TERCA);
  assert.deepEqual(seguinte.map((a) => a.id), ['cafe', 'almoco']);
});

test('RF014: mudança passada some da edição e excluir atividade limpa a referência', () => {
  const nomes = (hoje) => atividadesParaEdicao(rotinaComMudanca(), hoje).map((a) => a.id);
  assert.ok(nomes(SEGUNDA).includes('medico'));
  assert.ok(!nomes(TERCA).includes('medico'));
  const semAlmoco = excluirAtividadeDaRotina(rotinaComMudanca(), 'almoco');
  assert.deepEqual(semAlmoco.atividades.find((a) => a.id === 'medico').substitui, []);
});

test('RF008: dia sem rotina resulta em lista vazia', () => {
  assert.deepEqual(atividadesDoDia([rotinaComMudanca()], '2026-09-16'), []);
});

test('RF009: atividade atual respeita início inclusivo e término exclusivo', () => {
  const rotinas = [rotinaComMudanca()];
  assert.equal(atividadeAtual(rotinas, TERCA, 8 * 60).id, 'cafe');
  assert.equal(atividadeAtual(rotinas, TERCA, 8 * 60 + 30), null);
  assert.equal(atividadeAtual(rotinas, SEGUNDA, 12 * 60).id, 'medico');
});

test('RF009: formato do tempo restante segue o protótipo', () => {
  assert.equal(formatarTempoRestante(16 * 60 + 51), '16 minutos, 51 segundos');
  assert.equal(formatarTempoRestante(3661), '1 hora, 1 minuto, 1 segundo');
});

test('RF015: lembretes futuros, com antecedência configurada e sem disparar antes do início', () => {
  const rotina = {
    id: 'r', nome: 'R', diasSemana: [1],
    atividades: [atividade('a', 'Curta', '09:00', '09:03'), atividade('b', 'Longa', '10:00', '11:00')],
  };
  const agora = new Date(2026, 8, 14, 8, 0);
  const lembretes = proximosLembretes([rotina], SEGUNDA, agora, 5).filter((l) => l.tipo === 'fim');
  assert.equal(lembretes[0].nome, 'Longa');
  assert.deepEqual(lembretes[0].quando, new Date(2026, 8, 14, 10, 55));
  assert.ok(lembretes.every((l) => l.nome !== 'Curta'));
});

test('RF015: avisa o início de cada atividade futura, inclusive as curtas', () => {
  const rotina = {
    id: 'r', nome: 'R', diasSemana: [1],
    atividades: [atividade('a', 'Curta', '09:00', '09:03'), atividade('b', 'Longa', '10:00', '11:00')],
  };
  const inicios = (agora) =>
    proximosLembretes([rotina], SEGUNDA, agora, 5)
      .filter((l) => l.tipo === 'inicio' && l.quando < new Date(2026, 8, 15))
      .map((l) => l.nome);
  assert.deepEqual(inicios(new Date(2026, 8, 14, 8, 0)), ['Curta', 'Longa']);
  assert.deepEqual(inicios(new Date(2026, 8, 14, 9, 0)), ['Longa']);
});

test('RF014: atividade substituída não avisa o início, e a mudança avisa', () => {
  const nomes = proximosLembretes([rotinaComMudanca()], SEGUNDA, new Date(2026, 8, 14, 7, 0), 5)
    .filter((l) => l.tipo === 'inicio' && l.quando < new Date(2026, 8, 15))
    .map((l) => l.nome);
  assert.deepEqual(nomes, ['Café', 'Médico']);
});

test('RF015: início e fim dividem o limite, mantendo os mais próximos', () => {
  const rotina = {
    id: 'r', nome: 'R', diasSemana: [1],
    atividades: [atividade('a', 'A', '09:00', '10:00')],
  };
  const lembretes = proximosLembretes([rotina], SEGUNDA, new Date(2026, 8, 14, 8, 0), 5, 1);
  assert.equal(lembretes.length, 1);
  assert.equal(lembretes[0].tipo, 'inicio');
});

const FOTO = { tipo: 'arquivo', nome: 'f.jpg' };
const PROVISORIA = { tipo: 'padrao', ref: 'escola/01' };

const pictoDoGrupo = (id, categoria, imagem = FOTO) => ({
  id, nome: id, categoria, frase: '', imagem,
});

test('grupos: dados antigos sem a lista ganham os grupos dos pictogramas, com capa', () => {
  const dados = normalizarDados({ rotinas: [], pictogramas: [pictoDoGrupo('p', 'Casa')] });
  assert.deepEqual(dados.categorias, [{ nome: 'Casa', imagem: FOTO }]);
});

test('grupos: um grupo sem pictogramas continua ao recarregar', () => {
  const categorias = [{ nome: 'Casa', imagem: FOTO }];
  const dados = normalizarDados({ rotinas: [], pictogramas: [], categorias });
  assert.deepEqual(dados.categorias, categorias);
});

test('conteúdo inicial: vale na primeira abertura e quando só há pictogramas provisórios', () => {
  const provisorio = pictoDoGrupo('p', 'Escola', PROVISORIA);
  assert.equal(precisaDoConteudoInicial(null), true);
  assert.equal(precisaDoConteudoInicial({ rotinas: [], pictogramas: [provisorio] }), true);
  assert.equal(precisaDoConteudoInicial({ rotinas: [], pictogramas: [provisorio, pictoDoGrupo('q', 'Casa')] }), false);
  assert.equal(precisaDoConteudoInicial({ rotinas: [{ id: 'r' }], pictogramas: [provisorio] }), false);
  // Quem excluiu tudo não recebe o conteúdo de novo.
  assert.equal(precisaDoConteudoInicial({ rotinas: [], pictogramas: [] }), false);
});

test('conteúdo inicial: src/data/padrao.json é válido e traz rotina, pictogramas e grupos', async () => {
  const texto = readFileSync(new URL('../src/data/padrao.json', import.meta.url), 'utf8');
  const importado = validarImportacao(texto);
  assert.ok(importado);
  const final = await materializarImportacao(importado, async () => {});
  assert.ok(final.rotinas.length > 0);
  assert.ok(final.pictogramas.length > 0);
  assert.ok(final.categorias.length > 0);
  assert.ok(final.categorias.every((c) => c.imagem?.tipo === 'arquivo'));
  assert.ok(final.pictogramas.every((p) => p.imagem?.tipo === 'arquivo'));
});

test('imagens provisórias saem dos dados salvos e dos arquivos antigos', () => {
  const antigo = (foto) => ({
    rotinas: [{ id: 'r', nome: 'R', diasSemana: [1], atividades: [atividade('a', 'A', '08:00', '09:00', { imagem: PROVISORIA })] }],
    pictogramas: [pictoDoGrupo('p', 'Escola', PROVISORIA), pictoDoGrupo('q', 'Casa', foto)],
    categorias: [{ nome: 'Escola', imagem: PROVISORIA }, { nome: 'Casa', imagem: PROVISORIA }],
  });
  const embutida = { tipo: 'embutida', extensao: 'jpg', base64: 'QUJD' };
  for (const [dados, foto] of [
    [normalizarDados(antigo(FOTO)), FOTO],
    [validarImportacao(JSON.stringify({ tipo: 'rotina-visual', versao: 1, ...antigo(embutida) })), embutida],
  ]) {
    assert.equal(dados.rotinas[0].atividades[0].imagem, null);
    assert.deepEqual(dados.pictogramas.map((p) => p.id), ['q']);
    assert.deepEqual(dados.categorias, [{ nome: 'Casa', imagem: foto }]);
  }
});

test('grupos: exige nome e capa, e recusa nome repetido ignorando maiúsculas', () => {
  const capa = FOTO;
  const grupos = [{ nome: 'Casa', imagem: capa }, { nome: 'Escola', imagem: capa }];
  assert.equal(validarCategoria({ nome: ' ', imagem: capa }, grupos), 'Insira o nome do grupo');
  assert.equal(validarCategoria({ nome: 'Novo', imagem: null }, grupos), 'Importe uma foto de capa para o grupo');
  assert.equal(validarCategoria({ nome: ' escola ', imagem: capa }, grupos), 'Já existe um grupo com este nome');
  assert.equal(validarCategoria({ nome: 'Novo', imagem: capa }, grupos), null);
  assert.equal(validarCategoria({ nome: 'casa', imagem: capa }, grupos, 'Casa'), null);
  assert.equal(validarCategoria({ nome: 'Escola', imagem: capa }, grupos, 'Casa'), 'Já existe um grupo com este nome');
});

test('grupos: renomear leva os pictogramas junto e excluir remove só os do grupo', () => {
  const capa = FOTO;
  const dados = {
    categorias: [{ nome: 'Casa', imagem: capa }, { nome: 'Escola', imagem: capa }],
    pictogramas: [pictoDoGrupo('a', 'Casa'), pictoDoGrupo('b', 'Escola')],
  };
  const editado = editarCategoria(dados, 'Casa', { nome: 'Lar', imagem: capa });
  assert.deepEqual(editado.categorias.map((c) => c.nome), ['Lar', 'Escola']);
  assert.deepEqual(editado.pictogramas.map((p) => p.categoria), ['Lar', 'Escola']);
  const excluido = excluirCategoria(dados, 'Casa');
  assert.deepEqual(excluido.categorias.map((c) => c.nome), ['Escola']);
  assert.deepEqual(excluido.pictogramas.map((p) => p.id), ['b']);
});

test('grupos: a capa conta como imagem em uso e viaja no arquivo exportado', async () => {
  const dados = {
    rotinas: [],
    pictogramas: [],
    categorias: [{ nome: 'Casa', imagem: { tipo: 'arquivo', nome: 'capa.jpg' } }],
  };
  assert.deepEqual(coletarImagens(dados).map((i) => i.nome), ['capa.jpg']);
  const exportado = await montarExportacao(dados, async () => 'QUJD');
  const importado = validarImportacao(JSON.stringify(exportado));
  const final = await materializarImportacao(importado, async () => {});
  assert.equal(final.categorias[0].nome, 'Casa');
  assert.equal(final.categorias[0].imagem.tipo, 'arquivo');
  assert.notEqual(final.categorias[0].imagem.nome, 'capa.jpg');
});

test('grupos: arquivo antigo é aceito, e grupo sem capa é recusado', () => {
  const base = { tipo: 'rotina-visual', versao: 1, rotinas: [], pictogramas: [] };
  assert.deepEqual(validarImportacao(JSON.stringify(base)).categorias, []);
  const semCapa = { ...base, categorias: [{ nome: 'Casa', imagem: null }] };
  assert.equal(validarImportacao(JSON.stringify(semCapa)), null);
});

test('RNF004: toda combinação de cor gerada mantém contraste mínimo', () => {
  for (const escuro of [false, true]) {
    for (let h = 0; h < 360; h += 15) {
      for (const s of [0, 40, 100]) {
        for (const l of [5, 25, 50, 75, 95]) {
          const tema = criarTema(hslParaHex({ h, s, l }), escuro);
          for (const papel of ['fundo', 'cabecalho', 'linha', 'cartao', 'controle', 'pilula', 'mudanca', 'pilulaMudanca', 'perigo']) {
            const { fundo, texto, textoSuave } = tema[papel];
            assert.ok(contraste(fundo, texto) >= 4.5, `${papel} ${h}/${s}/${l}`);
            assert.ok(contraste(fundo, textoSuave) >= 4.5, `${papel} suave ${h}/${s}/${l}`);
          }
        }
      }
    }
  }
});

test('conversão de cores é consistente', () => {
  assert.equal(hslParaHex(hexParaHsl('#8FD0F5')), '#8FD0F5');
});

test('RF016: exportar e importar preserva dados e embute imagens', async () => {
  const dados = {
    rotinas: [{ id: 'r', nome: 'R', diasSemana: [1], atividades: [atividade('a', 'A', '08:00', '09:00', { imagem: { tipo: 'arquivo', nome: 'x.jpg' } })] }],
    pictogramas: [
      { id: 'p1', nome: 'Água', categoria: 'Eu quero...', frase: 'Eu quero', imagem: { tipo: 'arquivo', nome: 'z.png' } },
      { id: 'p2', nome: 'Bola', categoria: 'Escola', frase: '', imagem: { tipo: 'arquivo', nome: 'y.png' } },
    ],
    categorias: [
      { nome: 'Eu quero...', imagem: { tipo: 'arquivo', nome: 'c1.png' } },
      { nome: 'Escola', imagem: { tipo: 'arquivo', nome: 'c2.png' } },
    ],
    configuracoes: { corDestaque: '#000000' },
  };
  const exportado = await montarExportacao(dados, async (nome) => `base64-${nome}`.replace(/[^a-z0-9]/gi, ''));
  assert.equal(exportado.configuracoes, undefined);

  const importado = validarImportacao(JSON.stringify(exportado));
  assert.ok(importado);
  const gravados = [];
  const final = await materializarImportacao(importado, async (nome, b64) => gravados.push([nome, b64]));
  assert.equal(gravados.length, 5);
  assert.equal(final.rotinas[0].atividades[0].imagem.tipo, 'arquivo');
  assert.equal(final.pictogramas[0].imagem.tipo, 'arquivo');
});

test('RF016: recusa arquivo inválido, extensão suspeita ou dois dias repetidos', () => {
  const base = { tipo: 'rotina-visual', versao: 1, rotinas: [], pictogramas: [] };
  assert.equal(validarImportacao('não é json'), null);
  assert.equal(validarImportacao(JSON.stringify({ ...base, tipo: 'outro' })), null);
  assert.ok(validarImportacao(JSON.stringify(base)));
  const pictoRuim = {
    id: 'p', nome: 'P', categoria: 'C',
    imagem: { tipo: 'embutida', extensao: '../../x', base64: 'AA' },
  };
  assert.equal(validarImportacao(JSON.stringify({ ...base, pictogramas: [pictoRuim] })), null);
  const r = (id) => ({ id, nome: id, diasSemana: [1], atividades: [] });
  assert.equal(validarImportacao(JSON.stringify({ ...base, rotinas: [r('a'), r('b')] })), null);
});
