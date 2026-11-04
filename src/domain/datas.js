// Utilitários de data e hora. Horários são sempre 'HH:MM' e datas 'AAAA-MM-DD' (hora local).

const doisDigitos = (n) => String(n).padStart(2, '0');

export const dataParaChave = (data) =>
  `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;

export const chaveParaData = (chave) => {
  const [ano, mes, dia] = chave.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
};

export const somarDias = (chave, dias) => {
  const data = chaveParaData(chave);
  data.setDate(data.getDate() + dias);
  return dataParaChave(data);
};

export const formatarData = (chave) => {
  const [ano, mes, dia] = chave.split('-');
  return `${dia}/${mes}/${ano}`;
};

// 0 = domingo ... 6 = sábado, igual a Date.getDay().
export const diaDaSemana = (chave) => chaveParaData(chave).getDay();

export const horaParaMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

export const minutosDoDia = (agora) => agora.getHours() * 60 + agora.getMinutes();

export const horaValida = (hora) => /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);

export const dataValida = (chave) =>
  /^\d{4}-\d{2}-\d{2}$/.test(chave) && dataParaChave(chaveParaData(chave)) === chave;

// Instante exato de um horário em uma data.
export const instante = (chave, hora) => {
  const data = chaveParaData(chave);
  const [h, m] = hora.split(':').map(Number);
  data.setHours(h, m, 0, 0);
  return data;
};

export const formatarTempoRestante = (totalSegundos) => {
  const total = Math.max(0, Math.ceil(totalSegundos));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segundos = total % 60;
  const partes = [];
  if (horas > 0) partes.push(`${horas} ${horas === 1 ? 'hora' : 'horas'}`);
  if (horas > 0 || minutos > 0) partes.push(`${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`);
  partes.push(`${segundos} ${segundos === 1 ? 'segundo' : 'segundos'}`);
  return partes.join(', ');
};
