// Catálogo dos pictogramas que vêm com o app. Instruções em assets/pictogramas/LEIA-ME.md.

// O Metro exige caminhos literais em require(); por isso a lista é explícita.
export const IMAGENS_PADRAO = {
  '_categorias/01': require('../../assets/pictogramas/_categorias/01.png'),
  '_categorias/02': require('../../assets/pictogramas/_categorias/02.png'),
  '_categorias/03': require('../../assets/pictogramas/_categorias/03.png'),
  '_categorias/04': require('../../assets/pictogramas/_categorias/04.png'),
  '_categorias/05': require('../../assets/pictogramas/_categorias/05.png'),
  'eu_quero/01': require('../../assets/pictogramas/eu_quero/01.png'),
  'eu_quero/02': require('../../assets/pictogramas/eu_quero/02.png'),
  'eu_quero/03': require('../../assets/pictogramas/eu_quero/03.png'),
  'eu_quero/04': require('../../assets/pictogramas/eu_quero/04.png'),
  'eu_quero/05': require('../../assets/pictogramas/eu_quero/05.png'),
  'eu_estou/01': require('../../assets/pictogramas/eu_estou/01.png'),
  'eu_estou/02': require('../../assets/pictogramas/eu_estou/02.png'),
  'eu_estou/03': require('../../assets/pictogramas/eu_estou/03.png'),
  'eu_estou/04': require('../../assets/pictogramas/eu_estou/04.png'),
  'eu_estou/05': require('../../assets/pictogramas/eu_estou/05.png'),
  'sensibilidade/01': require('../../assets/pictogramas/sensibilidade/01.png'),
  'sensibilidade/02': require('../../assets/pictogramas/sensibilidade/02.png'),
  'sensibilidade/03': require('../../assets/pictogramas/sensibilidade/03.png'),
  'sensibilidade/04': require('../../assets/pictogramas/sensibilidade/04.png'),
  'sensibilidade/05': require('../../assets/pictogramas/sensibilidade/05.png'),
  'interacao/01': require('../../assets/pictogramas/interacao/01.png'),
  'interacao/02': require('../../assets/pictogramas/interacao/02.png'),
  'interacao/03': require('../../assets/pictogramas/interacao/03.png'),
  'interacao/04': require('../../assets/pictogramas/interacao/04.png'),
  'interacao/05': require('../../assets/pictogramas/interacao/05.png'),
  'escola/01': require('../../assets/pictogramas/escola/01.png'),
  'escola/02': require('../../assets/pictogramas/escola/02.png'),
  'escola/03': require('../../assets/pictogramas/escola/03.png'),
  'escola/04': require('../../assets/pictogramas/escola/04.png'),
  'escola/05': require('../../assets/pictogramas/escola/05.png'),
};

const pictograma = (pasta, numero, categoria, frase, nome) => ({
  id: `padrao-${pasta}-${numero}`,
  nome: nome ?? `Pictograma ${numero}`,
  categoria,
  frase,
  imagem: { tipo: 'padrao', ref: `${pasta}/${numero}` },
});

const grupo = (pasta, categoria, frase, nomes) =>
  nomes.map((nome, i) => pictograma(pasta, String(i + 1).padStart(2, '0'), categoria, frase, nome));

// Primeira carga do app. "null" mantém o nome provisório até a palavra ser definida.
export const criarPictogramasPadrao = () => [
  ...grupo('eu_quero', 'Eu quero...', 'Eu quero', ['Água', 'Comida', 'Doce', 'Suco', 'Brincar']),
  ...grupo('eu_estou', 'Eu estou...', 'Eu estou', ['Feliz', null, null, null, null]),
  ...grupo('sensibilidade', 'Sensibilidade', '', [null, null, null, null, null]),
  ...grupo('interacao', 'Interação', '', [null, null, null, null, null]),
  ...grupo('escola', 'Escola', '', [null, null, null, null, null]),
];
