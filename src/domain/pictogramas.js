// Regras dos pictogramas (RF010-RF013). Funções puras.

// Monta a lista de grupos de dados que ainda não a têm (salvos antes de os grupos terem capa
// própria) ou que a têm incompleta: o grupo que falta usa a imagem do seu primeiro pictograma.
export const completarCategorias = (categorias, pictogramas) => {
  const lista = [...(categorias ?? [])];
  const conhecidas = new Set(lista.map((c) => c.nome));
  for (const p of pictogramas) {
    if (!conhecidas.has(p.categoria)) {
      conhecidas.add(p.categoria);
      lista.push({ nome: p.categoria, imagem: p.imagem });
    }
  }
  return lista;
};

const mesmoNome = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

// "nomeOriginal" é o nome atual do grupo em edição; nulo significa grupo novo.
export const validarCategoria = (categoria, categorias, nomeOriginal = null) => {
  if (!categoria.nome.trim()) return 'Insira o nome do grupo';
  if (!categoria.imagem) return 'Importe uma foto de capa para o grupo';
  const repetida = categorias.some((c) => c.nome !== nomeOriginal && mesmoNome(c.nome, categoria.nome));
  return repetida ? 'Já existe um grupo com este nome' : null;
};

// Os pictogramas guardam o nome do grupo; renomear precisa levá-los junto.
export const editarCategoria = (dados, nomeOriginal, categoria) => ({
  ...dados,
  categorias: dados.categorias.map((c) => (c.nome === nomeOriginal ? categoria : c)),
  pictogramas: dados.pictogramas.map((p) =>
    p.categoria === nomeOriginal ? { ...p, categoria: categoria.nome } : p,
  ),
});

export const excluirCategoria = (dados, nome) => ({
  ...dados,
  categorias: dados.categorias.filter((c) => c.nome !== nome),
  pictogramas: dados.pictogramas.filter((p) => p.categoria !== nome),
});

export const fraseCompleta = (pictograma) =>
  pictograma.frase?.trim() ? `${pictograma.frase.trim()} ${pictograma.nome}` : null;

export const validarPictograma = (dados) => {
  if (!dados.nome.trim()) return 'Insira a palavra do pictograma';
  if (!dados.imagem) return 'Importe uma foto para o pictograma';
  if (!dados.categoria.trim()) return 'Escolha o uso do pictograma';
  return null;
};
