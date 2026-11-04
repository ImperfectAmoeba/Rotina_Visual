# Pictogramas padrão

Todas as imagens desta pasta são **placeholders**. Cada uma mostra a própria pasta e o número da ordem.

Para trocar uma imagem, substitua o arquivo mantendo **a mesma pasta e o mesmo nome**. O número define a ordem de exibição na tela. Use PNG quadrado (512 x 512 px é suficiente).

| Pasta | Conteúdo |
| --- | --- |
| `_categorias/` | Capa das categorias: `01` Eu quero, `02` Eu estou, `03` Sensibilidade, `04` Interação, `05` Escola |
| `eu_quero/` | `01` Água, `02` Comida, `03` Doce, `04` Suco, `05` Brincar |
| `eu_estou/` | `01` Feliz, `02` a `05` a definir |
| `sensibilidade/` | `01` a `05` a definir |
| `interacao/` | `01` a `05` a definir |
| `escola/` | `01` a `05` a definir |

As palavras ficam em [src/data/pictogramasPadrao.js](../../src/data/pictogramasPadrao.js). Os itens "a definir" aparecem no app como "Pictograma 02" etc. até receberem nome nesse arquivo.

Para adicionar um pictograma novo, coloque o arquivo na pasta (ex.: `eu_quero/06.png`) e adicione uma linha com o `require` e a palavra em `src/data/pictogramasPadrao.js`.

As palavras e imagens padrão só são copiadas para o aparelho na primeira abertura do app. Depois de trocar uma **palavra**, apague os dados do app para vê-la. Uma troca de **imagem** aparece no próximo carregamento, sem apagar nada.
