# Chat F — lote 3, o conserto da fila da cena — 29/09/2026

Escrito às 00:35, com a casa parada (sem servidor, sem foto). Ordem dada pelo
`PLANEJADOR · 9f75b5`. **Nada disto é gravado antes do "casa livre".**

| # | O quê | Onde (só a minha cerca) | Como | A prova de que o defeito existe, antes |
|:---:|:---|:---|:---|:---|
| 1 | **F1 + F2 — o recado escrito e apagado no mesmo quadro** | `viewport/viewport.ts` | a cena guarda o último recado com nome dito durante o arrasto (comando ou `notice`) e o diz de novo **depois** de soltar, depois do último `repose`. Assim "Mover osso", "Girar osso", "Segure Alt e arraste…" chegam aos olhos | teste em `viewport.test.ts`: um documento que conta os recados; aperta, arrasta, solta; o último recado do rodapé tem de ser o do gesto. Ver o teste falhar antes |
| 2 | **A4 — desfazer deixa `shearX: 0`** | `viewport/tools/select.ts`, `SetProperty` | cada mudança guarda se o campo **existia**; o `revert` apaga o campo que não existia | teste em `ferramentas.test.ts`: osso sem `shearX` → inclinar → desfazer → `'shearX' in osso` é falso. Ver falhar antes |
| 3 | **H3 — setas empurram o escolhido** | `ui/keys.ts` (uma linha, passagem), a ação na cena | 1 px; Shift = 10 px; um passo de desfazer por toque seguido. **Conflito:** hoje ← → andam um quadro e ↑ ↓ pulam de chave. Suposição: com o foco na cena e algo escolhido, a seta empurra; sem nada escolhido, anda no tempo como hoje. O teste de conflito julga. Se ele não deixar, pergunto ao Planejador | teste: escolher osso, seta → x+1 |
| 4 | **F3 — a regra que segura o osso avisa** | as ferramentas de girar, mover, escalar | ao soltar, se o osso escolhido é alvo de uma regra (IK, driver, transform, caminho, física), o rodapé diz: *"head é segurado pela regra look_driver — desligue o olho dela na aba Regras para girar à mão"*. Não desliga regra nenhuma | teste: herói, girar `head` → o recado cita `look_driver` |
| 5 | **K10 — escolher o osso certo** | `viewport/tools/select.ts`, a etiqueta de nome sob o mouse | o nome do que está sob o mouse à vista antes do clique; a dica diz *"Alt+clique: o de baixo"*. "Escolher o irmão" em Editar → Escolher: uma linha em `ui/keys.ts` e um id em `ui/actions-table.ts` | teste da ação do irmão |
| 6 | **J2 — "Virar filho de…" pelo menu arma o gesto** | `viewport/tools/select.ts`, `viewport/viewport.ts` (`reparentHint`) | `armGrab(doc)`: o item do menu abre o `ChildGrab` sem tecla; o rodapé diz "Clique em quem vira filho de X. Esc termina"; Esc ou o item de novo fecha | teste: armar, clicar num desenho → vira filho |
| 7 | **J11 — o nome do item no cartão** | `viewport/viewport.ts:594`, `viewport/welcome-model.ts:60` | "Abrir pasta do projeto…", o nome do menu | teste: o texto do cartão contém o nome do item do menu |
| 8 | **L15 — o boneco aberto cabe na cena** | `viewport/viewport.ts` | ao abrir arquivo (`change.kind === 'file'`), ajustar à tela, como o botão Ajustar | módulo puro que decide quando ajustar; teste |

**Uma versão por conserto que se vê**, com par de fotos em `backup/fotos-rodada-final/cena/lote-3_*`.
Backup datado de cada arquivo antes, com linha no `backup/INDICE.md`.

**Proposta para depois do lote 3:** N-4, arrastar os cantos da área de exportação na cena (o retângulo já é desenhado).

## Suposições escritas (regra 23)

| # | Suposição |
|:---:|:---|
| S1 | O recado repetido ao soltar é o **mesmo texto**, não um novo. Recado melhor ("Moveu head 12 px") fica para depois, se o Humberto pedir |
| S2 | Setas: só com o foco na cena **e** algo escolhido. Senão, o tempo, como hoje |

## Desvios

(vazio)

### Planejador, 29/09 — aprovado, com três ajustes

| Ajuste | O quê |
|:---|:---|
| L11 | entra no **mesmo recado do F3**: a frase diz também que mexer na base com a regra ligada é só teste |
| N-4 | no lote 3, só a metade barata: **etiqueta "área da exportação"** no retângulo magenta da cena, e o rodapé diz que ele existe quando o diálogo de exportar abre. Arrastar os cantos: depois |
| Corte | **versão A:** F1 · A4 · H3 · F3/L10/L11 — **versão B:** K10 · J2 · J11 · L15 · N-4 |
