# Passagem de bastão — do PLANEJADOR para o PLANEJADOR — 18/09/2026

Escrito por `PLANEJADOR · animador-5e`, a pedido do Humberto: a janela dele
ficou comprida demais (dois dias, doze degraus), e um chat novo assume o papel.
**Tudo o que importa está no disco. Esta página é o mapa; cinco a dez minutos
bastam.** Leia nesta ordem e não pule o `CLAUDE.md`.

| Ordem | Arquivo | Para quê |
|:---:|:---|:---|
| 1 | `CLAUDE.md` | as regras da casa (23) e como falar com o Humberto |
| 2 | `documentos/QUEM E QUEM.md` (as seções de 17 e 18/09) | quem está vivo, os endereços, a regra das portas |
| 3 | `ESTADO.md` (cabeçalho e as seções de 17 e 18/09) | onde o projeto está |
| 4 | esta página | o que você faz agora |
| 5 | `documentos/planos/ARQUITETO 4 - tarefas ordenadas 2026-09-17.md` | a obra inteira; você está no D11, faltam D12 e D13 |
| 6 | os fechos de `ENCARGOS degraus 5 6 7` e `ENCARGOS degraus 8 9 10` | as regras aprendidas com três chats no editor ao mesmo tempo |
| 7 | `documentos/planos/ENCARGO degrau 11 - a casca 2026-09-18.md` | o que está rodando agora |

## Quem é o Humberto, em quatro linhas

Disléxico: frases curtas, tabelas alinhadas, resposta em poucas linhas, nada de
plano longo na conversa (plano vai para `documentos/planos/`). O fluxo é o do
**Spriter**, com as ferramentas do Spine encaixadas nele. Programa primeiro,
manual só quando ele pedir. Onde o programa não entende, **avisa**, não
improvisa (regra 21), e isso vale para nós: nunca um verde que não foi medido.

## Onde a obra está

| Feito | Versões |
|:---|:---|
| D0 (spec 0.2) e D1 (schema, validadores, casos) | v13.3 |
| D2 runtime TS · D3 runtime Python (só pela spec) · D4a editor sem freio | v13.4 a v13.7; fecho v13.8: **71 casos nos dois runtimes, confronto campo a campo sem diferença** |
| D4b o projeto de vários corpos, a virada na tela | v13.9 |
| D5 janela Animação · D6 linha do tempo · D7 cena, árvore e malha | v14.0 a v14.6; fecho v14.7 |
| D8 imagens, ordem e entidades · D9 peles · D10 arquivo | v14.8 a v15.7; fecho v15.8 (documentos na v15.9) |
| **D11 a casca** | **rodando agora**; o lote 1 (o interruptor saiu) já fechou a v16.0 |

**Linha de base antes do D11:** suíte 3.278 (3.248 verdes, 29 pulados, **1
vermelho pré-existente do manual**, 15/09: `exportar-e-ajuda.test.ts` espera
nomes de capítulo velhos; é do D13) · `tsc` limpo · conformidade 71/71 nos dois
runtimes · roteiro 14/14 · medição 26/26 de lado e 19/26 de altura.

## O que está rodando

| Chat | Endereço | Modelo | Encargo |
|:---|:---|:---|:---|
| `EXECUTANDO · a casca` | o título da janela (confira no `ListAgents`) | Opus | `ENCARGO degrau 11 - a casca 2026-09-18.md`: oito lotes, **uma versão e um par de fotos por lote** (`backup/fotos-degrau-11/`), porque o Humberto queria ver esse degrau e mandou seguir sem parar |

Ele está **sozinho** no editor: roda roteiro e medição sem pedir porta. Reporta
ao Planejador. Parados e arquiváveis (o Humberto decide): `EXECUTANDO ·
imagens, ordem e entidades`, `EXECUTANDO · peles`, `EXECUTANDO · arquivo`.

## O que você faz, passo a passo

| Quando | Faz |
|:---|:---|
| **Ao abrir** | `ListAgents`; título da janela `PLANEJADOR · <o seu endereço>`; a sua linha em `QUEM E QUEM.md` (com backup antes); uma mensagem a `EXECUTANDO · a casca` e outra a `PLANEJADOR · animador-5e` dizendo *"o Planejador agora é X"*. O antigo se cala depois disso |
| O D11 manda dúvida | responde curto. Campo novo no núcleo do formato, ou gesto que o Humberto não decidiu, **sobe ao Humberto** |
| O D11 fecha | confere no disco (versões em `backup/versoes/`, `CHANGELOG`, os Desvios do encargo, as fotos); roda **você mesmo** a suíte inteira, `tsc`, as duas conformidades, roteiro, medição, `montar-programa.py`; escreve o fecho (`CHANGELOG`, `ESTADO`, o encargo, `QUEM E QUEM`); **só então** grava a versão; mostra ao Humberto com as fotos (`SendUserFile` põe um arquivo na frente dele em outro aparelho) |
| Depois do D11 | escreve o encargo do **D12, o glacê** (abaixo), abre as fichas (`mcp__ccd_session__spawn_task`), e **troca o modelo de cada chat para Opus logo depois do clique** (`list_sessions` → `set_session_model(id, "claude-opus-5")`): a ficha herda o modelo da janela que a criou |
| **D13, o manual** | **não abre sem o Humberto pedir.** É regra dele, acima do plano (`CLAUDE.md` regra 11 e a memória do projeto). Os 29 testes pulados e o vermelho do manual são desse degrau |

### O D12, como o `ARQUITETO 4` o ordena

| Ordem | O quê | Pode andar junto? |
|:---:|:---|:---|
| 1 | **Partículas**: extensão `BONE_particles`, 1ª fase (taxa liga/desliga, uma semente por emissor, mistura só pelo slot, gravidade zero). Desenho em `documentos/programa-novo/07` e `COMO SE FAZ EFEITO 2026-09-16.md`. Mexe em formato (extensão, **não núcleo**), runtime e editor: **um chat por pasta**, e o Python só pela spec da extensão | sim, com cerca por pasta |
| 2 | **Biblioteca**: animações de fábrica contra `formato/rigs/humanoide-v1.bone` (parado, andar, correr, pular), Exportar/Importar animação com `rig` e `rig.reference` na tela | sim |
| 3 | **Portas do formato**: Caminho, Sliders, Áudio, Física (Simular, Reiniciar, **Assar em chaves**), Variáveis e tags com desligar | um chat, em lotes |
| 4 a 6 | grade em perspectiva (na máquina, não no arquivo), trajeto do movimento, flash e pulso, tremor com semente, curvas, os pequenos | depois |

Campo novo no **núcleo** do formato é decisão do Humberto (regra 7). Extensão
`BONE_*` segue a §2.7 e a §12.8 da spec: schema próprio, fallback escrito, caso
de conformidade, e os **dois** runtimes antes de entrar em `casos/`.

## As regras que custaram caro (não reaprenda)

| # | Regra | O que custou |
|:---:|:---|:---|
| 1 | Ficha herda o **modelo** da janela que a criou. Trocar para Opus logo depois do clique. Pedir "rode em Opus" no texto não troca nada | três chats nasceram em Fable e o limite da conta caiu em um minuto |
| 2 | Depois de um reinício do aplicativo o endereço **é o título da janela**. Mensagem sem resposta: `ListAgents` antes de mandar de novo. Responder pelo `from` da mensagem recebida é o caminho mais seguro | três "PODE" presos na fila |
| 3 | Três chats na mesma pasta só com **cerca por parte**; arquivos de passagem só acrescentando, relendo do disco; **asserção que prova comportamento de outro chat é do outro chat** | sete vermelhos de cerca, nenhum consertado pelo chat errado |
| 4 | **Portas fixas** (roteiro 5191, medição 9335): um de cada vez, pelo "PODE" do Planejador. E **ninguém grava em `editor/src` enquanto alguém prova**: o roteiro monta o código do disco na hora | o passo 14 caiu três vezes e passou duas sem ninguém mexer |
| 5 | Painel novo: linha em `layout-model.ts` (`RIGHT_GROUPS`). Campo novo no `RECORTE_editor_state`: linha no `ESTADO_PERMITIDO` do `roteiro-30.mjs` e no `contract.ts`. Ação de menu: **um id**. Tecla nova: uma linha em `ui/keys.ts` | a medição contou 11 onde eram 12; o passo 13 acusou "arranjo de tela no arquivo" |
| 6 | Dois runtimes leem a spec de jeitos diferentes → **o caso decide e a spec ganha uma linha** (Apêndice C). Nunca o teste | C-299 e C-300 |
| 7 | **Grave a versão DEPOIS dos documentos do fecho, no mesmo comando encadeado com `&&`.** Script de documento que troca texto exato quebra quando outro chat mexeu na linha: troque por começo de linha, e confira antes | errei duas vezes: v14.7 e v15.8 saíram antes dos documentos (a v15.9 é o remendo) |
| 8 | Script Python com muito texto: escreva com a ferramenta de escrever arquivo e rode depois. O heredoc do shell quebrou três vezes com aspas dentro | |
| 9 | Backup datado antes de escrever, linha no `backup/INDICE.md`; a data é a do **relógio da máquina** (regra 20); o `versao.py` recusa número repetido em qualquer data | a v14.4 nasceu duas vezes na virada da meia-noite |
| 10 | Nenhum chat abre painel de pergunta. O Humberto pode não estar perto | regra 23 |

## O que o Humberto pode querer rever (está tudo escrito, nada escondido)

- O **Apêndice C** da spec: 16 leituras "a mais simples" onde a spec não bastava. As duas de mais peso: o `transform` vale para todo anexo sem pesos; um nome de pele que o corpo novo não tem **fica** na pilha.
- A `default` é uma pele como as outras, no runtime e, desde o D9, na tela. O campo velho `skins` do estado do editor ainda é **gravado**, para trás.
- Desvios anotados para depois: desenhar o `crop` na cena; copiar o arquivo de fora para a pasta já ao abrir; soltar imagens numeradas não cria o anexo sozinho (bate com "nada entra na cena sozinho"); arrastar a faixa da entidade pela origem; âncora de caminho pela cena.
- Dois links em `site/` ainda apontam para o nome antigo da spec (`ESPECIFICACAO 2026-09-06.md`). Ninguém é dono; é uma linha em cada arquivo.

## 18/09/2026, 10:45 — D11 fechado; o bastão é do `PLANEJADOR · dd3937`

O D11 foi conferido pelo Planejador antigo (v16.9): suíte 3.340, `tsc` limpo, 71/71 nos dois runtimes, roteiro 14/14, medição 26/26 e 19/26 com painel cheio. **Linha de base do D12: v16.9.** Pergunta aberta ao Humberto: as teclas de painel entram na janela Ajuda → Atalhos? Um cuidado para o lote 1 das portas: o D9 fechou "regra Comando vazia **avisa**"; o defeito de a regra `driver` **nascer** com `targets: []` é vizinho. Confira os dois juntos, para o aviso não esconder o defeito de nascença.
