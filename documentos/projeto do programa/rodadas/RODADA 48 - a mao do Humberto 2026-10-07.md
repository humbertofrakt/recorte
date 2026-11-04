# Rodada 48 — o que a mão do Humberto achou

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 07/10/2026, 05h20.
**Escreve código em `editor/`.** Abre quando a rodada 47 largar a máquina. Uma versão por lote. Reporta a `Diretor com monitoramento de chats [410edc]`.
**Portas suas:** programa 5550, Chrome sem janela 9550.

O Humberto fez os itens do doc `89` com a mão, em 07/10 de manhã, e trouxe 3 fotos. O que ele achou vale acima de qualquer conferência sem janela.

| # | O que ele viu | Foto | O que tem de acontecer |
|:---:|:---|:---|:---|
| 1 | **Cor ao nascer não muda a barrinha de baixo** (Cor na vida): trocou as cores "de" e "a" e a faixa de Cor na vida ficou igual | `2.png`: a ficha do emissor, aba Cor, com "de ▮ ━ a ▮ ━" circulado e um "?" apontando a barra. **Confirmado pelo Diretor em 07/10, 05h22, no editor de desenvolvimento (localhost:5173), emissor Fogo:** os seletores de Cor ao nascer mostram **#ffffff** nos dois (o fogo não é branco); a barra de Cor na vida mostra um degradê amarelo→laranja e o rótulo diz "Só a Cor ao nascer / Sem cor na vida: vale a Cor ao nascer"; pus **#ff0000** em "de" e a barra **não mudou** (o degradê continuou amarelo→laranja). Ou seja: a barra não vem da Cor ao nascer como o rótulo afirma, e os seletores não mostram a cor real do fogo | Decida pelo Godot/Unity (color over lifetime parte da cor inicial, ou é independente?) e faça a tela dizer: ou a barra de Cor na vida **nasce da Cor ao nascer** quando não tem pontas próprias, ou a dica diz "a Cor na vida multiplica a Cor ao nascer" e a prévia mostra o resultado. **Nunca duas cores que não se falam sem dizer** |
| 2 | **Soltar uma pasta do Explorer na janela não abre a pasta**: abre o seletor do Windows perguntando a pasta | `4.png`: o seletor "Selecione onde este site pode salvar mudanças" em `exemplo/game`, com "?" | O arrasto de pasta usa o `getAsFileSystemHandle` do item solto e abre **aquela** pasta, sem perguntar. A rodada 45 não pôde provar sem janela: agora está provado que falta. Teste no módulo puro (o plano do drop) + a prova que só a mão dele fecha, dita no relatório |
| 3 | **176 avisos** na barra, no projeto `pularmachini` dele | `4.png`, canto de baixo | Abra os avisos: o que são (imagens não achadas? regras?). Se forem 176 vezes a mesma coisa, o resumo agrupa (como a rodada 45 fez para as imagens). Se forem avisos de verdade, a barra diz o pior primeiro |
| 4 | O seletor do Windows **funcionou**: Novo projeto pediu a pasta e gravou o `.bone` nela | — | nada a fazer; anote no doc `89` como funcionou |
| 5 | "Exportar imagem" **não existe com esse nome**: o menu é Arquivo → Exportar → **"GIF, PNG, folha, vídeo…"** | `3.png`: o menu Exportar aberto | O nome do menu é certo (diz os formatos); o errado foi o doc `89`. Confira só: sem pasta de projeto, esse item exporta para Downloads de verdade? Se não dá para provar sem janela, diga o passo exato para ele |

| 6 | Ressalvas da rodada 47 (doc `93`) | — | a Ordem em 1280×720 mostra 2 linhas inteiras (lista de 81 px, linhas de 31): ache os 31 px da 3ª; o campo "Texto" da chave de evento sem dica (rótulo e caixa) |

## As réguas

Semáforo (porta) · teste que falha antes, teste e função no mesmo golpe · fotos em `backup/fotos-obra/rodada-48/` · fecho completo (suíte, tsc, conformidade 120, roteiro, medir, pesos, CHANGELOG, ESTADO, montar, versao.py, contagem) · nada em `runtime/`, `formato/`, `leitor-*` · backup antes, INDICE, relógio · não pergunte nada ao Humberto: o que o Godot/Unity respondem, decida e escreva a suposição. Relatório de 6 linhas por versão; "larguei a máquina" no fim.
