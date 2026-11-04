// Regras de rotinas e atividades (RF001-RF009, RF014, UC01-UC04). Funções puras.
import { diaDaSemana, horaParaMinutos, horaValida, instante, somarDias } from './datas.js';

export const DIAS_SEMANA = [
  { valor: 1, rotulo: 'SEG.' },
  { valor: 2, rotulo: 'TER.' },
  { valor: 3, rotulo: 'QUA.' },
  { valor: 4, rotulo: 'QUI.' },
  { valor: 5, rotulo: 'SEX.' },
  { valor: 6, rotulo: 'SÁB.' },
  { valor: 0, rotulo: 'DOM.' },
];

export const criarId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const ordenarAtividades = (atividades) =>
  [...atividades].sort(
    (a, b) => horaParaMinutos(a.hrInicio) - horaParaMinutos(b.hrInicio) || a.nome.localeCompare(b.nome),
  );

export const horariosSobrepostos = (a, b) =>
  horaParaMinutos(a.hrInicio) < horaParaMinutos(b.hrTermino) &&
  horaParaMinutos(b.hrInicio) < horaParaMinutos(a.hrTermino);

// Atividades comuns que uma mudança na rotina pode substituir (sugeridas ao responsável).
export const atividadesSubstituiveis = (mudanca, atividades) =>
  ordenarAtividades(
    atividades.filter(
      (a) => a.id !== mudanca.id && !a.atvInesperada && horariosSobrepostos(a, mudanca),
    ),
  );

const mesmaImagem = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const atividadeSemMudancas = (dados, original) =>
  dados.nome === original.nome &&
  dados.hrInicio === original.hrInicio &&
  dados.hrTermino === original.hrTermino &&
  dados.dataMudanca === original.dataMudanca &&
  mesmaImagem(dados.imagem, original.imagem) &&
  [...dados.substitui].sort().join() === [...original.substitui].sort().join();

// Retorna a mensagem de erro a ser exibida, ou null quando a atividade é válida.
export const validarAtividade = (dados, outrasAtividades, original = null) => {
  if (!dados.nome.trim()) return 'Insira o nome da atividade';
  if (!horaValida(dados.hrInicio) || !horaValida(dados.hrTermino)) {
    return 'Horário inválido. Use horas de 00 a 23 e minutos de 00 a 59.';
  }
  if (horaParaMinutos(dados.hrInicio) >= horaParaMinutos(dados.hrTermino)) {
    return 'Horário inconsistente, o início não pode ocorrer após o término';
  }
  if (original && atividadeSemMudancas(dados, original)) return 'Não há mudanças a serem salvas';

  const conflito = outrasAtividades.find((outra) => {
    if (outra.id === dados.id || !horariosSobrepostos(outra, dados)) return false;
    if (dados.atvInesperada) return outra.atvInesperada && outra.dataMudanca === dados.dataMudanca;
    return !outra.atvInesperada;
  });
  return conflito ? `Este horário coincide com "${conflito.nome}". Escolha outro horário.` : null;
};

// Rotinas que perderiam um dia ao salvar (UC04, A2).
export const rotinasEmConflito = (rotinas, rotinaId, dias) =>
  rotinas.filter((r) => r.id !== rotinaId && r.diasSemana.some((d) => dias.includes(d)));

export const validarRotina = (rotina) => {
  if (!rotina.nome.trim()) return 'Insira o nome da rotina';
  if (rotina.diasSemana.length === 0) return 'Defina ao menos um dia da semana para esta rotina';
  return null;
};

// Salva a rotina e remove seus dias das demais: nunca há duas rotinas no mesmo dia (RF004).
// A rotina que ficar sem dias continua salva (decisão de projeto).
export const salvarRotinaEmLista = (rotinas, rotina) => {
  const semConflito = rotinas.map((r) =>
    r.id === rotina.id
      ? r
      : { ...r, diasSemana: r.diasSemana.filter((d) => !rotina.diasSemana.includes(d)) },
  );
  return semConflito.some((r) => r.id === rotina.id)
    ? semConflito.map((r) => (r.id === rotina.id ? rotina : r))
    : [...semConflito, rotina];
};

export const excluirAtividadeDaRotina = (rotina, atividadeId) => ({
  ...rotina,
  atividades: rotina.atividades
    .filter((a) => a.id !== atividadeId)
    .map((a) => ({ ...a, substitui: a.substitui.filter((id) => id !== atividadeId) })),
});

export const salvarAtividadeNaRotina = (rotina, atividade) => {
  const existe = rotina.atividades.some((a) => a.id === atividade.id);
  return {
    ...rotina,
    atividades: existe
      ? rotina.atividades.map((a) => (a.id === atividade.id ? atividade : a))
      : [...rotina.atividades, atividade],
  };
};

const nomesSubstituidos = (mudanca, atividades) =>
  mudanca.substitui
    .map((id) => atividades.find((a) => a.id === id)?.nome)
    .filter(Boolean);

// Atividades visíveis na tela de edição: mudanças de dias passados não aparecem mais (RF014).
export const atividadesParaEdicao = (rotina, hoje) =>
  ordenarAtividades(
    rotina.atividades.filter((a) => !a.atvInesperada || a.dataMudanca >= hoje),
  ).map((a) => ({
    ...a,
    substituidas: a.atvInesperada ? nomesSubstituidos(a, rotina.atividades) : [],
  }));

export const rotinaDoDia = (rotinas, data) => {
  const dia = diaDaSemana(data);
  return rotinas.find((r) => r.diasSemana.includes(dia)) ?? null;
};

// Monta o dia: atividades da rotina daquele dia da semana, mais as mudanças marcadas para
// aquela data. As atividades substituídas saem da lista e são informadas na mudança.
export const atividadesDoDia = (rotinas, data) => {
  const rotina = rotinaDoDia(rotinas, data);
  const comuns = rotina ? rotina.atividades.filter((a) => !a.atvInesperada) : [];
  const mudancas = rotinas.flatMap((r) =>
    r.atividades
      .filter((a) => a.atvInesperada && a.dataMudanca === data)
      .map((a) => ({ ...a, substituidas: nomesSubstituidos(a, r.atividades) })),
  );
  const substituidas = new Set(mudancas.flatMap((m) => m.substitui));
  return ordenarAtividades([
    ...comuns.filter((a) => !substituidas.has(a.id)).map((a) => ({ ...a, substituidas: [] })),
    ...mudancas,
  ]);
};

// Atividade em andamento (RF009); havendo sobreposição, a mudança na rotina tem prioridade.
export const atividadeAtual = (rotinas, data, minutos) => {
  const emAndamento = atividadesDoDia(rotinas, data).filter(
    (a) => horaParaMinutos(a.hrInicio) <= minutos && minutos < horaParaMinutos(a.hrTermino),
  );
  return emAndamento.find((a) => a.atvInesperada) ?? emAndamento[0] ?? null;
};

// Lembretes dos próximos dias, em ordem, respeitando o limite do sistema operacional (RF015).
export const proximosLembretes = (rotinas, hojeChave, agora, minutosAntes, limite = 60) => {
  const lembretes = [];
  for (let i = 0; i < 7; i += 1) {
    const data = somarDias(hojeChave, i);
    for (const atividade of atividadesDoDia(rotinas, data)) {
      const inicio = instante(data, atividade.hrInicio);
      const quando = new Date(instante(data, atividade.hrTermino).getTime() - minutosAntes * 60000);
      if (quando > agora && quando > inicio) {
        lembretes.push({ quando, nome: atividade.nome });
      }
    }
  }
  return lembretes.sort((a, b) => a.quando - b.quando).slice(0, limite);
};
