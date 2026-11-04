# Rodada 8a — a entidade se escolhe, se move e volta

Ficha escrita pelo `DIRETOR · ed2cab` em 04/10/2026.
**Esta rodada escreve código.** É a única que escreve código e usa a máquina agora.

---

## Para quê

A rodada 1 usou o programa e achou o buraco central da conexão
(`documentos/projeto do programa/04 O QUE JA FAZ 2026-10-04.md`, leia inteiro):

> A entidade, uma vez no lugar, **não se escolhe, não se move, não volta.**

Sem isso, nada do sistema de conexão se usa. Esta rodada fecha esse buraco, e só ele.

As decisões que valem (`02 AS DECISOES`, seção 2):

| # | Decisão |
|:---:|:---|
| 6 | Quando a entidade sai, **a imagem de antes volta** |
| 9 | A entidade **se comporta como uma imagem**: mover, girar, mudar o tamanho, e isso vira chave |
| — | Como trocar: botão direito → a grade, com imagens e entidades |

---

## O que tem de funcionar no fim

| # | O quê | Hoje (rodada 1) | Foto de hoje |
|:---:|:---|:---|:---|
| 1 | **Clicar na entidade na cena a escolhe**, como uma imagem. Propriedades mostra a entidade, com o nome dela | o clique não pega: Propriedades fica em "Esqueleto" (C16, achado 1) | `36`, `16d` |
| 2 | **Botão direito na entidade abre a grade**, como numa imagem | *"Não há ferramenta anterior para voltar"* (C5) | `16e` |
| 3 | **A entidade volta a ser imagem**: pela grade, escolho uma imagem, e ela entra no lugar. E um gesto direto de "tirar a entidade" devolve **a imagem de antes** | nenhum gesto devolve; só `Ctrl+Z` (C5) | `17`–`20` |
| 4 | **Mover, girar e escalar** a entidade com as ferramentas, na base e na animação. Na animação vira chave, como a imagem. Propriedades mostra X, Y, giro e escala, e aceita número digitado | nada acontece; X e Y são "—" (C16) | `37` |
| 5 | **Propriedades e Ordem dizem o nome da entidade** depois da troca | continuam dizendo "face" (achado 3) | `13`, `15` |
| 6 | **O aviso das chaves que não passam sai em português**, e diz quantas e de quem. Ex.: o rosto era malha com deformação; a espada não tem malha | três avisos em inglês (C3, achado 4) | `14` |

**Um desfazer por gesto**: um `Ctrl+Z` desfaz a troca inteira, e o arquivo volta letra por letra.

---

## Por onde começar

| Pista | Onde |
|:---|:---|
| O clique na cena **pula quem não tem contorno** | `editor/src/viewport/picking.ts`, perto da linha 298 |
| Mover e Girar **só agem em `region`** | `editor/src/viewport/tools/attachment-edit.ts`, perto da linha 75 |
| A troca imagem → entidade | o `CHANGELOG`, seção da **v15.0** ("a grade lista entidades", "herda osso, pivô, ordem e chaves"): o anexo muda de tipo dentro do mesmo slot e com o mesmo nome |
| A entidade no formato | a spec, §7.11 (`formato/ESPECIFICACAO…`). **Antes de inventar campo, veja o que o anexo `skeleton` já tem** de posição, giro e escala |

As linhas são de outra rodada: **confira antes de confiar.**

**A rodada 15 (partículas) vem depois de você e tem o mesmo sintoma no emissor** (não se clica, não se move), pela mesma causa. Conserte para a entidade de um jeito que ela reaproveite: se o clique passar a reconhecer "anexo sem contorno, com uma caixa ou uma marca", diga isso no seu relatório. **Não conserte o emissor**: é da 15.

---

## As réguas

| # | Régua |
|:---:|:---|
| 1 | Leia `editor/src/contract.ts` inteiro e `documentos/PARTES.md` antes de mexer |
| 2 | **Olhe os três programas antes** (regra 4 do `03`): como o Spriter escolhe e move uma sub-entidade na cena? O manual está em `documentos/pesquisa/nova pesquisa/spriter/Spriter Pro - manual oficial 1.4.pdf` (`pdftotext` funciona). **Leia; não responda de memória.** Escreva em três linhas o que achou, no seu relatório |
| 3 | **Antes de provar que consertou, prove que o defeito existia** (regra 26 da casa): refaça C5 e C16 no programa de hoje e veja falhar |
| 4 | Campo novo no núcleo do formato é decisão do Humberto (regra 7). Se a entidade **não tiver** onde guardar posição, giro e escala, **pare e me avise** com a sua proposta. Não invente |
| 5 | "A imagem de antes volta": descubra onde a imagem de antes fica guardada depois da troca. Se ela se perde, estado só do editor vai em `RECORTE_editor_state` (regra 6), nunca no núcleo |
| 6 | Não toque em `runtime/` nem `runtime-python/` por texto de aviso: o editor traduz os avisos que conhece e mostra o resto como veio (decisão P46 da rodada final) |
| 7 | Teste novo no arquivo da parte (regra 16). A contagem de testes não cai (hoje: 4.608, com 1 vermelho antigo, o do manual) |
| 8 | **Fotos de antes e de depois**, uma dupla por linha da tabela, em `backup/fotos-obra/rodada-08a/` |
| 9 | Fecho, **um processo de cada vez** (7,7 GB; meça a memória livre antes): `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` · `python ferramentas/montar-programa.py` · `python ferramentas/versao.py 23.4 "…"` (confira o próximo número livre no `backup/INDICE.md`) · seção no `CHANGELOG.md` |
| 10 | Grande demais para um chat? **Pare, feche o que está pronto como versão, e me diga o que sobrou.** Melhor três linhas da tabela prontas e fotografadas do que seis pela metade |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | O código, os testes, as fotos, a versão, o `programa/` montado |
| 2 | No `03`: a rodada 8a passa a **entregue**, com a versão e três linhas do que o Humberto vai ver |
| 3 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage` (rode `ListAgents` antes), com: as seis linhas da tabela, **feita / pela metade / não feita** · os números do fecho, com a hora · o que você achou no Spriter · o que a rodada 15 pode reaproveitar |
| 4 | Eu vou **usar o programa montado** para conferir. Só então a rodada vira "feita" |

## O que NÃO fazer

| | |
|:---|:---|
| Não faça a entidade virar base na lista, nem cair onde foi solta | é a 8b |
| Não mexa na faixa da linha do tempo | é a 8c |
| Não conserte o emissor de partículas | é a 15 |
| Não troque "pele" por "skin" nem mexa nos menus | é a 6 |
| Não edite `documentos/manual/` | só com a palavra do Humberto |
