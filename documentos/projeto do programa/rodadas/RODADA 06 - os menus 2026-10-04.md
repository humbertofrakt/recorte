# Rodada 6 — os menus

Ficha escrita pelo `DIRETOR · ed2cab` em 04/10/2026.
**Esta rodada escreve código.** É a única que escreve código e usa a máquina enquanto roda.

---

## Para quê

Palavras do Humberto, 04/10:

> *"é pra tudo ficar e funcionar. O problema é que eu não entendi como usar isso, pois não tinha isso nos menus."*

> *"skins tem que ter seu menu próprio. Imagens e entidades também."*

O desenho está feito e **aprovado por ele**: `documentos/projeto do programa/05 O DESENHO DOS MENUS 2026-10-04.md`. Leia inteiro. **Esta rodada constrói aquele desenho. Não redesenha.**

A barra, na ordem do trabalho:

```text
Arquivo · Editar · Imagens · Base · Malha e regras · Animação · Skins · Entidades · Partículas · Exibir · Janela · Ajuda
```

---

## As cinco respostas dele (viraram decisão)

| # | Decisão |
|:---:|:---|
| 1 | A palavra **"pele" vira "skin"** no programa inteiro: menus, abas, avisos, dicas, rodapé |
| 2 | O menu **Esqueleto** passa a se chamar **Base** |
| 3 | Onde o programa diz **"corpo", passa a dizer "base"** (*Entregar um corpo* → *Entregar uma base*; *Colar corpo aqui* → *Colar outra base aqui*) |
| 4 | Malha, pesos, regras, física e caminho num menu só: **Malha e regras** |
| 5 | Importar e exportar skin e animação ficam no **Arquivo** |

---

## O que entra, e o que NÃO entra

O `05` marca cada item. Siga a marca:

| Marca no `05` | O que você faz |
|:---|:---|
| sem marca (item de hoje) | vai para o menu e o lugar que o `05` diz. **A tecla não muda. O id da ação não muda.** |
| **(porta)** — existe num painel ou botão, e não tinha menu | ganha id de ação em `ui/actions-table.ts` e item no menu. São 30 |
| **(novo)** — função que ainda não existe | **NÃO entra no menu.** Item que não faz nada é pior que item que falta (regra 21). Cada uma entra quando a rodada dela construir |
| **(novo)** que **já existe** desde esta noite | **entra.** As rodadas 12 e 15 construíram algumas: *Esconder esta imagem* e *Ignorar esta imagem* (skin, v23.9) · o painel **Partículas** e *Prender ao osso* (v24.1, v24.3) · *Tirar a entidade* (v23.4). **Confira no código o que existe**, e ponha no lugar que o `05` reservou |

A conta do `05` tem de fechar no fim, refeita por você: os 232 itens de hoje, mais os que as rodadas desta noite acrescentaram, **cada um num lugar**. Um teste faz essa conta (hoje ele já existe: *"toda ação dos sete menus"*; ele passa a ser dos doze).

---

## Os lotes — uma versão e um par de fotos cada

| Lote | O quê | O que o Humberto vê |
|:---:|:---|:---|
| **1** | **A barra nova e os itens no lugar.** Os 12 menus, na ordem. Todo item de hoje no menu e no bloco que o `05` diz. Os submenus novos (Pose, Ir para, Chaves, O boneco, A cena, Arrumar, Troca de base). Esqueleto vira **Base** | a barra de 12 menus; o menu Animação com 21 itens à vista em vez de 66 |
| **2** | **As portas.** Os 30 **(porta)**: os 12 da malha e dos pesos, apagar regra, as 6 que não tinham botão nenhum, copiar e colar pivô, fazer skin de pasta, pôr entidade na cena… e os **(novo)** que já existem | o menu **Malha e regras** cheio; os menus Skins, Entidades e Partículas com o que já funciona |
| **3** | **As palavras.** "pele" → "skin" e "corpo" → "base", em todo texto que o usuário lê | a aba **Skins**; *Entregar uma base* |

**O lote 3 é o que mais mexe em teste**: muitos conferem o texto. Teste que muda de propósito se reescreve provando o texto novo, e você me diz **quantos, por arquivo**. Nenhum é apagado nem pulado. **Só o texto que o usuário lê muda**: os ids de ação, os nomes de arquivo, os campos do formato (`skins`, `body`) e o nome das variáveis **não mudam**.

---

## As réguas

| # | Régua |
|:---:|:---|
| 1 | Leia `editor/src/contract.ts` inteiro, `documentos/PARTES.md`, `ui/menus.ts`, `ui/actions-table.ts`, e o fim do `03` (o que as rodadas desta noite mudaram; a última versão está lá) |
| 2 | Regra 17 da casa: **ação nova de menu é um id em `ui/actions-table.ts`**; o teste de conflito julga. Regra 12: tecla tratada uma vez |
| 3 | **Item de menu cinza diz por quê**, na dica (*"escolha um osso primeiro"*). A rodada 8a achou um que não dizia: *Tirar a entidade*, com a espada original do herói. Conserte esse, e siga a régua em todo item novo |
| 4 | **Nenhum menu com mais de ~20 itens à vista.** O menu não pode passar da altura da tela em 1280×720: a medição (`npm run medir`) ou uma foto nas duas telas prova |
| 5 | A busca de comandos (Ajuda → Paleta de comandos) acha **todo** item novo, pelo nome e pela dica |
| 6 | O rodapé "Próximo:" e as boas-vindas citam caminhos de menu (*"Arquivo → Abrir pasta…"*). **Varra todo texto que cita um caminho de menu** e corrija para o caminho novo (regra 25: quem move, varre quem lia). Diga quantos achou |
| 7 | `documentos/O QUE O PROGRAMA FAZ…` e `O QUE NAO TEM PORTA…` são gerados (`npm run tarefas`, `npm run portas`): **gere de novo no fecho do lote 2**, com a data do relógio no nome, e guarde os antigos em `backup/` |
| 8 | Não edite `documentos/manual/`: os testes do manual estão pausados, e o manual só volta com a palavra do Humberto |
| 9 | Fotos de cada menu aberto, antes e depois, em `backup/fotos-obra/rodada-06/`. Com a tela apagada o navegador embutido não desenha: Chrome sem janela por protocolo |
| 10 | Teste novo no arquivo da parte. A contagem não cai: a referência por arquivo é o último `backup/contagem-testes_*.tsv`. Guarde a sua em cada fecho |
| 11 | Fecho de cada lote, **um processo de cada vez** (7,7 GB; meça a memória livre antes): `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` · `python ferramentas/montar-programa.py` · `python ferramentas/versao.py N.N "…"` (o próximo livre no `backup/INDICE.md`) · seção no `CHANGELOG.md` |
| 12 | **O roteiro dos 30 minutos abre menus pelo nome.** Ele tem de continuar 14 de 14: onde ele abria *Esqueleto*, passa a abrir *Base*. Diga quais passos mudaram |
| 13 | **Mensagem do Diretor só chega quando o seu turno para.** Pergunta vai com a sua suposição; siga pelo que não depende dela; termine o turno quando só restar esperar |
| 14 | Grande demais? Feche como versão o lote que está pronto e fotografado, e me diga o que sobrou |

---

## O que entregar

| # | |
|:---:|:---|
| 1 | O código, os testes, as fotos, as versões, o `programa/` montado, as duas folhas geradas de novo |
| 2 | No `03`: a rodada 6 passa a **entregue**, com as versões e três linhas do que o Humberto vai ver |
| 3 | Um aviso ao `DIRETOR · ed2cab` por `SendMessage` a cada lote fechado (rode `ListAgents` antes): o que entrou · a conta dos itens · os testes reescritos, por arquivo · os números do fecho, com a hora |
| 4 | Uma lista: **os (novo) que ficaram de fora**, e a rodada que constrói cada um |

## O que NÃO fazer

| | |
|:---|:---|
| Não redesenhe os menus | o desenho é do Humberto. Se achar um erro no `05`, **diga-me**, com a sua sugestão, e siga o `05` |
| Não ponha no menu função que não existe | regra 21 |
| Não mude tecla, nem id de ação, nem campo do formato | só o lugar e o texto |
| Não mexa nos painéis (soltar, recolher, expandir) | é a rodada 4 |
| Não toque em `formato/` nem nos runtimes | |
| **O Humberto está dormindo, ou longe.** Não pergunte nada a ele | dúvida vem para mim |
