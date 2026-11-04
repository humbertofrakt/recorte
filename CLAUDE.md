# Recorte — regras da casa e mapa da pasta

Para quem chega agora: um chat, um agente, uma pessoa. Cinco minutos bastam.

## Leia nesta ordem

| Ordem | Arquivo | Para quê |
|:---:|:---|:---|
| 0 | `documentos/QUEM E QUEM.md` | **quem é quem HOJE.** Primeira coisa: ponha o seu nome e endereço lá |
| 1 | este `CLAUDE.md` | as regras e o mapa |
| 2 | `README.md` | o que é o projeto, o manual, como rodar |
| 3 | `ESTADO.md` | onde o projeto está hoje, o que falta, as decisões abertas |
| 4 | `editor/src/contract.ts` | **a lei do editor**. Ler inteiro antes de mexer em `editor/` |
| 5 | `backup/INDICE.md` | tudo o que foi guardado, versão por versão |
| 6 | `documentos/PARTES.md` | as partes do editor, uma por chat: código, CSS, teste, modelo |
| 7 | `documentos/O QUE O PROGRAMA FAZ 2026-10-05.md` | **o que o programa faz, por TAREFA**, com o caminho de clique ao lado. Gerada do código por `npm run tarefas`: **nunca escrever à mão** |
| 8 | `documentos/O QUE NAO TEM PORTA 2026-10-05.md` | o que o programa sabe fazer e **não tem botão**. Gerada por `npm run portas` |
| 9 | `documentos/projeto do programa/02 AS DECISOES do projeto 2026-10-04.md` e `03 A ORDEM DA OBRA 2026-10-04.md` | **desde 04/10/2026: o que o programa tem de ser, e a obra em rodadas, um chat por rodada.** Valem acima dos planos antigos. Um **Diretor** fala com o Humberto, confere cada rodada e escreve a seguinte; cada rodada é um chat novo, que reporta ao Diretor |

## As pastas, uma linha cada

| Pasta | O que é |
|:---|:---|
| `formato/` | A especificação do formato `.bone`, o JSON Schema, os exemplos. O coração |
| `runtime/` | Runtime de referência em TypeScript. Lê `.bone` e calcula a pose |
| `runtime-python/` | Segundo runtime, em Python, escrito só pelo texto da spec |
| `leitor-construct/` | O leitor do formato para o **Construct 3** (desde 05/10/2026): um addon com o `runtime/` inteiro dentro. `npm run leitor:construct` gera o pacote; `npm run leitor:construct:conformidade` roda os 90 casos sobre ele |
| `conformidade/` | Os 46 casos que qualquer runtime roda para provar que lê certo |
| `editor/` | O programa de animação. Roda no navegador. Vite + TypeScript |
| `ferramentas/` | Linha de comando: validar, importar, exportar, empacotar, versionar. Os scripts de prova em `ferramentas/provas/` |
| `site/` | Página inicial e validador na web. Estático |
| `programa/` | O editor **montado**, pronto: dois cliques em `Abrir o editor.bat` |
| `documentos/` | Manual de uso, pesquisa, planos, notas de desenvolvimento |
| `contribuição/` | Assinaturas de quem trabalhou em cada rodada |
| `backup/` | Cópias datadas e versões numeradas. Nunca apagar. Tudo listado no `INDICE.md` |
| `node_modules/` | Dependências do npm. Gerado. Não mexer |

Arquivos da raiz: `README`, `ESTADO`, `CHANGELOG`, `CONTRIBUTING`, `LICENSE`, `NOTICE`, `Abrir Recorte.bat` (abre o editor em modo de desenvolvimento), `package.json`, `tsconfig.json`, `vitest.config.ts`.

## Regras da casa

| # | Regra |
|:---:|:---|
| 1 | **Backup antes de escrever.** Cópia datada em `backup/`, com o motivo no nome: `shell_2026-09-08_antes-do-lote-4.ts`. Lote grande: a pasta inteira, `backup/editor-src_DATA_antes-do-lote-N/` |
| 2 | **Nada some sem estar listado.** Tudo que vai para `backup/` ganha uma linha no `backup/INDICE.md`: o que é, quando, por quê |
| 3 | **Cada entrega é uma versão numerada.** `python ferramentas/versao.py 3.1 "o que mudou"`. O script recusa número repetido. Próximo livre: olhe o `INDICE.md` |
| 4 | **A pasta fica limpa.** Na raiz só o trabalho do dia. Documento parado vai para `documentos/`. Material de prova vai para `backup/` |
| 5 | **Nunca escrever no arquivo que é do Humberto.** Arquivo dele tem nome limpo; o gerado por nós tem data no nome. Ele disse "alterei"? Pare, compare, liste, só então aplique |
| 6 | **O documento do editor É o arquivo `.bone`.** Toda edição é um `Command` com `apply` e `revert` exatos. Estado só do editor vai em `RECORTE_editor_state`; nunca no núcleo do formato |
| 7 | **Campo novo no núcleo do formato é decisão do Humberto.** Não invente campo que um leitor não conhece |
| 8 | **Decisão em módulo puro, DOM só desenha.** Não há jsdom. Teste sem navegador |
| 9 | **A contagem de testes nunca cai.** O número de hoje está no quadro do topo do `ESTADO.md`, e por arquivo no último `backup/contagem-testes_*.tsv` (em 05/10/2026: 4.743). Fecho de lote: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` |
| 10 | **Não renomear o Recorte.** O nome novo (BONE BANANA) é uma fase própria, depois do domínio. Mapa no fim do `ESTADO.md` |
| 11 | **Manual só quando o Humberto pedir.** Primeiro o programa, depois o manual (10/09/2026). Os testes do manual estão pulados em `editor/testes/manual-pausado.ts`. O `CHANGELOG` continua no mesmo lote que a função |
| 12 | **Tecla tratada uma vez.** Quem trata chama `stopPropagation`. Botão sempre com nome na dica |
| 13 | **Uma parte por chat.** O mapa está em `documentos/PARTES.md`. Fora da sua parte, só arquivo de passagem, e só acrescentando |
| 14 | **Número de versão na hora do fecho.** O próximo livre no `versao.py`; ele recusa repetido |
| 15 | **Um fecho de cada vez.** Suíte, roteiro, medição e `programa/`; quem fecha avisa: "fechei a vN.N" |
| 16 | **Teste novo no arquivo da parte.** Nunca mais `loteNN.test.ts` |
| 17 | **Tecla nova é uma linha em `ui/keys.ts`; ação nova de menu, um id em `ui/actions-table.ts`.** O teste de conflito julga |
| 18 | **`fronteiras.test.ts` decide quem importa quem.** Vermelho = mudança na parte errada |
| 19 | **Ao abrir, assine a tabela.** Rode `ListAgents`: a primeira linha diz o SEU endereço. Ponha o título da janela pela regra 22 (`set_session_title` com `self`) e escreva a sua linha em `documentos/QUEM E QUEM.md` — papel, janela, endereço. **Endereço morre da noite para o dia**; o que estiver velho na tabela, corrija. Sem isso ninguém acha ninguém, e o Humberto fica sem resposta |
| 20 | **A data se confere no relógio, nunca no cabeçalho alheio.** Antes de datar backup, versão ou documento, olhe a data da máquina (`date`, ou o que o `versao.py` grava). Documento de ontem traz a data de ontem, e quem copia o cabeçalho erra o arquivo inteiro — data errada em backup quebra a busca por *"o que havia antes do lote X"* e faz o `INDICE.md` deixar de bater com os arquivos |
| 21 | **Onde o programa não entende, ele avisa — não improvisa.** Valor desconhecido vai para o validador ou para a barra de avisos: **nunca para o desenho, nunca para um palpite silencioso, nunca para um verde.** Três vezes numa semana: o ícone `ik` que ninguém conhecia foi desenhado como uma LETRA na mão do herói (15/09) · o aviso da malha continuou na tela depois de voltar à Montagem, dizendo que a edição ia para a pose de repouso numa situação impossível (v12.6) · a prova de medição mediu o painel VAZIO e disse "cabe", e o número honesto caiu de 15 para 14 de 22 quando isso foi consertado (13/09). São três caras da mesma coisa: preferir parecer funcionando a admitir que não sabe — e a terceira contamina a prova, que é o que nos diz que está tudo bem. **As duas primeiras enganam o usuário; essa engana a nós** |
| 22 | **O nome da janela diz o que ela faz.** Pesquisa: `PESQUISA · o que pesquisa` (ex.: `PESQUISA · como se faz efeito`). Execução: `EXECUTANDO · o que executa` (ex.: `EXECUTANDO · grade das peles`). Só **Diretor** e **Planejador** ficam `DIRETOR · endereço` e `PLANEJADOR · endereço`. O endereço dos outros vai na linha de `documentos/QUEM E QUEM.md`, não no título. Ordem do Humberto, 16/09/2026 |
| 23 | **Nenhum chat abre painel de pergunta** (`AskUserQuestion`). Ele trava o chat, e o Humberto pode não estar perto do computador. Dúvida sobe por mensagem: `Executor/Pesquisa → PLANEJADOR → DIRETOR`. Enquanto espera, faça tudo o que não depende da resposta e escreva a suposição no plano. Ordem do Humberto, 16/09/2026 |
| 24 | **Número de fecho se mede com a casa vazia** — e não vale só para o roteiro e a medição, que brigam por porta fixa: vale para `npx vitest run` também. Com dois chats trabalhando, a suíte lê um arquivo que o outro está **gravando**, e o teste cai uma vez e passa no minuto seguinte. **O perigo é para os dois lados:** acusa vermelho que não existe, e **esconde vermelho que existe** — e esse segundo é silencioso. Daí três coisas: quem fecha mede com os outros parados; **todo vermelho se relata pelo NOME**, com dono; e antes de dizer "não é meu", **olhe a data do arquivo** — *conferi o relógio, não o palpite*. Achada no degrau 12, 18/09/2026. A outra causa de teste intermitente é o **tempo** (o `--adaptador` abre 71 subprocessos e estourava o limite sob carga): conserta-se pelo tempo, **nunca** encurtando o que o teste prova, nem pulando |
| 25 | **A medida tem hora, e expira.** Um número de suíte vale para o minuto em que foi medido: se alguma coisa se moveu entre medir e relatar, ele chega velho na mão de quem lê, **sem que ninguém tenha errado**. Quem relata diz a hora; quem lê remede antes de fechar. E a metade que fecha isso: **quem move uma pasta varre TODOS os leitores dela antes de dizer que está feito — mesmo os que não são seus, não para consertar, para AVISAR.** A cerca protege de dois chats escreverem no mesmo arquivo; ela **não** protege de um chat mudar o chão debaixo do outro. Custou 139 vermelhos em 18/09, quando o Planejador moveu 17 casos de pasta sem varrer quem os lia. **E vale para os dois lados: quem MOVE varre antes; quem RECEBE um aviso de que alguma coisa está espalhada por vários arquivos pergunta "onde mais?" no mesmo minuto.** Naquele dia o aviso existia — *"dois testes foram reescritos porque contavam oito casos"* — e quem o recebeu consertou o seu e não perguntou quem mais contava. É a diferença entre reagir e prever |
| 26 | **Antes de provar que consertou, prove que o defeito existia.** Um teste que nunca se viu falhar não é um teste — e provar ao contrário mostra que ele pega **a coisa que ele olha**, não que está olhando para o lugar certo. Por isso o caso de conformidade é escrito por **quem não escreveu o runtime**: você só testa o que já lhe ocorreu olhar. Três chats chegaram nisto no mesmo dia, cada um por seu caminho (18/09) |
| 28 | **"Por que este verde é explicável?" e "o que este verde prova?" são perguntas DIFERENTES — e a primeira sozinha engana.** Um caso que passa **por outro motivo que não o do nome dele** é pior que um caso mudo: o mudo mostra a lista vazia e faz desconfiar; o outro entra no relatório como *"P-002 taxa em rampa: passou"*, e quem lê conclui que a taxa em rampa está coberta. **O nome mente, e o nome é o que se lê numa lista de 88 linhas.** Achado em 18/09, depois de alguém ter olhado o mesmo caso, confirmado que o verde era explicável, e parado ali |
| 27 | **Descreva o próprio erro pela FORMA, não pelo estrago** — *"somei em vez de integrar"*, e não *"o caso tal estava errado"*. Só assim ele serve a quem não o cometeu, e **então** todo mundo vai procurar aquela forma na própria casa. A régua tem duas metades, e a primeira é a cara: pede que se conte o próprio erro de um jeito que o torne útil, em vez de um jeito que o diminua. Funcionou duas vezes em 18/09, com dois chats diferentes |
| 29 | **Rascunho não mora na pasta que a casa mede.** `editor/testes/` está no `include` do `tsconfig`: enquanto um arquivo de rascunho existe ali, ele é de **todos**; quando o autor o apaga, **some sem rastro** — e quem viu o vermelho vai caçar um defeito que já não está lá. **Um arquivo que some é pior que um arquivo errado:** o que fica, alguém lê e conserta; o que evapora faz a pessoa duvidar da própria medição. Medição de rascunho roda de **fora**, por `vite-node`, num script do rascunho; código inventado para provar uma régua vai como **texto dentro do próprio teste**. E a irmã dela, do mesmo dia: **escreva e meça na mesma volta, sem deixar respirar** — com cinco chats medindo, um arquivo mal-tipado deixado no disco por dois minutos vira vermelho em cinco telas. *Não é só não deixar respirar; é não pôr no pulmão dos outros.* Custou, em 22/09, uma caçada a um `zz-n.test.ts` que já tinha sido apagado |

## Como falar com o Humberto

Ele é disléxico. Frases curtas. Tabelas com colunas alinhadas. Resposta em poucas linhas. Trabalho em lotes: faz, testa, responde curto. Nada de plano longo na conversa: plano vai para `documentos/planos/`.

## Comandos do dia

```
npm run editor          abre o editor em desenvolvimento (porta 5173)
programa\Abrir o editor.bat   abre o editor montado (porta 5180)
npm test                roda todos os testes
npm run conformidade    roda os 46 casos no runtime de referência
npm run roteiro         os 14 passos do Roteiro dos 30 minutos (ferramentas/provas/)
npm run medir           nenhuma aba passa da coluna, em 1440×900 e 1280×720
python ferramentas/versao.py N.N "o que mudou"    guarda uma versão
python ferramentas/montar-programa.py             monta o editor em programa/
```

## Os papéis, quando há mais de um chat

| Papel | Faz |
|:---|:---|
| Pesquisador | lê os outros programas e os manuais; escreve em `documentos/pesquisa/` |
| Planejador | escreve o plano em `documentos/planos/`; não escreve código |
| Executor | executa o plano, lote a lote, uma versão por lote |
| Progresso | recebe o aviso de cada lote e repassa ao Humberto |

Desvio do plano: o executor escreve na seção "Desvios" no fim do plano. Nunca inventa por cima.
