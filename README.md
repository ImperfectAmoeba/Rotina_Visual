# Rotina Visual

Aplicativo para responsáveis por dependentes autistas sensíveis a mudanças na rotina. Ajuda a acompanhar o dia e destaca mudanças inesperadas, preparando o dependente com antecedência.

Feito com React Native, Expo e JavaScript. Funciona sem internet: os dados ficam em um arquivo no próprio aparelho, que pode ser compartilhado com outras pessoas.

## Como executar

```bash
npm install
npm start
```

Depois, abra o projeto no aplicativo Expo Go ou em um emulador.

## Como testar

```bash
npm test
```

Os testes cobrem as regras de negócio de `src/domain`.

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `src/pages` | Telas do aplicativo |
| `src/components` | Componentes reutilizáveis |
| `src/contexts` | Dados, tema, timer e mensagens compartilhados entre as telas |
| `src/domain` | Regras de negócio, sem dependência de tela |
| `src/services` | Acesso a recursos do aparelho: arquivos, notificações, senha e voz |
| `src/data` | Catálogo dos pictogramas padrão |
| `assets/pictogramas` | Imagens dos pictogramas padrão (veja o [LEIA-ME](assets/pictogramas/LEIA-ME.md)) |
