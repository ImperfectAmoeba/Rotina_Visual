// Gera toda a paleta do app a partir de uma única cor de destaque (RF018),
// garantindo o contraste mínimo de 4,5:1 exigido pelo RNF004.

export const COR_PADRAO = '#8FD0F5';

export const CORES_SUGERIDAS = ['#8FD0F5', '#A5D6A7', '#FFE082', '#FFAB91', '#F48FB1', '#CE93D8', '#80CBC4'];

const limitar = (valor, min, max) => Math.min(max, Math.max(min, valor));

export const corValida = (cor) => typeof cor === 'string' && /^#[0-9a-fA-F]{6}$/.test(cor);

const hexParaRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const rgbParaHex = (rgb) =>
  `#${rgb.map((c) => Math.round(limitar(c, 0, 255)).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

export const hexParaHsl = (hex) => {
  const [r, g, b] = hexParaRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d + 6) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
};

export const hslParaHex = ({ h, s, l }) => {
  const sat = limitar(s, 0, 100) / 100;
  const lum = limitar(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * lum - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lum - c / 2;
  const setor = Math.floor(((h % 360) + 360) % 360 / 60);
  const base = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][setor];
  return rgbParaHex(base.map((v) => (v + m) * 255));
};

const misturar = (a, b, pesoB) => {
  const ca = hexParaRgb(a);
  const cb = hexParaRgb(b);
  return rgbParaHex(ca.map((v, i) => v + (cb[i] - v) * pesoB));
};

const luminancia = (hex) => {
  const [r, g, b] = hexParaRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contraste = (a, b) => {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

// Preto ou branco: em qualquer fundo, um dos dois sempre passa de 4,5:1.
export const textoSobre = (fundo) =>
  contraste(fundo, '#000000') >= contraste(fundo, '#FFFFFF') ? '#000000' : '#FFFFFF';

// Tom suavizado para textos secundários, sem cair abaixo do mínimo.
const textoSuave = (fundo) => {
  const texto = textoSobre(fundo);
  for (const peso of [0.3, 0.2, 0.1]) {
    const cor = misturar(texto, fundo, peso);
    if (contraste(cor, fundo) >= 4.5) return cor;
  }
  return texto;
};

const superficie = (fundo) => ({ fundo, texto: textoSobre(fundo), textoSuave: textoSuave(fundo) });

export const criarTema = (corDestaque, escuro) => {
  const destaque = corValida(corDestaque) ? corDestaque : COR_PADRAO;
  const { h, s } = hexParaHsl(destaque);
  const tom = (saturacao, luz) => hslParaHex({ h, s: Math.min(s, saturacao), l: luz });

  const papeis = escuro
    ? {
        fundo: tom(25, 8),
        cabecalho: tom(35, 22),
        linha: tom(30, 15),
        cartao: tom(25, 12),
        controle: tom(30, 25),
        pilula: destaque,
        mudanca: tom(100, 85),
        pilulaMudanca: tom(70, 25),
        forte: destaque,
      }
    : {
        fundo: '#FFFFFF',
        cabecalho: misturar(destaque, '#FFFFFF', 0.25),
        linha: misturar(destaque, '#FFFFFF', 0.78),
        cartao: '#FFFFFF',
        controle: misturar(destaque, '#FFFFFF', 0.6),
        pilula: destaque,
        mudanca: tom(70, 22),
        pilulaMudanca: misturar(destaque, '#FFFFFF', 0.7),
        forte: destaque,
      };

  const tema = { escuro, destaque, perigo: superficie(escuro ? '#EF9A9A' : '#B3261E') };
  for (const [papel, fundo] of Object.entries(papeis)) tema[papel] = superficie(fundo);
  tema.borda = misturar(tema.fundo.fundo, tema.fundo.texto, 0.45);
  tema.veu = 'rgba(0,0,0,0.55)';
  return tema;
};
