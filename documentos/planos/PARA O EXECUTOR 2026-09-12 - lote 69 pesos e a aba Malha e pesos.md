# Para o executor — lote 69, pesos e a aba Malha e pesos · 12/09/2026

Recado do planejador. Dois pedidos do Humberto, 12/09/2026, os dois no mesmo lote.

## 1. Pesos: uma imagem em dois ossos

> "Não consigo usar peso de forma decente. Pega uma imagem e liga a dois ossos. O sistema não está completo."

O plano inteiro está em `PLANO pesos - imagem em dois ossos 2026-09-12.md`: a
tabela de como Spriter, Spine e DragonBones fazem, o que foi conferido no
navegador, os sete buracos, o lote 69 (itens a a i), os testes com valor
esperado e a decisão que ainda falta.

**Regra nova dele, que vale para todo gesto do editor:** antes de decidir,
olhar como 1 Spriter, 2 Spine, 3 DragonBones fazem, e seguir o modelo.
Sugestão nossa só depois, marcada como nossa. O lote 69 já segue o modelo do
Spine e do DragonBones: botão **Ligar** que abre o modo, clique nos ossos, cor
por osso, pizza por vértice, a malha nunca sai da seleção. **O P segurado na
malha sai.**

## 2. "Arrumar esse menu também"

> "Peça para ele arrumar esse menu também."

O menu é a **aba Malha e pesos** (é a que estava na tela). Entendemos assim; se
for outro, o Humberto diz. O item **i** do lote 69 é esse: a aba refeita na
ordem da view Weights do Spine:

| Seção | O que tem |
|:---|:---|
| Desenho escolhido | slot e anexo. Sem desenho: uma frase só |
| Forma | Virar malha (imagem inteira) · Gerar automática · Traçar contorno · Ligar vértices · Desligar aresta · Apagar vértice |
| Ossos | **Ligar** (o modo) · a lista com a **bolinha da cor**, o %, Travar e tirar |
| Pesos | Pesos automáticos · Suavizar · Podar · Tirar pesos |
| Pincel | Somar · Subtrair · Substituir · Suavizar · Raio · Força |
| Avançado: malha ligada | como está, dobrada |

E os dois defeitos da aba que estão nos buracos 5 e 6 do plano: ela não ouve a
troca de ferramenta (diz "escolha a ferramenta" com a ferramenta já na mão) e o
raio do pincel nasce grande demais para uma peça pequena.

Antes de tocar no CSS: `npm run medir -- --fotos <pasta>` antes e depois. A aba
não pode passar da coluna (lote 65).

## Decisão

O Humberto disse "vai" sem escolher: **fica só o botão**, como no Spine e no
DragonBones. Pesos automáticos continua um clique à parte.

## Já feito pelo planejador (não refazer)

| O que | Onde |
|:---|:---|
| Linha de base de `editor/src` e `editor/testes` | `backup/editor-src_2026-09-12_antes-do-lote-69/` e `backup/editor-testes_2026-09-12_antes-do-lote-69/`, listadas no `INDICE.md` |
| Nenhum código mudou | a v11.5 continua a última |

## O de sempre

`INDICE.md`; contagem não cai (2.636); `tsc`; `conformidade.mjs`;
`npm run roteiro`; `npm run medir`; CHANGELOG; `versao.py` com o próximo livre;
Desvios no fim do plano; "fechei a vN.N" ao Humberto. Manual pausado.
