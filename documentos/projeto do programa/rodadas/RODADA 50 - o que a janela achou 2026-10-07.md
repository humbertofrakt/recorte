# Rodada 50 — o que a janela de verdade achou

Ficha escrita pelo `DIRETOR · Diretor com monitoramento de chats [410edc]` em 07/10/2026, 13h27.
**Escreve código em `editor/`.** Mesmo chat da rodada 49 (tem a memória do que viu). Uma versão por lote, a partir da v36.2. Reporta a `Diretor com monitoramento de chats [410edc]`. Portas 5560/9560.

A fonte é o doc `98 A MAO PELA JANELA 2026-10-07.md` (47 fotos): a lista para a rodada 50 está no fim dele e manda. Aqui, só a ordem e a decisão de cada item.

| Lote | Item (doc 98) | O que tem de acontecer | Decisão |
|:---:|:---|:---|:---|
| 1 | **A aba solta da parede vira janela VAZIA** (corpo com `display:none`) e sobra uma aba "Ordem" órfã no grupo de origem | soltar da parede leva o corpo junto; o grupo de origem fica sem a aba | é o pior: um usuário perde o painel |
| 1 | **A barra arrastada volta sempre ao grupo de origem**, não aonde se solta | cola onde a linha azul mostrou | idem |
| 2 | **"Só este quadro" exporta GIF de 1 quadro**, não PNG | "Só este quadro" muda o formato para PNG (ou avisa e deixa escolher); o nome do arquivo bate | o Humberto quer uma imagem |
| 2 | **Abrir o herói com trabalho não salvo (•) troca SEM PERGUNTAR** e o rodapé diz "Arquivo salvo"; Reabrir o fechado devolve sem as imagens | a mesma janela de "mudanças não salvas" das outras portas (rodada 45); o rodapé nunca diz "salvo" quando não salvou; Reabrir o fechado volta com as imagens ou diz por quê | regra 21 |
| 3 | **Ctrl+C / Ctrl+V na linha do tempo copia as chaves de TODOS os tempos**, estica a animação para 1,5 s e o rodapé conta só parte | Ctrl+C copia as chaves ESCOLHIDAS (ou as do quadro, como o Spine); se vai esticar, pergunta ou avisa ANTES; o rodapé conta tudo | decisão pelo Spine |
| 3 | O passo 6 do roteiro: arrastar na Árvore prende sem mover | confira que é o esperado (a Árvore troca o pai sem mover: é a regra da casa) e que o rodapé diz | só confirmar |
| 4 | **O × da aba** só aparece na aba ativa, colado no nome, onde o olho procura o ▾ (o chat fechou Propriedades querendo recolher) · a linha azul de 2,4 px parece sublinhado · "Árvore fechado", "Ordem solto" | o × afastado do nome (ou à direita da tira, como o Photoshop fecha abas); a linha ativa mais grossa ou outra cor; concordância ("a Árvore fechada", "a Ordem solta") — é o que o Humberto circulou na foto de 06/10 | |
| 4 | Exportar/Importar skin ficam em Arquivo, não em Skins | porta também no menu Skins (a mesma ação) | |

Depois de cada lote: o conferente da rodada 39 (`CONFERINDO · rodada 39 …`) confere no montado, como sempre; **e você mesma reprova com o mouse de verdade no navegador do aplicativo** antes de pedir o fecho (foi assim que achou).

## As réguas

Semáforo (porta) · teste que falha antes, teste e função no mesmo golpe · fotos em `backup/fotos-obra/rodada-50/` · fecho completo (suíte, tsc, conformidade 120, roteiro, medir, pesos, CHANGELOG, ESTADO, `montar-programa.py <N.N que VAI fechar>`, `versao.py`, contagem; **abra o zip e leia o Sobre**) · nada em `runtime/`, `formato/`, `leitor-*` · backup antes, INDICE, relógio · não pergunte nada ao Humberto · 6 linhas por versão; "larguei a máquina" no fim.
