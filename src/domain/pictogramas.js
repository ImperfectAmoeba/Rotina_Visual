// Regras dos pictogramas (RF010-RF013). Funções puras.

export const CATEGORIAS_PADRAO = [
  { nome: 'Eu quero...', capa: '_categorias/01' },
  { nome: 'Eu estou...', capa: '_categorias/02' },
  { nome: 'Sensibilidade', capa: '_categorias/03' },
  { nome: 'Interação', capa: '_categorias/04' },
  { nome: 'Escola', capa: '_categorias/05' },
];

// Categorias padrão seguidas das personalizadas. Uma categoria personalizada usa como capa
// a imagem do seu primeiro pictograma.
export const listarCategorias = (pictogramas) => {
  const padrao = CATEGORIAS_PADRAO.map((c) => ({
    nome: c.nome,
    imagem: { tipo: 'padrao', ref: c.capa },
  }));
  const conhecidas = new Set(padrao.map((c) => c.nome));
  const personalizadas = [];
  for (const p of pictogramas) {
    if (!conhecidas.has(p.categoria)) {
      conhecidas.add(p.categoria);
      personalizadas.push({ nome: p.categoria, imagem: p.imagem });
    }
  }
  return [...padrao, ...personalizadas];
};

export const fraseCompleta = (pictograma) =>
  pictograma.frase?.trim() ? `${pictograma.frase.trim()} ${pictograma.nome}` : null;

export const validarPictograma = (dados) => {
  if (!dados.nome.trim()) return 'Insira a palavra do pictograma';
  if (!dados.imagem) return 'Importe uma foto para o pictograma';
  if (!dados.categoria.trim()) return 'Escolha o uso do pictograma';
  return null;
};
